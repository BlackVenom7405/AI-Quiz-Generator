# QuizGenius AI - PowerShell Single-File Runner
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "                    QuizGenius AI Launcher                      " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$VenvPython = Join-Path $ScriptDir "backend\venv\Scripts\python.exe"

if (Test-Path $VenvPython) {
    & $VenvPython (Join-Path $ScriptDir "run.py")
} else {
    python (Join-Path $ScriptDir "run.py")
}
