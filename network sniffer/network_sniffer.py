# network_sniffer.py — Filtering & deep payload analysis
# Layers: Ethernet → IPv4 → TCP/UDP/ICMP → HTTP / DNS / ICMP-ping
import argparse
import ipaddress
import re
import socket
import struct
import sys
import time
from dataclasses import dataclass
from typing import Callable, Optional
from colorama import init, Fore, Style

init(autoreset=True)


# ── Tunable limits ────────────────────────────────────────────────────────────
_DNS_JUMP_LIMIT  = 20   # max pointer hops before aborting name decompression
_PREVIEW_TCP_B   = 64   # max TCP payload bytes shown per packet
_PREVIEW_UDP_B   = 48   # max UDP payload bytes shown per packet
_PREVIEW_ICMP_B  = 32   # max ICMP payload bytes shown per packet
_HTTP_BODY_CHARS = 120  # max HTTP body characters shown in verbose mode


# ══════════════════════════════════════════════════════════════════════════════
#  FILTER ENGINE
#  BPF-like expressions compiled to a predicate:  f(PacketInfo) -> bool
#
#  Grammar (recursive descent):
#    expr     = or_expr
#    or_expr  = and_expr  ('or'  and_expr)*
#    and_expr = not_expr  ('and' not_expr)*
#    not_expr = 'not' not_expr | primary
#    primary  = '(' expr ')'
#             | ['src'|'dst'] ('tcp'|'udp'|'icmp')
#             | ['src'|'dst'] 'host' IP
#             | ['src'|'dst'] 'port' N
#             | ['src'|'dst'] 'net'  CIDR
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class PacketInfo:
    proto:    str
    src_ip:   str
    dst_ip:   str
    src_port: Optional[int]
    dst_port: Optional[int]


def _tokenize(expr: str) -> list[str]:
    return re.findall(r'\(|\)|[^\s()]+', expr.lower())


class _FilterParser:
    def __init__(self, tokens: list[str]) -> None:
        self.tokens = tokens
        self.pos    = 0

    def _peek(self) -> Optional[str]:
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def _eat(self) -> str:
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def parse(self) -> Callable[[PacketInfo], bool]:
        fn = self._or()
        if self._peek() is not None:
            raise SyntaxError(f'unexpected token: {self._peek()!r}')
        return fn

    def _or(self) -> Callable[[PacketInfo], bool]:
        left = self._and()
        while self._peek() == 'or':
            self._eat()
            right = self._and()
            left  = (lambda l, r: lambda p: l(p) or r(p))(left, right)
        return left

    def _and(self) -> Callable[[PacketInfo], bool]:
        left = self._not()
        while self._peek() == 'and':
            self._eat()
            right = self._not()
            left  = (lambda l, r: lambda p: l(p) and r(p))(left, right)
        return left

    def _not(self) -> Callable[[PacketInfo], bool]:
        if self._peek() == 'not':
            self._eat()
            inner = self._not()
            return lambda p: not inner(p)
        return self._primary()

    def _primary(self) -> Callable[[PacketInfo], bool]:
        tok = self._peek()
        if tok is None:
            raise SyntaxError('unexpected end of filter expression')

        if tok == '(':
            self._eat()
            fn = self._or()
            if self._peek() != ')':
                raise SyntaxError('missing closing )')
            self._eat()
            return fn

        direction: Optional[str] = None
        if tok in ('src', 'dst'):
            direction = self._eat()
            tok       = self._peek()

        if tok in ('tcp', 'udp', 'icmp'):
            name = self._eat().upper()
            return (lambda n: lambda p: p.proto == n)(name)

        if tok == 'host':
            self._eat()
            ip = self._eat()
            if direction == 'src':
                return (lambda i: lambda p: p.src_ip == i)(ip)
            if direction == 'dst':
                return (lambda i: lambda p: p.dst_ip == i)(ip)
            return (lambda i: lambda p: p.src_ip == i or p.dst_ip == i)(ip)

        if tok == 'port':
            self._eat()
            port = int(self._eat())
            if direction == 'src':
                return (lambda pt: lambda p: p.src_port == pt)(port)
            if direction == 'dst':
                return (lambda pt: lambda p: p.dst_port == pt)(port)
            return (lambda pt: lambda p: p.src_port == pt or p.dst_port == pt)(port)

        if tok == 'net':
            self._eat()
            net = ipaddress.ip_network(self._eat(), strict=False)
            if direction == 'src':
                return (lambda n: lambda p: ipaddress.ip_address(p.src_ip) in n)(net)
            if direction == 'dst':
                return (lambda n: lambda p: ipaddress.ip_address(p.dst_ip) in n)(net)
            return (lambda n: lambda p: (
                ipaddress.ip_address(p.src_ip) in n or
                ipaddress.ip_address(p.dst_ip) in n
            ))(net)

        raise SyntaxError(f'unknown filter keyword: {tok!r}')


