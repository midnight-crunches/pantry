$port = 8080
$folder = $PSScriptRoot
$ordersFile = Join-Path $folder "orders.json"
$notifFile = Join-Path $folder "notifications.json"

if (-not (Test-Path $ordersFile)) {
    Set-Content -Path $ordersFile -Value "[]" -Encoding UTF8
}

function Get-LocalIp {
    try {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
            $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Virtual' -and 
            $_.IPAddress -match '^(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))' 
        } | Select-Object -First 1).IPAddress
        if ($ip) { return $ip }
    } catch {}
    return "127.0.0.1"
}

$localIp = Get-LocalIp

function Get-FlatOrders {
    $orders = @()
    if (Test-Path $ordersFile) {
        $raw = Get-Content -Path $ordersFile -Raw -Encoding UTF8
        if (-not [string]::IsNullOrWhiteSpace($raw)) {
            $parsed = $raw | ConvertFrom-Json
            $stack = New-Object System.Collections.ArrayList
            $null = $stack.Add($parsed)
            while ($stack.Count -gt 0) {
                $curr = $stack[0]
                $stack.RemoveAt(0)
                if ($null -eq $curr) { continue }
                if ($curr -is [System.Collections.IEnumerable] -and -not ($curr -is [string])) {
                    foreach ($sub in $curr) { $null = $stack.Add($sub) }
                } elseif ($curr.PSObject -and $curr.PSObject.Properties['orderId']) {
                    $orders += $curr
                } elseif ($curr.PSObject -and $curr.PSObject.Properties['value']) {
                    $null = $stack.Add($curr.value)
                }
            }
        }
    }
    return $orders
}

function Send-AutomaticOrderNotification($order) {
    # 1. Audible Console Chimes
    try {
        [System.Console]::Beep(1200, 250)
        [System.Console]::Beep(1600, 350)
    } catch {}

    # 2. Windows Speech Synthesizer (Loud announcement through laptop speakers in Room 03)
    try {
        Add-Type -AssemblyName System.Speech -ErrorAction SilentlyContinue
        $speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $speaker.Volume = 100
        $roomStr = [string]$order.roomNo
        $cleanRoom = if ($roomStr -match '(?i)^Room\s*') { $roomStr } else { "Room $roomStr" }
        $utrInfo = if ($order.utrNo) { " UTR is $($order.utrNo)." } else { "" }
        $announcement = "New order received! $cleanRoom. Total amount $($order.grandTotal) rupees.$utrInfo"
        $speaker.SpeakAsync($announcement) | Out-Null
        Write-Host "Spoken alert triggered: $announcement" -ForegroundColor Green
    } catch {
        Write-Host "Speech alert notice: $_" -ForegroundColor DarkGray
    }

    # 3. Windows Desktop Toast / Balloon Notification
    try {
        Add-Type -AssemblyName System.Windows.Forms, System.Drawing -ErrorAction SilentlyContinue
        $balloon = New-Object System.Windows.Forms.NotifyIcon
        $balloon.Icon = [System.Drawing.SystemIcons]::Information
        $balloon.Visible = $true
        $balloon.BalloonTipTitle = "NEW DORMS ORDER: $cleanRoom"
        $balloon.BalloonTipText = "$($order.studentName) - Rs. $($order.grandTotal)`n$($order.orderType) (Deliver in 2-3 Mins)"
        $balloon.ShowBalloonTip(5000)
    } catch {
        Write-Host "Toast alert notice: $_" -ForegroundColor DarkGray
    }
}

# Bind TcpListener to 0.0.0.0 (Accepts connections from localhost AND any phone on Wi-Fi!)
$tcpListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$tcpListener.Start()

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AIT PUNE DORMS PANTRY - WI-FI ACCESSIBLE SERVER RUNNING" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Local Laptop Link:  http://localhost:$port/" -ForegroundColor Green
Write-Host "  Mobile Phone Link:  http://$($localIp):$port/" -ForegroundColor Magenta
Write-Host "  Pantry Admin Board: http://localhost:$port/admin.html" -ForegroundColor Cyan
Write-Host "  Listening on:       0.0.0.0:$port (Accepts all devices)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$cloudProcessedIds = New-Object System.Collections.Generic.HashSet[string]
$lastCloudPoll = [DateTime]::MinValue

