# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "Starting Vite dev server..." -ForegroundColor Cyan

# Ensure we are in the project directory
Set-Location -Path $PSScriptRoot

# Ensure node_modules exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start Vite
Write-Host "Running Vite on http://localhost:5174" -ForegroundColor Green
npm run dev --clearScreen false