# sniffer_dashboard.py — Live terminal dashboard  (light / white theme)
#
# Keyboard shortcuts (active while dashboard is running)
# ─────────────────────────────────────────────────────────
#   Q        Quit and show session summary
#   P        Pause / Resume the packet stream display
#   C        Clear the packet log  (counters are kept)
#   F        Open / close the protocol filter dropdown
#   ↑ ↓      Navigate dropdown options
#   Enter    Confirm selected filter
#   Esc      Close dropdown without changing filter
#   1-4      Quick-select filter without opening dropdown
#
# Mouse support
# ─────────────────────────────────────────────────────────
#   Click "WHAT IS BEING SENT? [F] ▼"  →  opens the dropdown
#   Click any option row in the dropdown  →  selects that filter
#
# Thread model
# ────────────
#   sniff thread  ──(lock)──►  shared state  ◄──  main render thread (Rich Live)
#   kbd thread    ──────────►  _stop / _paused / _proto_filter / _dropdown_*
#
# Windows console note
# ────────────────────
#   SetConsoleMode(..., 7) enables Virtual Terminal Processing BEFORE Rich loads
#   so Rich uses ANSI escape-sequence rendering (one write per frame) instead of
#   the Win32 API character-by-character fallback that causes flickering.
import itertools
import socket
import struct
import sys
import threading
import time
from collections import Counter, defaultdict, deque

# ── Windows: ANSI mode + UTF-8 (must run before Rich imports) ────────────────
if sys.platform == 'win32':
    import ctypes
    _k32 = ctypes.windll.kernel32
    _k32.SetConsoleMode(_k32.GetStdHandle(-11), 7)
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from rich import box
from rich.console import Console
from rich.layout  import Layout
from rich.live    import Live
from rich.panel   import Panel
from rich.table   import Table
from rich.text    import Text


# ══════════════════════════════════════════════════════════════════════════════
#  LIGHT THEME — dark text on white background
# ══════════════════════════════════════════════════════════════════════════════

_C_TITLE  = 'bold dark_green'
_C_LABEL  = 'dark_green'
_C_VALUE  = 'bold black'
_C_DIM    = 'grey50'
_C_BORDER = 'dark_green'

_PROTO_COLOR: dict[str, str] = {
    'TCP':   'dark_green',
    'UDP':   'dark_cyan',
    'ICMP':  'grey46',
    'OTHER': 'grey39',
}

# Filter dropdown options — (key, proto_id, short label, long description)
_FILTER_OPTIONS: list[tuple[str, str, str, str]] = [
    ('1', 'ALL',  'All Traffic',
     'Show every packet on your network — nothing filtered out'),
    ('2', 'TCP',  'Web & Files  (TCP)',
     'Websites, email, file downloads — reliable ordered delivery'),
    ('3', 'UDP',  'Video & DNS  (UDP)',
     'Video calls, gaming, DNS lookups — fast, no guaranteed delivery'),
    ('4', 'ICMP', 'Ping & Health  (ICMP)',
     'Ping commands, traceroute, and network reachability checks'),
]

_PROTO_FRIENDLY: dict[str, str] = {
    opt[1]: opt[2] for opt in _FILTER_OPTIONS
}

# Mouse click layout offsets (0-indexed terminal rows).
# Layout: header size=4, then left panel top border, then content rows.
# Counted from top: header(4) + panel-border(1) + NETWORK-ACTIVITY-title(1)
# + divider(1) + 4-data-rows(4) + blank-before-section(1) = row 12 for title.
_DROPDOWN_TITLE_ROW  = 12  # row of "WHAT IS BEING SENT?" heading
_DROPDOWN_FIRST_ROW  = 14  # row of first option label when dropdown is open
_DROPDOWN_ROW_HEIGHT =  3  # rows per option: label + description + blank line

_FLAG_READABLE: dict[str, str] = {
    'S':  'Opening connection',
    'SA': 'Connection accepted',
    'A':  'Active / data transfer',
    'PA': 'Sending data',
    'FA': 'Closing connection',
    'F':  'Closing connection',
    'R':  'Reset / Error',
    'RA': 'Reset / Error',
}

_SPIN_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
_SPARK_CHARS = ' ▁▂▃▄▅▆▇█'

_TIPS = [
    'Press [F] to open the filter dropdown and choose which traffic type to focus on.',
    'TCP (Web & Files) is used by websites, email, and file downloads.',
    'UDP (Video & DNS) is used by video calls, gaming, and DNS lookups.',
    'ICMP (Ping & Health) is used by the ping command to check device reachability.',
    'MOST ACTIVE DEVICES shows which computers or servers are sending the most data.',
    'TRAFFIC SPEED GRAPH shows packets per second — spikes mean heavy network activity.',
    'Press [P] to freeze the stream without stopping capture — no packets are missed.',
    'SECURITY NOTE: Only monitor networks you own or have explicit permission to test.',
]
_TIP_INTERVAL_S = 6


