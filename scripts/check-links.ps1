$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$urls = Get-Content -LiteralPath (Join-Path $taskRoot 'reports/displayed-external-links.json') -Raw | ConvertFrom-Json
$results = foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 25 -MaximumRedirection 8
        [pscustomobject]@{ url = $url; status = [int]$response.StatusCode; result = 'reachable'; checked_utc = [DateTime]::UtcNow.ToString('o') }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { $null }
        $classification = if ($status -in 403,429,999) { 'automated-access-limited' } elseif ($status -in 404,410) { 'broken' } else { 'unresolved' }
        [pscustomobject]@{ url = $url; status = $status; result = $classification; checked_utc = [DateTime]::UtcNow.ToString('o') }
    }
}
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $taskRoot 'reports/link-check.json') -Encoding utf8
$results | Group-Object result | Select-Object Name,Count
if ($results.result -contains 'broken') { exit 1 }