def compile_filter(expr: str) -> Callable[[PacketInfo], bool]:
    """Compile a BPF-like filter string into a callable predicate."""
    tokens = _tokenize(expr.strip())
    if not tokens:
        return lambda _: True
    return _FilterParser(tokens).parse()


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER PARSERS  (Ethernet → IPv4 → TCP / UDP / ICMP)
# ══════════════════════════════════════════════════════════════════════════════

def _fmt_mac(raw: bytes) -> str:
    return ':'.join(f'{b:02x}' for b in raw)


def parse_ethernet(data: bytes) -> tuple[str, str, int, bytes]:
    dst, src, proto = struct.unpack('!6s6sH', data[:14])
    return _fmt_mac(dst), _fmt_mac(src), proto, data[14:]


def parse_ipv4(data: bytes) -> tuple[str, str, int, int, bytes]:
    if len(data) < 20:
        raise ValueError('truncated IPv4 header')
    ihl = (data[0] & 0x0F) * 4
    if ihl < 20:
        raise ValueError(f'invalid IHL: {ihl}')
    ttl   = data[8]
    proto = data[9]
    src   = socket.inet_ntoa(data[12:16])
    dst   = socket.inet_ntoa(data[16:20])
    return src, dst, proto, ttl, data[ihl:]


_TCP_FLAGS: dict[str, int] = {
    'FIN': 0x001, 'SYN': 0x002, 'RST': 0x004, 'PSH': 0x008,
    'ACK': 0x010, 'URG': 0x020, 'ECE': 0x040, 'CWR': 0x080,
}


def parse_tcp(data: bytes) -> tuple[int, int, int, int, str, int, bytes]:
    sp, dp, seq, ack, off_flags, win, _chk, _urg = struct.unpack('!HHIIHHHH', data[:20])
    hlen     = (off_flags >> 12) * 4
    flags    = off_flags & 0x1FF
    flag_str = '|'.join(n for n, b in _TCP_FLAGS.items() if flags & b) or 'NONE'
    return sp, dp, seq, ack, flag_str, win, data[hlen:]


def parse_udp(data: bytes) -> tuple[int, int, int, bytes]:
    sp, dp, length = struct.unpack('!HHH', data[:6])
    return sp, dp, length, data[8:]


def parse_icmp(data: bytes) -> tuple[int, int, int, bytes, bytes]:
    typ, code, chk = struct.unpack('!BBH', data[:4])
    return typ, code, chk, data[4:8], data[8:]


# ══════════════════════════════════════════════════════════════════════════════
#  PAYLOAD DECODERS
# ══════════════════════════════════════════════════════════════════════════════

# ── HTTP ──────────────────────────────────────────────────────────────────────

_HTTP_METHODS: frozenset[str] = frozenset({
    'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH', 'CONNECT', 'TRACE',
})