# ══════════════════════════════════════════════════════════════════════════════
#  TUNABLE CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════

_STREAM_MAXLEN  = 100
_TOP_IPS_N      = 6
_REFRESH_HZ     = 4
_RATE_WINDOW_S  = 3.0
_SOCK_TIMEOUT_S = 0.25
_SPARKLINE_W    = 24


# ══════════════════════════════════════════════════════════════════════════════
#  SHARED STATE
# ══════════════════════════════════════════════════════════════════════════════

_lock                       = threading.Lock()
_stats: dict[str, int]      = defaultdict(int)
_top_src: Counter[str]      = Counter()
_pkt_log: deque[dict]       = deque(maxlen=_STREAM_MAXLEN)
_ts_ring: deque[float]      = deque(maxlen=5000)

_ts_by_proto: dict[str, deque[float]] = {
    'TCP':  deque(maxlen=5000),
    'UDP':  deque(maxlen=5000),
    'ICMP': deque(maxlen=5000),
}
_rate_hist: dict[str, deque[float]] = {
    p: deque(maxlen=_SPARKLINE_W * 4) for p in ('ALL', 'TCP', 'UDP', 'ICMP')
}

# Atomic string/list/bool — CPython GIL makes reference reassignment safe.
_frozen_log: list[dict] = []
_proto_filter:    str   = 'ALL'
_dropdown_open:   bool  = False
_dropdown_cursor: int   = 0          # index into _FILTER_OPTIONS

# Click-flash animation state — set by _handle_mouse, cleared by timer
_click_flash_idx: int   = -1         # which option is flashing (-1 = none)
_click_flash_ts:  float = 0.0        # monotonic time the click happened
_FLASH_SECS             = 0.40       # how long the flash lasts (≥ 1 render frame)

_seq      = 0
_stop     = threading.Event()
_paused   = threading.Event()
_start_ts = time.monotonic()


# ══════════════════════════════════════════════════════════════════════════════
#  LOOKUP TABLES
# ══════════════════════════════════════════════════════════════════════════════

_TCP_SVCS: dict[int, str] = {
    21: 'FTP',    22: 'SSH',    23: 'Telnet',  25: 'SMTP',   53: 'DNS',
    80: 'HTTP',  110: 'POP3',  143: 'IMAP',   443: 'HTTPS', 465: 'SMTPS',
    993: 'IMAPS', 995: 'POP3S', 3306: 'MySQL', 3389: 'RDP',  5432: 'PgSQL',
    8080: 'HTTP-alt', 8443: 'HTTPS-alt',
}
_UDP_SVCS: dict[int, str] = {
    53: 'DNS', 67: 'DHCP', 123: 'NTP', 161: 'SNMP', 5353: 'mDNS',
}
_ICMP_LABELS: dict[int, str] = {
    0: 'Echo Reply', 3: 'Unreachable', 8: 'Echo Request', 11: 'TTL Expired',
}


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER PARSERS
# ══════════════════════════════════════════════════════════════════════════════

def _parse_eth(data: bytes) -> tuple[int, bytes]:
    return struct.unpack('!H', data[12:14])[0], data[14:]


def _parse_ip(data: bytes) -> tuple[str, str, int, bytes]:
    if len(data) < 20:
        raise ValueError('truncated IPv4 header')
    ihl = (data[0] & 0x0F) * 4
    if ihl < 20:
        raise ValueError(f'invalid IHL: {ihl}')
    proto = data[9]
    src   = socket.inet_ntoa(data[12:16])
    dst   = socket.inet_ntoa(data[16:20])
    return src, dst, proto, data[ihl:]


def _tcp_meta(l4: bytes) -> tuple[int, int, str]:
    sp, dp, _, _, off_flags = struct.unpack('!HHIIH', l4[:14])
    raw   = off_flags & 0x1FF
    flags = ''.join(
        c for c, b in [('F', 0x001), ('S', 0x002), ('R', 0x004),
                       ('P', 0x008), ('A', 0x010), ('U', 0x020)]
        if raw & b
    ) or '-'
    return sp, dp, flags


def _udp_ports(l4: bytes) -> tuple[int, int]:
    return struct.unpack('!HH', l4[:4])


# ══════════════════════════════════════════════════════════════════════════════
#  KEYBOARD THREAD
# ══════════════════════════════════════════════════════════════════════════════

