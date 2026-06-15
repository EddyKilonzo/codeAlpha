# launch.ps1 — Opens the Network Sniffer Dashboard in a new elevated window
#
# Run this script from ANY PowerShell prompt (non-admin is fine).
# It will spawn a new elevated window that owns its own console buffer,
# which eliminates the rendering glitches caused by sharing the terminal.

$here   = Split-Path -Parent $MyInvocation.MyCommand.Definition
$script = Join-Path $here 'sniffer_dashboard.py'

# Escape single quotes in case the path contains them
$hereEsc   = $here.Replace("'", "''")
$scriptEsc = $script.Replace("'", "''")

# Command the elevated window will execute on startup
$cmd = "Set-Location -LiteralPath '$hereEsc'; python '$scriptEsc'"

# Try Windows Terminal first — it renders Rich layouts far better than
# the legacy conhost.exe used by plain powershell.exe windows.
$wt = Get-Command wt -ErrorAction SilentlyContinue

if ($wt) {
    # Open a new elevated Windows Terminal window with its own tab.
    # The inner powershell -Command runs the dashboard inside that WT session.
    Start-Process powershell -Verb RunAs -WindowStyle Normal -ArgumentList @(
        '-NoExit',
        '-Command',
        "wt --title 'Network Sniffer' powershell -NoExit -Command `"$cmd`""
    )
} else {
    # Windows Terminal not found — open a plain elevated PowerShell window.
    Start-Process powershell -Verb RunAs -WindowStyle Normal -ArgumentList (
        '-NoExit', '-Command', $cmd
    )
}

Write-Host "Dashboard launched in a new window." -ForegroundColor Green
