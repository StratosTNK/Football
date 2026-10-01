# Run as Administrator to map DSU.ThanhKhe.football.vn to 127.0.0.1
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$domains = @("127.0.0.1 DSU.ThanhKhe.football.vn", "127.0.0.1 dsu.thanhkhe.football.vn")

$currentHosts = Get-Content -Path $hostsPath -Raw -ErrorAction SilentlyContinue

$needsAdd = $false
foreach ($domain in $domains) {
    if ($currentHosts -notmatch [regex]::Escape($domain.Split()[1])) {
        $needsAdd = $true
        break
    }
}

if ($needsAdd) {
    Write-Host "Dang them domain vao file hosts..." -ForegroundColor Yellow
    Add-Content -Path $hostsPath -Value "`n# Football Club Local Domain`n127.0.0.1 DSU.ThanhKhe.football.vn`n127.0.0.1 dsu.thanhkhe.football.vn"
    Write-Host "Da them thanh cong!" -ForegroundColor Green
} else {
    Write-Host "Domain DSU.ThanhKhe.football.vn da ton tai trong hosts!" -ForegroundColor Green
}

Clear-DnsClientCache
Write-Host "DNS cache cleared!" -ForegroundColor Green
Start-Process "http://DSU.ThanhKhe.football.vn"