def _handle_key(ch: str) -> None:
    global _frozen_log, _proto_filter, _dropdown_open, _dropdown_cursor

    # ── dropdown navigation ──────────────────────────────────────────────────
    if _dropdown_open:
        if ch == 'up':
            _dropdown_cursor = max(0, _dropdown_cursor - 1)
        elif ch == 'down':
            _dropdown_cursor = min(len(_FILTER_OPTIONS) - 1, _dropdown_cursor + 1)
        elif ch in ('enter', '\r', ' '):
            _proto_filter   = _FILTER_OPTIONS[_dropdown_cursor][1]
            _dropdown_open  = False
        elif ch in ('esc', 'f', 'q'):
            # Q closes dropdown first; a second Q will quit
            _dropdown_open = False
        return   # swallow all other keys while dropdown is open

    # ── normal key handling ──────────────────────────────────────────────────
    if ch == 'q':
        _stop.set()
    elif ch == 'f':
        # Open dropdown, pre-select cursor at the current active filter
        _dropdown_cursor = next(
            (i for i, opt in enumerate(_FILTER_OPTIONS) if opt[1] == _proto_filter), 0
        )
        _dropdown_open = True
    elif ch == 'p':
        if _paused.is_set():
            _paused.clear()
            _frozen_log = []
        else:
            with _lock:
                _frozen_log = list(_pkt_log)
            _paused.set()
    elif ch == 'c':
        with _lock:
            _pkt_log.clear()
        _frozen_log = []
    # Quick-select filter without opening dropdown
    elif ch == '1':
        _proto_filter = 'ALL'
    elif ch == '2':
        _proto_filter = 'TCP'
    elif ch == '3':
        _proto_filter = 'UDP'
    elif ch == '4':
        _proto_filter = 'ICMP'


def _mouse_click_close() -> None:
    """Timer callback — called after click-flash expires to close the dropdown."""
    global _dropdown_open, _click_flash_idx
    _dropdown_open   = False
    _click_flash_idx = -1


def _handle_mouse(col: int, row: int) -> None:
    """Process a left-click at (col, row) in 0-indexed terminal coordinates."""
    global _proto_filter, _dropdown_open, _dropdown_cursor, _click_flash_idx, _click_flash_ts
    if _dropdown_open:
        rel = row - _DROPDOWN_FIRST_ROW
        if rel >= 0:
            idx = rel // _DROPDOWN_ROW_HEIGHT
            if 0 <= idx < len(_FILTER_OPTIONS):
                _proto_filter    = _FILTER_OPTIONS[idx][1]
                _click_flash_idx = idx
                _click_flash_ts  = time.monotonic()
                # Keep dropdown open for the flash animation, then auto-close
                t = threading.Timer(_FLASH_SECS, _mouse_click_close)
                t.daemon = True
                t.start()
                return
        _dropdown_open = False  # click outside option area closes without changing
    else:
        # Clicking the "WHAT IS BEING SENT?" title or divider opens the dropdown
        if _DROPDOWN_TITLE_ROW <= row <= _DROPDOWN_TITLE_ROW + 1:
            _dropdown_cursor = next(
                (i for i, opt in enumerate(_FILTER_OPTIONS) if opt[1] == _proto_filter), 0
            )
            _dropdown_open = True