try {
    while ($tcpListener.Server.IsBound) {
        if ($tcpListener.Pending()) {
            $client = $tcpListener.AcceptTcpClient()
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)

            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                $client.Close()
                continue
            }

        $parts = $requestLine.Split(' ')
        $method = $parts[0].ToUpper()
        $rawPath = if ($parts.Length -gt 1) { $parts[1] } else { "/" }
        $path = $rawPath.Split('?')[0].TrimStart('/')

        # Read HTTP Headers
        $contentLength = 0
        $contentType = ""
        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
            if ($line -match '^Content-Length:\s*(\d+)') {
                $contentLength = [int]$matches[1]
            }
            if ($line -match '^Content-Type:\s*(.+)') {
                $contentType = $matches[1].Trim()
            }
        }

        # Read Request Body (if any)
        $bodyText = ""
        if ($contentLength -gt 0) {
            $charBuffer = New-Object char[] $contentLength
            $totalRead = 0
            while ($totalRead -lt $contentLength) {
                $read = $reader.Read($charBuffer, $totalRead, $contentLength - $totalRead)
                if ($read -le 0) { break }
                $totalRead += $read
            }
            $bodyText = New-Object string($charBuffer, 0, $totalRead)
        }

        # Helper to send HTTP responses with full CORS
        function Send-Response($statusCode, $statusMsg, $cType, $bytes) {
            $hdr = "HTTP/1.1 $statusCode $statusMsg`r`n" +
                   "Content-Type: $cType`r`n" +
                   "Content-Length: $($bytes.Length)`r`n" +
                   "Access-Control-Allow-Origin: *`r`n" +
                   "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
                   "Access-Control-Allow-Headers: Content-Type`r`n" +
                   "Connection: close`r`n`r`n"
            $hdrBytes = [System.Text.Encoding]::ASCII.GetBytes($hdr)
            $stream.Write($hdrBytes, 0, $hdrBytes.Length)
            if ($bytes.Length -gt 0) {
                $stream.Write($bytes, 0, $bytes.Length)
            }
            $stream.Flush()
        }

        # 1. Handle CORS Preflight
        if ($method -eq "OPTIONS") {
            Send-Response 200 "OK" "text/plain" (New-Object byte[] 0)
            $client.Close()
            continue
        }

        # 2. Handle POST /api/order (Instant order from ANY phone or laptop)
        if ($path -eq "api/order" -and $method -eq "POST") {
            try {
                $orderData = $bodyText | ConvertFrom-Json
                $orderTimestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                $randSuffix = (Get-Random -Minimum 100 -Maximum 999)
                $orderId = if ($orderData.orderId) { $orderData.orderId } else { "#DORMS-$randSuffix" }

                $allOrders = @(Get-FlatOrders)

                $newOrder = [PSCustomObject]@{
                    orderId         = $orderId
                    timestamp       = $orderTimestamp
                    studentName     = [string]$orderData.studentName
                    roomNo          = [string]$orderData.roomNo
                    phone           = [string]$orderData.phone
                    orderType       = [string]$orderData.orderType
                    instructions    = [string]$orderData.instructions
                    items           = $orderData.items
                    totalPackets    = [int]$orderData.totalPackets
                    subtotal        = [double]$orderData.subtotal
                    discount        = [double]$orderData.discount
                    roomDeliveryFee = [double]$orderData.roomDeliveryFee
                    grandTotal      = [double]$orderData.grandTotal
                    paymentMethod   = [string]$orderData.paymentMethod
                    utrNo           = [string]$orderData.utrNo
                    status          = "pending"
                }

                $allOrders = @($newOrder) + @($allOrders)
                $updatedJson = $allOrders | ConvertTo-Json -Depth 6
                [System.IO.File]::WriteAllText($ordersFile, $updatedJson, [System.Text.Encoding]::UTF8)

                Write-Host "`n[NEW ORDER RECEIVED] $orderId - Room $($newOrder.roomNo) - Rs. $($newOrder.grandTotal) (UTR: $($newOrder.utrNo))" -ForegroundColor Green

                # Trigger 100% automatic laptop speaker announcement, console chime, and desktop toast
                Send-AutomaticOrderNotification $newOrder

                $respObj = @{
                    success = $true
                    orderId = $orderId
                    message = "Order successfully received at Room 03!"
                    order   = $newOrder
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes(($respObj | ConvertTo-Json -Depth 4))
                Send-Response 200 "OK" "application/json; charset=utf-8" $respBytes
            } catch {
                Write-Host "Error saving order: $_" -ForegroundColor Red
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"Failed to save order"}')
                Send-Response 500 "Internal Server Error" "application/json; charset=utf-8" $errBytes
            }
            $client.Close()
            continue
        }

        # 3. Handle GET /api/orders (Live poll for admin board)
        if ($path -eq "api/orders" -and $method -eq "GET") {
            $flatOrders = @(Get-FlatOrders)
            $jsonContent = if ($flatOrders.Count -gt 0) { $flatOrders | ConvertTo-Json -Depth 6 } else { "[]" }
            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
            Send-Response 200 "OK" "application/json; charset=utf-8" $respBytes
            $client.Close()
            continue
        }

        # 4. Handle POST /api/order/status
        if ($path -eq "api/order/status" -and $method -eq "POST") {
            try {
                $statusUpdate = $bodyText | ConvertFrom-Json
                $allOrders = @(Get-FlatOrders)
                foreach ($ord in $allOrders) {
                    if ($ord.orderId -eq $statusUpdate.orderId) {
                        $ord.status = $statusUpdate.status
                    }
                }
                $updatedJson = $allOrders | ConvertTo-Json -Depth 6
                [System.IO.File]::WriteAllText($ordersFile, $updatedJson, [System.Text.Encoding]::UTF8)
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                Send-Response 200 "OK" "application/json; charset=utf-8" $respBytes
            } catch {
                Send-Response 500 "Error" "application/json" (New-Object byte[] 0)
            }
            $client.Close()
            continue
        }

        # 5. Static File Handler (index.html, admin.html, app.js, style.css, qr.png)
        if ([string]::IsNullOrWhiteSpace($path)) {
            $path = "index.html"
        }
        $filePath = Join-Path $folder $path

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            Send-Response 200 "OK" $mime $fileBytes
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            Send-Response 404 "Not Found" "text/plain" $notFound
        }

        $client.Close()
        } else {
            # 2. Check cloud queue from ntfy.sh (Captures orders from ANY random phone on GitHub Pages!)
            $now = [DateTime]::UtcNow
            if (($now - $lastCloudPoll).TotalSeconds -ge 2) {
                $lastCloudPoll = $now

                # Channel A: Webhook.site queue (100% reliable across Indian ISPs)
                try {
                    $whRaw = curl.exe -s --max-time 2 "https://webhook.site/token/ad528725-84e7-40c6-8b99-80d42355f16e/requests?page=1"
                    if ($whRaw) {
                        $whJson = $whRaw | ConvertFrom-Json
                        if ($whJson -and $whJson.data) {
                            foreach ($req in $whJson.data) {
                                if ($req.uuid -and -not $cloudProcessedIds.Contains($req.uuid)) {
                                    $null = $cloudProcessedIds.Add($req.uuid)
                                    try {
                                        $orderObj = $req.content | ConvertFrom-Json
                                        if ($orderObj -and $orderObj.orderId) {
                                            $allOrders = @(Get-FlatOrders)
                                            $alreadySaved = $false
                                            foreach ($o in $allOrders) {
                                                if ($o.orderId -eq $orderObj.orderId) { $alreadySaved = $true; break }
                                            }
                                            if (-not $alreadySaved) {
                                                $allOrders = @($orderObj) + @($allOrders)
                                                $updatedJson = $allOrders | ConvertTo-Json -Depth 6
                                                [System.IO.File]::WriteAllText($ordersFile, $updatedJson, [System.Text.Encoding]::UTF8)
                                                $cleanLogRoom = if ([string]$orderObj.roomNo -match '(?i)^Room\s*') { $orderObj.roomNo } else { "Room $($orderObj.roomNo)" }
                                                Write-Host "`n[CLOUD ORDER VIA WEBHOOK] $($orderObj.orderId) - $cleanLogRoom - Rs. $($orderObj.grandTotal)" -ForegroundColor Green
                                                Send-AutomaticOrderNotification $orderObj
                                            }
                                        }
                                    } catch {}
                                }
                            }
                        }
                    }
                } catch {}

                # Channel B: ntfy.sh (when accessible)
                try {
                    $rawContent = curl.exe -s --max-time 2 "https://ntfy.sh/ait_dorms_pantry_8870803716/json?poll=1"
                    if ($rawContent) {
                        $lines = $rawContent -split "`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
                        foreach ($line in $lines) {
                            try {
                                $item = $line | ConvertFrom-Json
                                if ($item.id -and -not $cloudProcessedIds.Contains($item.id)) {
                                    $null = $cloudProcessedIds.Add($item.id)
                                    $itemAgeSec = ($now - [DateTimeOffset]::FromUnixTimeSeconds($item.time).UtcDateTime).TotalSeconds
                                    if ($itemAgeSec -le 90) {
                                        $orderObj = $item.message | ConvertFrom-Json
                                        if ($orderObj -and $orderObj.orderId) {
                                            $allOrders = @(Get-FlatOrders)
                                            $alreadySaved = $false
                                            foreach ($o in $allOrders) {
                                                if ($o.orderId -eq $orderObj.orderId) { $alreadySaved = $true; break }
                                            }
                                            if (-not $alreadySaved) {
                                                $allOrders = @($orderObj) + @($allOrders)
                                                $updatedJson = $allOrders | ConvertTo-Json -Depth 6
                                                [System.IO.File]::WriteAllText($ordersFile, $updatedJson, [System.Text.Encoding]::UTF8)
                                                Write-Host "`n[CLOUD ORDER VIA NTFY] $($orderObj.orderId) - Room $($orderObj.roomNo) - Rs. $($orderObj.grandTotal)" -ForegroundColor Green
                                                Send-AutomaticOrderNotification $orderObj
                                            }
                                        }
                                    }
                                }
                            } catch {}
                        }
                    }
                } catch {}
            }
            Start-Sleep -Milliseconds 80
        }
    }
} finally {
    $tcpListener.Stop()
}
