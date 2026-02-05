# Quick Start Script for ChatMakere

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ChatMakere - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js v18 or higher." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if backend .env exists
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠ Backend .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create server\.env file with your Supabase credentials." -ForegroundColor Yellow
    Write-Host "See server\.env.example for reference." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if frontend .env exists
if (-not (Test-Path "client\.env")) {
    Write-Host "⚠ Frontend .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create client\.env file with your configuration." -ForegroundColor Yellow
    Write-Host "See client\.env.example for reference." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your .env files (see SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "2. Run the backend:  cd server && npm run dev" -ForegroundColor White
Write-Host "3. Run the frontend: cd client && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