def decode_http(payload: bytes) -> Optional[dict[str, object]]:
    try:
        text = payload.decode('utf-8', errors='replace')
    except Exception:
        return None

    lines = text.split('\r\n')
    if not lines:
        return None

    first       = lines[0]
    is_request  = any(first.startswith(m + ' ') for m in _HTTP_METHODS)
    is_response = first.startswith('HTTP/')
    if not (is_request or is_response):
        return None

    headers: dict[str, str] = {}
    i = 1
    while i < len(lines) and lines[i]:
        if ':' in lines[i]:
            k, _, v = lines[i].partition(':')
            headers[k.strip().lower()] = v.strip()
        i += 1

    sep          = text.find('\r\n\r\n')
    body_preview = (
        text[sep + 4 : sep + 4 + _HTTP_BODY_CHARS]
        .replace('\r', '').replace('\n', ' ')
        if sep != -1 else ''
    )

    return {
        'kind':         'request' if is_request else 'response',
        'first_line':   first,
        'headers':      headers,
        'body_preview': body_preview,
    }


# ── DNS ───────────────────────────────────────────────────────────────────────
#
#  Wire format (RFC 1035)
#  ┌──────────────┐  ← offset 0
#  │  TX ID (2B)  │
#  ├──────────────┤
#  │  Flags (2B)  │  QR|Opcode|AA|TC|RD|RA|Z|RCODE
#  ├──────────────┤
#  │ QDCOUNT (2B) │  number of questions
#  ├──────────────┤
#  │ ANCOUNT (2B) │  number of answer RRs
#  ├──────────────┤
#  │ NSCOUNT (2B) │
#  ├──────────────┤
#  │ ARCOUNT (2B) │
#  ├──────────────┤  ← offset 12
#  │  Questions   │  QNAME (labels) + QTYPE (2B) + QCLASS (2B)
#  ├──────────────┤
#  │  Answers     │  NAME + TYPE(2) + CLASS(2) + TTL(4) + RDLEN(2) + RDATA
#  └──────────────┘

_DNS_TYPES: dict[int, str] = {
    1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 12: 'PTR',
    15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 255: 'ANY',
}

_DNS_RCODES: dict[int, str] = {
    0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL',
    3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED',
}


def _read_dns_name(data: bytes, offset: int) -> tuple[str, int]:
    """Decode a (possibly pointer-compressed) DNS name. Returns (name, next_offset)."""
    labels:  list[str] = []
    jumped             = False
    next_off           = offset
    hops               = 0

    while offset < len(data):
        length = data[offset]
        if length == 0:
            if not jumped:
                next_off = offset + 1
            break
        if (length & 0xC0) == 0xC0:            # compression pointer: high 2 bits set
            if offset + 1 >= len(data):
                break
            if not jumped:
                next_off = offset + 2           # caller resumes after the 2-byte pointer
            jumped  = True
            offset  = ((length & 0x3F) << 8) | data[offset + 1]
            hops   += 1
            if hops > _DNS_JUMP_LIMIT:
                break
        else:
            offset += 1
            labels.append(data[offset : offset + length].decode('ascii', errors='replace'))
            offset += length

    return '.'.join(labels) or '<root>', next_off