def _keyboard_thread() -> None:
    if sys.platform == 'win32':
        import ctypes
        import ctypes.wintypes as _wt

        _K32  = ctypes.windll.kernel32
        _H_IN = _K32.GetStdHandle(-10)  # STD_INPUT_HANDLE

        # Enable mouse input and disable Quick Edit Mode.
        # Quick Edit Mode (0x0040) intercepts all mouse clicks for text
        # selection — applications never see them unless it's disabled.
        # ENABLE_EXTENDED_FLAGS (0x0080) must also be set for the Quick Edit
        # change to take effect.  Restore the original mode when we exit.
        _cur_mode = _wt.DWORD(0)
        _K32.GetConsoleMode(_H_IN, ctypes.byref(_cur_mode))
        _new_mode = (_cur_mode.value | 0x0010 | 0x0080) & ~0x0040
        _K32.SetConsoleMode(_H_IN, _new_mode)

        # ctypes structures matching the Windows INPUT_RECORD layout
        class _COORD(ctypes.Structure):
            _fields_ = [('X', ctypes.c_short), ('Y', ctypes.c_short)]

        class _KEY_REC(ctypes.Structure):
            _fields_ = [
                ('bKeyDown',          _wt.BOOL),
                ('wRepeatCount',      _wt.WORD),
                ('wVirtualKeyCode',   _wt.WORD),
                ('wVirtualScanCode',  _wt.WORD),
                ('uChar',             ctypes.c_wchar),
                ('dwControlKeyState', _wt.DWORD),
            ]

        class _MOUSE_REC(ctypes.Structure):
            _fields_ = [
                ('dwMousePosition',   _COORD),
                ('dwButtonState',     _wt.DWORD),
                ('dwControlKeyState', _wt.DWORD),
                ('dwEventFlags',      _wt.DWORD),
            ]

        class _EvUnion(ctypes.Union):
            _fields_ = [
                ('KeyEvent',   _KEY_REC),
                ('MouseEvent', _MOUSE_REC),
                ('_pad',       ctypes.c_byte * 16),
            ]

        class _INPUT_RECORD(ctypes.Structure):
            _fields_ = [('EventType', _wt.WORD), ('Event', _EvUnion)]

        VK_UP   = 0x26
        VK_DOWN = 0x28
        buf     = _INPUT_RECORD()
        n_read  = _wt.DWORD(0)

        try:
            while not _stop.is_set():
                # Block up to 100 ms for any console input event
                if _K32.WaitForSingleObject(_H_IN, 100) != 0:
                    continue
                if not _K32.ReadConsoleInputW(_H_IN, ctypes.byref(buf), 1, ctypes.byref(n_read)):
                    continue
                if n_read.value == 0:
                    continue

                if buf.EventType == 1:  # KEY_EVENT
                    ke = buf.Event.KeyEvent
                    if not ke.bKeyDown:
                        continue
                    vk = ke.wVirtualKeyCode
                    ch = ke.uChar
                    if   vk == VK_UP:   _handle_key('up')
                    elif vk == VK_DOWN: _handle_key('down')
                    elif ch == '\r':    _handle_key('enter')
                    elif ch == '\x1b':  _handle_key('esc')
                    elif ch:            _handle_key(ch.lower())

                elif buf.EventType == 2:  # MOUSE_EVENT
                    me = buf.Event.MouseEvent
                    # dwEventFlags==0 means button press (not move, scroll, or double-click)
                    if me.dwEventFlags == 0 and (me.dwButtonState & 0x0001):
                        _handle_mouse(me.dwMousePosition.X, me.dwMousePosition.Y)
        finally:
            _K32.SetConsoleMode(_H_IN, _cur_mode.value)  # restore original mode

    else:
        import select, termios, tty
        fd        = sys.stdin.fileno()
        old_attrs = termios.tcgetattr(fd)
        try:
            tty.setraw(fd)
            sys.stdout.write('\x1b[?1000h')  # enable X10 mouse click reporting
            sys.stdout.flush()
            while not _stop.is_set():
                ready, _, _ = select.select([sys.stdin], [], [], 0.1)
                if not ready:
                    continue
                ch = sys.stdin.read(1)
                if ch == '\x1b':
                    r2, _, _ = select.select([sys.stdin], [], [], 0.05)
                    if r2:
                        seq = sys.stdin.read(2)
                        if   seq == '[A': _handle_key('up')
                        elif seq == '[B': _handle_key('down')
                        elif seq == '[M':
                            # X10 mouse: 3 bytes — button, col+33, row+33 (1-indexed)
                            r3, _, _ = select.select([sys.stdin], [], [], 0.05)
                            if r3:
                                m = sys.stdin.read(3)
                                if len(m) == 3:
                                    btn = ord(m[0]) - 32
                                    col = ord(m[1]) - 33  # convert to 0-indexed
                                    row = ord(m[2]) - 33
                                    if btn == 0:  # left button press
                                        _handle_mouse(col, row)
                        else:
                            _handle_key('esc')
                    else:
                        _handle_key('esc')
                elif ch == '\r':
                    _handle_key('enter')
                else:
                    _handle_key(ch.lower())
        finally:
            sys.stdout.write('\x1b[?1000l')  # disable mouse reporting on exit
            sys.stdout.flush()
            termios.tcsetattr(fd, termios.TCSADRAIN, old_attrs)


# ══════════════════════════════════════════════════════════════════════════════
#  SNIFF THREAD
# ══════════════════════════════════════════════════════════════════════════════

def _sniff_loop(sock: socket.socket, platform: str) -> None:
    global _seq
    sock.settimeout(_SOCK_TIMEOUT_S)

    while not _stop.is_set():
        try:
            raw, _ = sock.recvfrom(65535)
        except socket.timeout:
            continue
        except OSError:
            break

        ts  = time.strftime('%H:%M:%S')
        now = time.monotonic()

        if platform == 'linux':
            try:
                ethertype, ip_data = _parse_eth(raw)
                if ethertype != 0x0800:
                    continue
            except Exception:
                continue
        else:
            ip_data = raw

        try:
            src_ip, dst_ip, proto, l4 = _parse_ip(ip_data)
        except Exception:
            continue

        sp = dp = 0
        flags      = '-'
        proto_name = 'OTHER'
        svc        = ''

        if proto == 6 and len(l4) >= 14:
            proto_name    = 'TCP'
            sp, dp, flags = _tcp_meta(l4)
            svc           = _TCP_SVCS.get(dp) or _TCP_SVCS.get(sp) or ''
        elif proto == 17 and len(l4) >= 4:
            proto_name = 'UDP'
            sp, dp     = _udp_ports(l4)
            svc        = _UDP_SVCS.get(dp) or _UDP_SVCS.get(sp) or ''
        elif proto == 1 and l4:
            proto_name = 'ICMP'
            flags      = _ICMP_LABELS.get(l4[0], f'Type {l4[0]}')

        src_str = f'{src_ip}:{sp}' if sp else src_ip
        dst_str = f'{dst_ip}:{dp}' if dp else dst_ip

        with _lock:
            _seq += 1
            n = _seq
            _stats['total']    += 1
            _stats[proto_name] += 1
            _stats['bytes']    += len(raw)
            _top_src[src_ip]   += 1
            _ts_ring.append(now)
            if proto_name in _ts_by_proto:
                _ts_by_proto[proto_name].append(now)
            _pkt_log.append({
                'n': n, 'ts': ts, 'proto': proto_name,
                'src': src_str, 'dst': dst_str,
                'flags': flags, 'size': len(raw), 'svc': svc,
            })


