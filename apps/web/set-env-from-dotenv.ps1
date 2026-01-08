param(
  [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Error "ERROR: .env file not found: $EnvFile"
  exit 1
}

Write-Host "Loading environment variables from: $EnvFile"

Get-Content -LiteralPath $EnvFile | ForEach-Object {
  $line = $_.Trim()

  if ($line.Length -eq 0) { return }
  if ($line.StartsWith("#")) { return }

  $parts = $line -split "=", 2
  if ($parts.Count -ne 2) {
    Write-Warning ("Skipping invalid line: " + $line)
    return
  }

  $key = $parts[0].Trim()
  $value = $parts[1].Trim()

  if ([string]::IsNullOrWhiteSpace($key)) { return }

  [System.Environment]::SetEnvironmentVariable($key, $value, "User")
  Write-Host ("Set USER env var: " + $key)
}

Write-Host ""
Write-Host "Done. Restart your terminal / Visual Studio to pick up changes."