def decode_dns(payload: bytes) -> Optional[dict[str, object]]:
    if len(payload) < 12:
        return None

    txid, flags, qdcount, ancount, *_ = struct.unpack('!HHHHHH', payload[:12])
    is_response = bool((flags >> 15) & 1)
    rcode       = _DNS_RCODES.get(flags & 0xF, f'rcode={flags & 0xF}')

    offset    = 12
    questions: list[dict[str, str]] = []
    for _ in range(qdcount):
        try:
            name, offset = _read_dns_name(payload, offset)
            qtype, _     = struct.unpack('!HH', payload[offset : offset + 4])
            offset      += 4
            questions.append({'name': name, 'type': _DNS_TYPES.get(qtype, f'type={qtype}')})
        except Exception:
            break

    answers: list[dict[str, object]] = []
    for _ in range(ancount):
        try:
            name, offset         = _read_dns_name(payload, offset)
            rtype, _, ttl, rdlen = struct.unpack('!HHIH', payload[offset : offset + 10])
            offset              += 10
            rdata                = payload[offset : offset + rdlen]
            rdata_start          = offset
            offset              += rdlen

            if   rtype ==  1 and rdlen ==  4: rstr = socket.inet_ntoa(rdata)
            elif rtype == 28 and rdlen == 16: rstr = socket.inet_ntop(socket.AF_INET6, rdata)
            elif rtype in (2, 5, 12):
                rstr, _ = _read_dns_name(payload, rdata_start)
            elif rtype == 15 and rdlen >= 3:
                pref = struct.unpack('!H', rdata[:2])[0]
                mx, _ = _read_dns_name(payload, rdata_start + 2)
                rstr  = f'{pref} {mx}'
            elif rtype == 16:
                rstr = rdata[1:].decode('ascii', errors='replace') if rdata else ''
            else:
                rstr = rdata.hex()

            answers.append({
                'name': name,
                'type': _DNS_TYPES.get(rtype, f'type={rtype}'),
                'ttl':  ttl,
                'data': rstr,
            })
        except Exception:
            break

    return {
        'txid':        txid,
        'is_response': is_response,
        'rcode':       rcode,
        'questions':   questions,
        'answers':     answers,
    }


# ── ICMP ping tracker ─────────────────────────────────────────────────────────

class PingTracker:
    """Pairs Echo Request / Reply by (host, id, seq) and measures RTT."""

    def __init__(self) -> None:
        self._pending: dict[tuple[str, int, int], float] = {}

    def request(self, src_ip: str, ident: int, seq: int) -> None:
        self._pending[(src_ip, ident, seq)] = time.monotonic()

    def reply(self, dst_ip: str, ident: int, seq: int) -> Optional[float]:
        ts = self._pending.pop((dst_ip, ident, seq), None)
        return (time.monotonic() - ts) * 1000 if ts is not None else None


# ══════════════════════════════════════════════════════════════════════════════
#  DISPLAY
# ══════════════════════════════════════════════════════════════════════════════

def _hex_dump(data: bytes, indent: int = 7) -> None:
    prefix = ' ' * indent
    for i in range(0, len(data), 16):
        chunk      = data[i : i + 16]
        hex_part   = ' '.join(f'{b:02x}' for b in chunk)
        ascii_part = ''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)
        print(f'{prefix}{i:04x}  {hex_part:<47}  {ascii_part}')


def _addr(ip: str, port: Optional[int] = None) -> str:
    a = f'{Fore.CYAN}{ip}{Style.RESET_ALL}'
    return f'{a}:{Fore.WHITE}{port}{Style.RESET_ALL}' if port else a


def _svc(sp: int, dp: int, table: dict[int, str]) -> str:
    name = table.get(dp) or table.get(sp) or ''
    return f'  {Fore.MAGENTA}[{name}]{Style.RESET_ALL}' if name else ''


_SENSITIVE_HDRS: frozenset[str] = frozenset({'authorization', 'cookie', 'set-cookie'})


def _print_http(http: dict[str, object], verbose: bool, redact: bool = False) -> None:
    kind  = str(http['kind'])
    color = Fore.YELLOW if kind == 'request' else Fore.GREEN
    print(f'       {color}HTTP {kind.upper()}{Style.RESET_ALL}  {http["first_line"]}')
    headers: dict[str, str] = http['headers']  # type: ignore[assignment]
    for key in ('host', 'user-agent', 'content-type', 'content-length',
                'location', 'authorization', 'cookie', 'set-cookie',
                'referer', 'x-forwarded-for'):
        val = headers.get(key)
        if val:
            if redact and key in _SENSITIVE_HDRS:
                val = '[REDACTED]'
            print(f'         {Fore.WHITE}{key}{Style.RESET_ALL}: {val}')
    body = str(http.get('body_preview', ''))
    if verbose and body.strip():
        print(f'         body: {body[:_HTTP_BODY_CHARS]}')