def _open_socket() -> tuple[socket.socket, str]:
    if sys.platform == 'win32':
        host = socket.gethostbyname(socket.gethostname())
        s    = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_IP)
        s.bind((host, 0))
        s.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
        s.ioctl(socket.SIO_RCVALL, socket.RCVALL_ON)
        return s, 'win32'
    return socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003)), 'linux'


# ══════════════════════════════════════════════════════════════════════════════
#  DISPLAY HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _fmt_bytes(n: int) -> str:
    for unit, div in (('GB', 1 << 30), ('MB', 1 << 20), ('KB', 1 << 10)):
        if n >= div:
            return f'{n / div:.1f} {unit}'
    return f'{n} B'


def _fmt_uptime(elapsed: float) -> str:
    h, rem = divmod(int(elapsed), 3600)
    m, s   = divmod(rem, 60)
    return f'{h:02d}:{m:02d}:{s:02d}'


def _block_bar(value: int, total: int, width: int = 14) -> str:
    filled = int(width * value / total) if total else 0
    return '█' * filled + '░' * (width - filled)


def _pkt_rate(proto: str = 'ALL') -> float:
    cutoff = time.monotonic() - _RATE_WINDOW_S
    with _lock:
        ring  = _ts_ring if proto == 'ALL' else _ts_by_proto.get(proto, deque())
        count = sum(1 for t in ring if t >= cutoff)
    return count / _RATE_WINDOW_S


def _sparkline(history: deque[float], width: int = _SPARKLINE_W) -> str:
    vals = list(history)[-width:]
    if not vals:
        return '░' * width
    max_v = max(vals) or 1
    chars = [_SPARK_CHARS[min(8, int(v * 8 / max_v))] for v in vals]
    return ''.join(chars).rjust(width, '░')


def _flag_label(flags: str, proto: str) -> str:
    if proto == 'ICMP':
        return flags
    return _FLAG_READABLE.get(flags, flags) if flags != '-' else '-'


# ══════════════════════════════════════════════════════════════════════════════
#  PANEL BUILDERS
# ══════════════════════════════════════════════════════════════════════════════

_spinner = itertools.cycle(_SPIN_FRAMES)


def _header_panel() -> Panel:
    paused = _paused.is_set()
    filt   = _proto_filter
    spin   = next(_spinner)
    clock  = time.strftime('%Y-%m-%d  %H:%M:%S')
    rate   = _pkt_rate()
    uptime = _fmt_uptime(time.monotonic() - _start_ts)

    with _lock:
        total = _stats['total']
        byt   = _stats['bytes']

    title = Text(justify='center')
    title.append('  ◉  NETWORK TRAFFIC MONITOR', style='bold white')
    title.append('  ·  Watching all data flowing through your network  ·  ', style='white')
    title.append(clock, style='bright_white')
    title.append(f'  {spin}  ', style='bright_white')

    if paused:
        badge_text, badge_style = '  ⏸  PAUSED  ', 'bold white on grey50'
    else:
        badge_text, badge_style = '  ●  LIVE  ', 'bold white on dark_green'

    status = Text(justify='center')
    status.append(badge_text, style=badge_style)
    if filt != 'ALL':
        clr = _PROTO_COLOR.get(filt, 'dark_green')
        status.append(f'  FILTER: {_PROTO_FRIENDLY.get(filt, filt)}  ', style=f'bold white on {clr}')
    status.append(f'  Running for {uptime}', style='black')
    status.append('  |  ', style=_C_DIM)
    status.append(f'{rate:.1f} packets/sec', style='bold black')
    status.append('  |  ', style=_C_DIM)
    status.append(f'{total:,} captured', style='bold black')
    status.append('  |  ', style=_C_DIM)
    status.append(_fmt_bytes(byt) + ' seen', style='bold black')

    body = Text()
    body.append_text(title)
    body.append('\n')
    body.append_text(status)

    return Panel(body, style='on dark_green', border_style='dark_green',
                 box=box.HEAVY, padding=(0, 1))


