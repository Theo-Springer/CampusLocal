@echo off
setlocal
cd /d "%~dp0"

if not exist "logs" mkdir "logs"
if not exist "back\data" mkdir "back\data"

REM Create venv if missing
if not exist "%~dp0.venv\Scripts\python.exe" (
    echo 
    echo Virtualenv introuvable. Tentative de creation de ".venv"...
    REM Try with python, then py
    where python >nul 2>nul
    if %ERRORLEVEL%==0 (
        python -m venv "%~dp0.venv"
    ) else (
        where py >nul 2>nul
        if %ERRORLEVEL%==0 (
            py -3 -m venv "%~dp0.venv"
        ) else (
            echo Aucun interpreteur Python trouve. Installez Python puis relancez.
            pause
            exit /b 1
        )
    )
    if exist "%~dp0.venv\Scripts\pip.exe" (
        echo Mise a jour de pip dans le venv...
        "%~dp0.venv\Scripts\pip.exe" install --upgrade pip >nul 2>&1 || echo pip update failed
    )
    echo Virtualenv cree.
)

REM Prefer venv python, fallback to system python
set PY_RUN=
set PY_FLAGS=
if exist "%~dp0.venv\Scripts\python.exe" (
    set "PY_RUN=%~dp0.venv\Scripts\python.exe"
) else (
    where python >nul 2>nul && (set "PY_RUN=python") || (where py >nul 2>nul && (set "PY_RUN=py" & set "PY_FLAGS=-3") )
)

start "Campus Connect" /B cmd /c ""%PY_RUN%" %PY_FLAGS% "%~dp0back\server.py" > "%~dp0logs\server.log" 2>&1"

timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:3000/"

echo.
echo Campus Connect est lance.
echo Ferme cette fenetre pour arreter le lancement.
pause >nul