def _print_dns(dns: dict[str, object]) -> None:
    tag  = (f'{Fore.GREEN}RESPONSE{Style.RESET_ALL}' if dns['is_response']
            else f'{Fore.YELLOW}QUERY{Style.RESET_ALL}')
    rc   = str(dns['rcode'])
    rc_c = Fore.RED if rc != 'NOERROR' else Fore.GREEN
    print(f'       {Fore.BLUE}DNS{Style.RESET_ALL}  {tag}  '
          f'txid=0x{dns["txid"]:04x}  rcode={rc_c}{rc}{Style.RESET_ALL}')
    for q in dns['questions']:  # type: ignore[union-attr]
        print(f'         ?  {Fore.CYAN}{q["name"]:<40}{Style.RESET_ALL}  {q["type"]}')
    for a in dns['answers']:    # type: ignore[union-attr]
        print(f'         >  {Fore.CYAN}{a["name"]:<40}{Style.RESET_ALL}  '
              f'{a["type"]:<6}  {Fore.GREEN}{a["data"]}{Style.RESET_ALL}'
              f'  TTL={a["ttl"]}')


# ══════════════════════════════════════════════════════════════════════════════
#  PROTOCOL HANDLERS
# ══════════════════════════════════════════════════════════════════════════════

_TCP_SVCS: dict[int, str] = {
    20: 'FTP-data', 21: 'FTP',  22: 'SSH',    23: 'Telnet', 25: 'SMTP',
    53: 'DNS',      80: 'HTTP', 110: 'POP3',  143: 'IMAP',  443: 'HTTPS',
    465: 'SMTPS',  993: 'IMAPS', 995: 'POP3S', 3306: 'MySQL', 3389: 'RDP',
    5432: 'PgSQL', 8080: 'HTTP-alt', 8443: 'HTTPS-alt',
}

_UDP_SVCS: dict[int, str] = {
    53: 'DNS', 67: 'DHCP-srv', 68: 'DHCP-cli', 123: 'NTP',
    161: 'SNMP', 162: 'SNMP-trap', 514: 'Syslog', 1900: 'SSDP', 5353: 'mDNS',
}

_ICMP_NAMES: dict[int, str] = {
    0: 'Echo Reply', 3: 'Dest Unreachable', 5: 'Redirect',
    8: 'Echo Request', 11: 'Time Exceeded', 12: 'Param Problem',
    13: 'Timestamp Req', 14: 'Timestamp Reply',
}

_ICMP_UNREACH: dict[int, str] = {
    0: 'net unreachable',  1: 'host unreachable',
    2: 'proto unreachable', 3: 'port unreachable',
    4: 'frag needed',      5: 'source route failed',
}

_ICMP_EXCEED: dict[int, str] = {
    0: 'TTL exceeded in transit', 1: 'fragment reassembly exceeded',
}


def _handle_tcp(data: bytes, src_ip: str, dst_ip: str,
                verbose: bool, redact: bool, _tracker: PingTracker) -> None:
    sp, dp, seq, ack, flags, win, payload = parse_tcp(data)
    print(f'  {Fore.GREEN}TCP{Style.RESET_ALL}  '
          f'{_addr(src_ip, sp)} → {_addr(dst_ip, dp)}{_svc(sp, dp, _TCP_SVCS)}')
    print(f'       Flags={Fore.YELLOW}{flags}{Style.RESET_ALL}'
          f'  Seq={seq}  Ack={ack}  Win={win}')

    if not payload:
        return

    http = decode_http(payload)
    if http:
        _print_http(http, verbose, redact)
    elif verbose:
        show = min(len(payload), _PREVIEW_TCP_B)
        print(f'       Payload ({len(payload)} B, showing {show} B):')
        _hex_dump(payload[:show])