def _stats_panel() -> Panel:
    with _lock:
        total = _stats['total']
        tcp   = _stats['TCP']
        udp   = _stats['UDP']
        icmp  = _stats['ICMP']
        other = _stats['OTHER']
        byt   = _stats['bytes']
        top   = _top_src.most_common(_TOP_IPS_N)

    rate   = _pkt_rate()
    uptime = _fmt_uptime(time.monotonic() - _start_ts)

    t = Text()

    t.append(' NETWORK ACTIVITY\n', style=_C_TITLE)
    t.append(' ' + '─' * 26 + '\n', style=_C_DIM)
    for label, val in [
        ('Packets captured', f'{total:,}'),
        ('Network speed',    f'{rate:.1f} / sec'),
        ('Total data seen',  _fmt_bytes(byt)),
        ('Running for',      uptime),
    ]:
        t.append(f' {label:<18}', style=_C_LABEL)
        t.append(f'{val}\n',      style=_C_VALUE)

    if _dropdown_open:
        now = time.monotonic()
        t.append('\n WHAT IS BEING SENT?  ', style=_C_TITLE)
        t.append('▲  Esc to close\n', style='dim dark_green')
        t.append(' ' + '─' * 26 + '\n', style=_C_DIM)
        for i, (key, proto, label, desc) in enumerate(_FILTER_OPTIONS):
            is_active = (proto == _proto_filter)
            is_cursor = (i == _dropdown_cursor)
            is_flash  = (i == _click_flash_idx and now - _click_flash_ts < _FLASH_SECS)

            if is_flash:
                # Click-press animation — bright green glow for _FLASH_SECS
                t.append(f'  ✓ [{key}] {label}', style='bold black on bright_green')
                t.append('\n')
                t.append(f'      {desc}\n', style='dark_green on bright_green')
            elif is_cursor and is_active:
                # Cursor sitting on the currently-selected option
                t.append(f' ► [{key}] {label}  ✓', style='bold white on dark_green')
                t.append('\n')
                t.append(f'     {desc}\n', style='dark_green')
            elif is_cursor:
                # Keyboard/navigation cursor
                t.append(f' ► [{key}] {label}', style='bold white on dark_green')
                t.append('\n')
                t.append(f'     {desc}\n', style='dark_green')
            elif is_active:
                # Active filter (cursor is on a different row)
                t.append(f' ✓ [{key}] {label}', style='bold dark_green')
                t.append('\n')
                t.append(f'     {desc}\n', style='dark_green')
            else:
                # Normal unselected option
                t.append(f'   [{key}] {label}', style='bold black')
                t.append('\n')
                t.append(f'     {desc}\n', style=_C_DIM)
            t.append('\n')
        t.append(' ↑↓ Navigate   Enter Select   Esc Cancel\n', style=_C_DIM)
    else:
        active = _proto_filter
        t.append('\n WHAT IS BEING SENT?  ', style=_C_TITLE)
        t.append('[F] ▼\n', style='dim dark_green')
        t.append(' ' + '─' * 26 + '\n', style=_C_DIM)
        for proto_key, friendly, count, color in [
            ('TCP',  'Web & Files  (TCP) ', tcp,   'dark_green'),
            ('UDP',  'Video & DNS  (UDP) ', udp,   'dark_cyan'),
            ('ICMP', 'Ping/Health  (ICMP)', icmp,  'grey46'),
            (None,   'Other               ', other, 'grey39'),
        ]:
            is_active_row = (proto_key is not None and active == proto_key)
            pct = count * 100 // total if total else 0
            bar = _block_bar(count, total, 12)
            if is_active_row:
                t.append(f' {friendly}  ', style='bold dark_green')
                t.append(bar,              style=color)
                t.append(f' {pct:>3}% ●\n', style='bold dark_green')
            else:
                t.append(f' {friendly}  ', style=_C_LABEL)
                t.append(bar,              style=color)
                t.append(f' {pct:>3}%\n',  style=_C_DIM)

    t.append('\n LIVE ACTIVITY GRAPH  (last ~8s)\n', style=_C_TITLE)
    t.append(' ' + '─' * 26 + '\n', style=_C_DIM)
    for proto, color, label in [
        ('ALL',  'dark_green', 'All  '),
        ('TCP',  'dark_green', 'Web  '),
        ('UDP',  'dark_cyan',  'Video'),
        ('ICMP', 'grey46',     'Ping '),
    ]:
        r     = _pkt_rate(proto)
        spark = _sparkline(_rate_hist[proto], _SPARKLINE_W - 2)
        t.append(f' {label}  ', style=_C_LABEL)
        t.append(spark,          style=color)
        t.append(f'  {r:4.1f}/s\n', style=_C_VALUE)

    t.append('\n MOST ACTIVE DEVICES\n', style=_C_TITLE)
    t.append(' ' + '─' * 26 + '\n', style=_C_DIM)
    if top:
        max_n = top[0][1]
        for ip, n in top:
            bar = _block_bar(n, max_n, 10)
            t.append(f' {ip:<18}', style='black')
            t.append(bar,          style='dark_green')
            t.append(f' {n:>5}\n', style=_C_VALUE)
    else:
        t.append(' Waiting for network traffic...\n', style=_C_DIM)

    return Panel(t, border_style=_C_BORDER, box=box.ROUNDED,
                 style='on bright_white', padding=(0, 0))


