[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
$url = 'https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip'
$dest = 'C:\Users\chaud\.gemini\antigravity\scratch\mingit'
$zip = 'C:\Users\chaud\.gemini\antigravity\scratch\mingit.zip'

if (-not (Test-Path $dest)) {
    Write-Host "Downloading portable Git with TLS 1.2..." -ForegroundColor Cyan
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    $wc.DownloadFile($url, $zip)
    Write-Host "Extracting MinGit..." -ForegroundColor Cyan
    Expand-Archive -Path $zip -DestinationPath $dest -Force
    Remove-Item $zip -Force -ErrorAction SilentlyContinue
}

$gitExe = Join-Path $dest "cmd\git.exe"
if (Test-Path $gitExe) {
    Write-Host "MinGit Ready at: $gitExe" -ForegroundColor Green
    & $gitExe --version
} else {
    Write-Host "MinGit failed to unpack" -ForegroundColor Red
}