def _handle_udp(data: bytes, src_ip: str, dst_ip: str,
                verbose: bool, redact: bool, _tracker: PingTracker) -> None:
    sp, dp, length, payload = parse_udp(data)
    print(f'  {Fore.BLUE}UDP{Style.RESET_ALL}  '
          f'{_addr(src_ip, sp)} → {_addr(dst_ip, dp)}'
          f'  len={length}{_svc(sp, dp, _UDP_SVCS)}')

    if sp == 53 or dp == 53:
        dns = decode_dns(payload)
        if dns:
            _print_dns(dns)
    elif verbose and payload:
        show = min(len(payload), _PREVIEW_UDP_B)
        print(f'       Payload ({len(payload)} B, showing {show} B):')
        _hex_dump(payload[:show])


def _handle_icmp(data: bytes, src_ip: str, dst_ip: str,
                 verbose: bool, redact: bool, tracker: PingTracker) -> None:
    typ, code, chk, rest, payload = parse_icmp(data)
    name   = _ICMP_NAMES.get(typ, f'type={typ}')
    detail = ''
    rtt    = ''

    if typ == 3:
        detail = f'  ({_ICMP_UNREACH.get(code, f"code={code}")})'
    elif typ == 11:
        detail = f'  ({_ICMP_EXCEED.get(code, f"code={code}")})'
    elif typ in (0, 8):
        ident, seq = struct.unpack('!HH', rest)
        detail = f'  id={ident}  seq={seq}'
        if typ == 8:
            tracker.request(src_ip, ident, seq)
        else:
            ms = tracker.reply(dst_ip, ident, seq)
            if ms is not None:
                rtt = f'  {Fore.GREEN}RTT={ms:.2f} ms{Style.RESET_ALL}'

    print(f'  {Fore.RED}ICMP{Style.RESET_ALL} '
          f'{_addr(src_ip)} → {_addr(dst_ip)}  '
          f'{Fore.YELLOW}{name}{Style.RESET_ALL}{detail}'
          f'  chk=0x{chk:04x}{rtt}')

    if verbose and payload:
        _hex_dump(payload[:_PREVIEW_ICMP_B])


_Handler = Callable[[bytes, str, str, bool, bool, PingTracker], None]

_HANDLERS: dict[int, tuple[str, _Handler]] = {
    1:  ('ICMP', _handle_icmp),
    6:  ('TCP',  _handle_tcp),
    17: ('UDP',  _handle_udp),
}


# ══════════════════════════════════════════════════════════════════════════════
#  SOCKET FACTORY  (platform-aware)
# ══════════════════════════════════════════════════════════════════════════════

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
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════