def _stream_panel() -> Panel:
    paused = _paused.is_set()
    filt   = _proto_filter

    if paused:
        rows = list(_frozen_log)
    else:
        with _lock:
            rows = list(_pkt_log)

    total_rows = len(rows)
    if filt != 'ALL':
        rows = [r for r in rows if r['proto'] == filt]

    tbl = Table(
        show_header=True,
        header_style='bold white on dark_green',
        border_style='dark_green',
        box=box.SIMPLE_HEAD,
        row_styles=['black on bright_white', 'black on grey93'],
        expand=True,
        padding=(0, 1),
    )
    tbl.add_column('#',              style='grey50',      width=6,  justify='right')
    tbl.add_column('Time',           style='dark_green',  width=10)
    tbl.add_column('Protocol',       width=9,             justify='center')
    tbl.add_column('From (sender)',  style='black',       ratio=5)
    tbl.add_column('To (receiver)',  style='black',       ratio=5)
    tbl.add_column('Status',         style='grey39',      width=20)
    tbl.add_column('Size',           style='black',       width=7,  justify='right')
    tbl.add_column('App / Service',  style='dark_green',  width=12)

    for pkt in reversed(rows):
        proto  = pkt['proto']
        color  = _PROTO_COLOR.get(proto, 'black')
        badge  = Text(f' {proto:<6}', style=f'bold {color}')
        status = _flag_label(pkt['flags'], proto)
        tbl.add_row(
            str(pkt['n']),
            pkt['ts'],
            badge,
            pkt['src'],
            pkt['dst'],
            status,
            f"{pkt['size']} B",
            pkt['svc'] or '',
        )

    if filt == 'ALL':
        title = '[bold dark_green] ALL TRAFFIC [/][grey50]— every packet on your network[/]'
    else:
        friendly = _PROTO_FRIENDLY.get(filt, filt)
        clr      = _PROTO_COLOR.get(filt, 'dark_green')
        shown    = f'{len(rows)} of {total_rows}'
        title    = (f'[bold {clr}] {friendly.upper()} [/]'
                    f'[grey50]— showing {shown} packets[/]')
    if paused:
        title += '  [bold grey50]  FROZEN  [/]'

    border = 'grey50' if paused else 'dark_green'
    return Panel(tbl, title=title, border_style=border, box=box.ROUNDED,
                 style='on bright_white', padding=(0, 0))


def _footer_panel(platform: str) -> Panel:
    paused  = _paused.is_set()
    filt    = _proto_filter
    dd_open = _dropdown_open
    uptime  = _fmt_uptime(time.monotonic() - _start_ts)

    pause_label = 'RESUME' if paused else 'PAUSE'
    pause_icon  = '▶' if paused else '⏸'
    p_style     = 'bold white on grey50' if paused else 'bold white on dark_cyan'
    f_style     = 'bold white on dark_green' if dd_open else 'bold white on grey46'

    t = Text()

    # ── Rows 1–3: control buttons ─────────────────────────────────────────────
    btns = [
        (14, 'bold white on dark_red',  f' STOP [Q] '),
        (18, p_style,                   f' {pause_icon} {pause_label} [P] '),
        (14, 'bold white on dark_cyan',  ' CLEAR [C] '),
        (18, f_style,                   ' FILTER [F] ▼ '),
    ]
    SEP = '   '

    for edge in ('top', 'mid', 'bot'):
        t.append('  ')
        for i, (w, style, label) in enumerate(btns):
            if edge == 'top':
                t.append('╭' + '─' * w + '╮', style='dim grey50')
            elif edge == 'mid':
                t.append('│', style='dim grey50')
                t.append(label.center(w), style=style)
                t.append('│', style='dim grey50')
            else:
                t.append('╰' + '─' * w + '╯', style='dim grey50')
            if i < len(btns) - 1:
                t.append(SEP)
        if edge == 'mid':
            t.append('    ')
            if paused:
                t.append('  ⏸  PAUSED  ', style='bold white on grey50')
            else:
                t.append('  ●  LIVE  ', style='bold white on dark_green')
            t.append(f'  {uptime}', style='black')
        t.append('\n')

    # ── Row 4: current filter indicator + quick keys ──────────────────────────
    t.append('\n  Active filter:  ', style=_C_LABEL)
    filt_label = _PROTO_FRIENDLY.get(filt, filt)
    filt_color = _PROTO_COLOR.get(filt, 'dark_green')
    t.append(f'  {filt_label}  ', style=f'bold white on {filt_color}')
    t.append('     Quick switch: ', style=_C_DIM)
    for key, proto, label, _ in _FILTER_OPTIONS:
        active = (filt == proto)
        clr    = _PROTO_COLOR.get(proto, 'dark_green')
        if active:
            t.append(f' [{key}] ', style=f'bold white on {clr}')
        else:
            t.append(f' [{key}] ', style='grey50')
    t.append('\n')

    # ── Row 5: legend ─────────────────────────────────────────────────────────
    t.append('  ', style='white')
    t.append('TCP', style='bold dark_green');  t.append(' = websites, email & downloads    ', style='grey50')
    t.append('UDP', style='bold dark_cyan');   t.append(' = video calls, gaming & DNS    ', style='grey50')
    t.append('ICMP', style='bold grey46');     t.append(' = ping & health checks\n', style='grey50')

    # ── Row 6: rotating tip ───────────────────────────────────────────────────
    tip_idx = int(time.monotonic() / _TIP_INTERVAL_S) % len(_TIPS)
    t.append('  TIP  ', style='bold dark_green')
    t.append(_TIPS[tip_idx], style='grey39')

    border = 'dark_green' if not dd_open else 'grey46'
    return Panel(t, border_style=border, box=box.HEAVY,
                 style='on bright_white', padding=(0, 1))


