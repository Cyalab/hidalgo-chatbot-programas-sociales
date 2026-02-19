# Check if Python 3.12 is available via py launcher
try {
    $version = py -3.12 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Python 3.12 found: $version" -ForegroundColor Green
    } else {
        Write-Error "Python 3.12 not found via 'py' launcher. Please ensure it is installed."
        exit 1
    }
} catch {
    Write-Error "Failed to check Python version. Make sure 'py' launcher is installed."
    exit 1
}

# Create virtual environment if it doesn't exist
$venvPath = Join-Path $PSScriptRoot "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment at $venvPath..." -ForegroundColor Cyan
    py -3.12 -m venv $venvPath
} else {
    Write-Host "Virtual environment already exists at $venvPath" -ForegroundColor Yellow
}

# Path to activate script
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

# Check if activate script exists
if (-not (Test-Path $activateScript)) {
    Write-Error "Activation script not found at $activateScript. Venv creation might have failed."
    exit 1
}

# Activate environment for the current process to install packages
# Note: This only affects the current script execution scope usually, 
# but we can use the python executable in the venv directly.

$pythonExecutable = Join-Path $venvPath "Scripts\python.exe"
$pipExecutable = Join-Path $venvPath "Scripts\pip.exe"

Write-Host "Using Python executable: $pythonExecutable" -ForegroundColor Cyan

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Cyan
& $pythonExecutable -m pip install --upgrade pip

# Install requirements
$reqFile = Join-Path $PSScriptRoot "requirements.txt"
if (Test-Path $reqFile) {
    Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Cyan
    # Install torch with CUDA support first
    & $pipExecutable install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    & $pipExecutable install -r $reqFile
} else {
    Write-Warning "requirements.txt not found at $reqFile"
}

Write-Host "Setup complete! To activate the environment run: .\venv\Scripts\Activate.ps1" -ForegroundColor Green