def _build_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(
        prog='network_sniffer',
        description='Network sniffer — filtering, HTTP extraction, DNS decoding & ICMP RTT',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Filter syntax
─────────────
  Primitives
    tcp  udp  icmp
    [src|dst] host <IP>
    [src|dst] port <N>
    [src|dst] net  <CIDR>

  Connectives (lowest → highest precedence)
    or   and   not   ( )

Examples
────────
  tcp and port 80                   HTTP only
  udp and port 53                   DNS queries/responses
  icmp                              Ping traffic only
  host 8.8.8.8                      Any traffic to/from 8.8.8.8
  src host 192.168.1.5 and tcp      All TCP from a specific host
  not port 443                      Exclude HTTPS
  (tcp or udp) and dst port 53      DNS over TCP or UDP
  net 192.168.0.0/16                Everything on the local /16
""")
    ap.add_argument('-f', '--filter',  default='',  metavar='EXPR',
                    help='BPF-like filter expression (default: capture everything)')
    ap.add_argument('-c', '--count',   default=0,   type=int, metavar='N',
                    help='Stop after N matching packets (0 = unlimited)')
    ap.add_argument('-v', '--verbose', action='store_true',
                    help='Show hex dumps for non-HTTP/DNS payloads')
    ap.add_argument('--redact', action='store_true',
                    help='Replace Authorization and Cookie header values with [REDACTED]')
    return ap.parse_args()


def main() -> None:
    args = _build_args()

    try:
        pkt_filter = compile_filter(args.filter)
    except (SyntaxError, ValueError) as e:
        sys.exit(f'{Fore.RED}[!] Filter error: {e}{Style.RESET_ALL}')

    print(f'{Fore.CYAN}[*] Network sniffer — filtering & payload analysis{Style.RESET_ALL}')
    if args.filter:
        print(f'{Fore.CYAN}[*] Filter : {args.filter}{Style.RESET_ALL}')
    if args.count:
        print(f'{Fore.CYAN}[*] Limit  : {args.count} packets{Style.RESET_ALL}')

    try:
        sock, platform = _open_socket()
    except PermissionError:
        sys.exit(
            f'{Fore.RED}[!] Permission denied.\n'
            '    Windows → run as Administrator\n'
            f'    Linux   → sudo python3 network_sniffer.py{Style.RESET_ALL}'
        )

    print(f'{Fore.GREEN}[+] Listening ({platform})  —  Ctrl-C to stop\n{Style.RESET_ALL}')

    tracker = PingTracker()
    counts: dict[str, int] = {'TCP': 0, 'UDP': 0, 'ICMP': 0, 'OTHER': 0}
    seen = matched = 0

    try:
        while True:
            raw, _ = sock.recvfrom(65535)
            seen  += 1

            if platform == 'linux':
                _, _, eth_proto, ip_data = parse_ethernet(raw)
                if eth_proto != 0x0800:
                    continue
            else:
                ip_data = raw

            try:
                src_ip, dst_ip, proto, ttl, l4 = parse_ipv4(ip_data)
            except Exception:
                continue

            sp = dp = None
            proto_name = 'OTHER'
            if proto == 6 and len(l4) >= 20:
                proto_name = 'TCP'
                sp, dp = struct.unpack('!HH', l4[:4])
            elif proto == 17 and len(l4) >= 8:
                proto_name = 'UDP'
                sp, dp = struct.unpack('!HH', l4[:4])
            elif proto == 1:
                proto_name = 'ICMP'

            if not pkt_filter(PacketInfo(proto_name, src_ip, dst_ip, sp, dp)):
                continue

            matched += 1
            counts[proto_name if proto_name in counts else 'OTHER'] += 1

            print(f'{Fore.YELLOW}─── #{matched:<5}  {len(raw):>5} B'
                  f'  TTL={ttl:<3}  ────────────────────{Style.RESET_ALL}')

            if proto in _HANDLERS:
                _, handler = _HANDLERS[proto]
                try:
                    handler(l4, src_ip, dst_ip, args.verbose, args.redact, tracker)
                except struct.error as e:
                    print(f'  {Fore.RED}[parse error — truncated packet: {e}]{Style.RESET_ALL}')
            else:
                print(f'  {src_ip} → {dst_ip}  proto={proto}')

            print()

            if args.count and matched >= args.count:
                print(f'{Fore.GREEN}[+] Reached capture limit of {args.count}.{Style.RESET_ALL}\n')
                break

    except KeyboardInterrupt:
        pass
    finally:
        if platform == 'win32':
            sock.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
        sock.close()

    total = max(matched, 1)
    print(f'{Fore.GREEN}── Summary ─────────────────────────────────{Style.RESET_ALL}')
    print(f'  Seen      {seen}')
    print(f'  Matched   {matched}')
    print(f'  {"─" * 40}')
    for k in ('TCP', 'UDP', 'ICMP', 'OTHER'):
        n   = counts[k]
        bar = f'{Fore.GREEN}{"█" * (n * 28 // total)}{Style.RESET_ALL}'
        pct = n * 100 // total
        print(f'  {k:<6} {n:>5}  {pct:>3}%  {bar}')


if __name__ == '__main__':
    main()