# ══════════════════════════════════════════════════════════════════════════════
#  LAYOUT ASSEMBLY
# ══════════════════════════════════════════════════════════════════════════════

def _build_layout(platform: str) -> Layout:
    root = Layout()
    root.split_column(
        Layout(name='header', size=4),
        Layout(name='body'),
        Layout(name='footer', size=10),
    )
    root['body'].split_row(
        Layout(name='left',   ratio=1),
        Layout(name='stream', ratio=3),
    )
    root['header'].update(_header_panel())
    root['left'].update(_stats_panel())
    root['stream'].update(_stream_panel())
    root['footer'].update(_footer_panel(platform))
    return root


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    console = Console(legacy_windows=False, highlight=False)

    console.print('[bold dark_green]Opening network monitor — requires administrator privileges...[/]')
    try:
        sock, platform = _open_socket()
    except PermissionError:
        console.print(
            '[bold red]Permission denied.[/]\n'
            '  Windows -> Double-click launch.bat and choose "Run as administrator"\n'
            '  Linux   -> Run:  sudo python3 sniffer_dashboard.py'
        )
        sys.exit(1)

    console.print(f'[dark_green]Connected on [bold]{platform}[/]. Starting dashboard...[/]')
    time.sleep(0.4)

    sniff_thread = threading.Thread(target=_sniff_loop,      args=(sock, platform), daemon=True)
    kbd_thread   = threading.Thread(target=_keyboard_thread, daemon=True)
    sniff_thread.start()
    kbd_thread.start()

    _last_sample = time.monotonic()

    try:
        with Live(console=console, refresh_per_second=_REFRESH_HZ, screen=True) as live:
            while not _stop.is_set():
                now = time.monotonic()
                if now - _last_sample >= (1 / _REFRESH_HZ):
                    for proto in ('ALL', 'TCP', 'UDP', 'ICMP'):
                        _rate_hist[proto].append(_pkt_rate(proto))
                    _last_sample = now
                live.update(_build_layout(platform))
                time.sleep(1 / _REFRESH_HZ)

    except KeyboardInterrupt:
        _stop.set()
    finally:
        _stop.set()
        if platform == 'win32':
            sock.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
        sock.close()
        sniff_thread.join(timeout=1.0)

    with _lock:
        total = _stats['total']
        tcp   = _stats['TCP']
        udp   = _stats['UDP']
        icmp  = _stats['ICMP']
        other = _stats['OTHER']
        byt   = _stats['bytes']

    elapsed = time.monotonic() - _start_ts
    console.print()
    console.rule('[bold dark_green]  Session Summary  [/]', style='dark_green')
    for label, val in [
        ('Duration',          _fmt_uptime(elapsed)),
        ('Total packets',     f'{total:,}'),
        ('Web & Files (TCP)', f'{tcp:,}'),
        ('Video & DNS (UDP)', f'{udp:,}'),
        ('Ping (ICMP)',        f'{icmp:,}'),
        ('Other traffic',     f'{other:,}'),
        ('Total data seen',   _fmt_bytes(byt)),
    ]:
        console.print(f'  [dark_green]{label:<22}[/][bold black]{val}[/]')
    console.rule(style='dark_green')
    console.print()


if __name__ == '__main__':
    main()
