# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "Starting Vite dev server..." -ForegroundColor Cyan

# Ensure we are in the project directory
Set-Location -Path $PSScriptRoot

# Load environment variables from the .env file two levels up
$envFilePath = Join-Path $PSScriptRoot "..\..\.env"
$loadedEnvVars = @()

if (Test-Path $envFilePath) {
    Write-Host "Loading environment variables from $envFilePath" -ForegroundColor Yellow
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Length -lt 2) {
            return
        }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()

        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Trim('"')
        } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
            $value = $value.Trim("'")
        }

        Set-Item -Path "Env:$name" -Value $value
        $loadedEnvVars += [PSCustomObject]@{ Name = $name; Value = $value }
    }
} else {
    Write-Host "No .env file found at $envFilePath" -ForegroundColor DarkYellow
}

# Ensure node_modules exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start Vite
Write-Host "Running Vite on http://localhost:5174" -ForegroundColor Green
$viteProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--", "--clearScreen", "false" -NoNewWindow -PassThru

Write-Host "Environment variables loaded for Vite:" -ForegroundColor Cyan
if ($loadedEnvVars.Count -eq 0) {
    Write-Host "No environment variables were loaded from the .env file." -ForegroundColor DarkYellow
} else {
    $loadedEnvVars | ForEach-Object {
        Write-Host "$($_.Name)=$($_.Value)"
    }
}

Wait-Process -Id $viteProcess.Id
