@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [BOOTSTRAP] Checking Windows development tools...
where powershell.exe >nul 2>nul || (
  echo [ERROR] Windows PowerShell is required to install the local runtimes.
  echo Install Windows PowerShell, then run start.bat again.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap-windows.ps1" -RepositoryRoot "%CD%" || goto :failed
if not exist "%~dp0.tools\runtime.cmd" goto :failed
call "%~dp0.tools\runtime.cmd"

if not defined PYTHON_EXE goto :failed
if not defined NPM_CMD goto :failed
"%PYTHON_EXE%" -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" || goto :failed
"%NODE_EXE%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)" || goto :failed

if not exist "backend\.venv\Scripts\python.exe" (
  echo [SETUP] Creating the Python environment...
  "%PYTHON_EXE%" -m venv "backend\.venv" || goto :failed
)

echo [SETUP] Updating Python packaging tools...
"backend\.venv\Scripts\python.exe" -m pip install --disable-pip-version-check --upgrade pip setuptools wheel || goto :failed

echo [SETUP] Installing backend dependencies...
"backend\.venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r "backend\requirements.txt" || goto :failed

if not exist "backend\.env" copy /y "backend\.env.example" "backend\.env" >nul
if not exist "frontend-web\.env" copy /y "frontend-web\.env.example" "frontend-web\.env" >nul

echo [SETUP] Installing web dependencies...
pushd "frontend-web"
call "%NPM_CMD%" install --no-audit --no-fund || (popd & goto :failed)
popd

echo [SETUP] Preparing the development database...
pushd "backend"
".venv\Scripts\python.exe" "scripts\migrate.py" || (popd & goto :failed)
".venv\Scripts\python.exe" "scripts\seed.py" || (popd & goto :failed)
popd

if /i "%~1"=="--setup-only" (
  echo.
  echo [READY] Fresh-PC setup completed successfully.
  exit /b 0
)

echo [START] Backend: http://localhost:8000/docs
start "Smart Society Backend" cmd /k "cd /d ""%~dp0backend"" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [START] Web app: http://localhost:5173
start "Smart Society Web" cmd /k "cd /d ""%~dp0frontend-web"" && npm.cmd run dev"

timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
exit /b 0

:failed
echo.
echo [ERROR] Setup failed. Check your internet connection and review the message above.
echo You can safely run start.bat again; completed installation steps will be reused.
pause
exit /b 1
