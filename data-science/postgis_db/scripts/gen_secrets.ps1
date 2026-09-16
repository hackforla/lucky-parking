# Print a fresh set of production secrets to stdout, ready to append to .env.
#
#   .\scripts\gen_secrets.ps1 >> .env
#
# Issue one API key per consumer so a single key can be revoked without
# disturbing the others: .\scripts\gen_secrets.ps1 -ApiKeyOnly
#
# Kept ASCII-only and free of .NET Core-only APIs so it runs under the Windows
# PowerShell 5.1 that ships with Windows, not just PowerShell 7+.
param([switch]$ApiKeyOnly)

$ErrorActionPreference = 'Stop'

function New-Secret([int]$Length) {
  # RandomNumberGenerator::Create().GetBytes() exists on .NET Framework 4.x and
  # modern .NET alike. The static Fill(Span[byte]) overload does NOT exist on
  # 5.1, and RNGCryptoServiceProvider is obsolete, so this is the portable path.
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $bytes = New-Object byte[] 96
    $rng.GetBytes($bytes)
    # url-safe base64; drop padding and non-alphanumerics for easy copy/paste.
    $text = [Convert]::ToBase64String($bytes) -replace '[^A-Za-z0-9]', ''
    if ($text.Length -lt $Length) {
      throw "Could not generate $Length characters of randomness"
    }
    return $text.Substring(0, $Length)
  }
  finally {
    $rng.Dispose()
  }
}

if ($ApiKeyOnly) {
  Write-Output "lp_$(New-Secret 40)"
  exit 0
}

$stamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

Write-Output ''
Write-Output "# --- generated $stamp by scripts/gen_secrets.ps1 ---"
Write-Output "POSTGRES_PASSWORD=$(New-Secret 32)"
Write-Output 'WEB_USER=explorer'
Write-Output "WEB_PASSWORD=$(New-Secret 24)"
Write-Output '# Comma-separated. Add one key per consumer; remove a key to revoke it.'
Write-Output "API_KEYS=lp_$(New-Secret 40)"
