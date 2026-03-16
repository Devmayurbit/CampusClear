@echo off
REM CDGI No-Dues Portal - Quick Setup Script for Windows

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   CDGI No-Dues Portal - Initialization Setup      ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Step 1: Check Node.js
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Step 2: Install dependencies
echo.
echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Step 3: Setup environment file
echo.
echo [3/5] Setting up environment variables...
if not exist ".env" (
    copy server\.env.example .env >nul
    echo [OK] Created .env file from template
    echo [WARNING] Please edit .env with your configuration:
    echo   - MONGO_URI (local or MongoDB Atlas^)
    echo   - EMAIL_USER, EMAIL_PASS (Gmail or other^)
    echo   - JWT_SECRET (change to secure random value^)
) else (
    echo [OK] .env file already exists
)

REM Step 4: Setup frontend env
echo.
echo [4/5] Setting up frontend environment...
if not exist "client\.env.local" (
    (
        echo VITE_API_URL=http://localhost:3000
    ) > client\.env.local
    echo [OK] Created client\.env.local
) else (
    echo [OK] client\.env.local already exists
)

REM Step 5: Final instructions
echo.
echo [5/5] Setup complete!
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║        Setup Complete - Ready to Run!             ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo Next Steps:
echo.
echo 1. Configure .env file:
echo    - Open .env in a text editor
echo    - Set MONGO_URI (MongoDB connection string^)
echo    - Set EMAIL_USER and EMAIL_PASS (Gmail or SMTP^)
echo    - Set JWT_SECRET to a secure random value
echo.
echo 2. Start MongoDB (if using local^):
echo    - Command: mongod
echo    - Or start MongoDB service from Services app
echo.
echo 3. Open two Command Prompts:
echo.
echo    Command Prompt 1 - Start Backend:
echo    npm run backend:dev
echo    Should show: Running on http://localhost:3000
echo.
echo    Command Prompt 2 - Start Frontend:
echo    cd client
echo    npm run dev
echo    Should show: Local: http://localhost:5173
echo.
echo 4. Open in browser:
echo    http://localhost:5173
echo.
echo 5. Test the system:
echo    - Register new student account
echo    - Verify email
echo    - Login as student, faculty, or admin
echo    - Test no-dues workflow
echo.
echo Documentation:
echo   - Backend: BACKEND_README.md
echo   - Setup:   SETUP_GUIDE.md
echo.
echo Good luck!
echo.

pause
