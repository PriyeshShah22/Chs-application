param(
    [Parameter(Mandatory = $true)]
    [string]$RepositoryRoot
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repository = [IO.Path]::GetFullPath($RepositoryRoot).TrimEnd('\', '/')
$tools = Join-Path $repository ".tools"
$pythonHome = Join-Path $tools "python"
$nodeHome = Join-Path $tools "node"
$runtimeFile = Join-Path $tools "runtime.cmd"
New-Item -ItemType Directory -Force -Path $tools | Out-Null

function Test-PythonRuntime([string]$Executable) {
    if (-not $Executable -or -not (Test-Path -LiteralPath $Executable)) { return $false }
    try {
        & $Executable -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" 2>$null
        return $LASTEXITCODE -eq 0
    } catch { return $false }
}

function Find-PythonRuntime {
    $local = Join-Path $pythonHome "python.exe"
    if (Test-PythonRuntime $local) { return $local }
    $command = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($command -and $command.Source -notlike "*\WindowsApps\*" -and (Test-PythonRuntime $command.Source)) {
        return $command.Source
    }
    return $null
}

function Test-NodeRuntime([string]$Executable) {
    if (-not $Executable -or -not (Test-Path -LiteralPath $Executable)) { return $false }
    try {
        & $Executable -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)" 2>$null
        return $LASTEXITCODE -eq 0
    } catch { return $false }
}

function Find-NodeRuntime {
    $local = Join-Path $nodeHome "node.exe"
    if (Test-NodeRuntime $local) { return $local }
    $command = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($command -and (Test-NodeRuntime $command.Source)) { return $command.Source }
    return $null
}

function Assert-ToolsChild([string]$Path) {
    $resolvedParent = [IO.Path]::GetFullPath($tools).TrimEnd('\') + '\'
    $resolvedTarget = [IO.Path]::GetFullPath($Path)
    if (-not $resolvedTarget.StartsWith($resolvedParent, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to modify a path outside the repository tools folder: $resolvedTarget"
    }
}

$pythonExe = Find-PythonRuntime
if (-not $pythonExe) {
    $pythonVersion = "3.12.10"
    $architecture = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } elseif ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "win32" }
    $suffix = if ($architecture -eq "win32") { "" } else { "-$architecture" }
    $installer = Join-Path $env:TEMP "panchayat-python-$pythonVersion$suffix.exe"
    $url = "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion$suffix.exe"

    Write-Host "[BOOTSTRAP] Python 3.11+ was not found. Downloading Python $pythonVersion from python.org..."
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $installer
    Assert-ToolsChild $pythonHome
    $arguments = "/quiet InstallAllUsers=0 Include_launcher=0 Include_test=0 Include_pip=1 PrependPath=0 TargetDir=`"$pythonHome`""
    $process = Start-Process -FilePath $installer -ArgumentList $arguments -Wait -PassThru
    Remove-Item -LiteralPath $installer -Force -ErrorAction SilentlyContinue
    if ($process.ExitCode -ne 0) { throw "Python installer failed with exit code $($process.ExitCode)." }
    $pythonExe = Find-PythonRuntime
    if (-not $pythonExe) { throw "Python installed but could not be validated." }
}

$nodeExe = Find-NodeRuntime
if (-not $nodeExe) {
    $nodeArchitecture = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } elseif ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    $fileKind = "win-$nodeArchitecture-zip"
    Write-Host "[BOOTSTRAP] Node.js 20+ was not found. Finding the current Node.js LTS release..."
    $releases = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json"
    $release = $releases | Where-Object { $_.lts -and $_.files -contains $fileKind } | Select-Object -First 1
    if (-not $release) { throw "No compatible Node.js LTS download was found for $nodeArchitecture." }

    $archiveName = "node-$($release.version)-win-$nodeArchitecture"
    $archive = Join-Path $env:TEMP "$archiveName.zip"
    $extract = Join-Path $tools "node-extract"
    Assert-ToolsChild $extract
    Assert-ToolsChild $nodeHome
    if (Test-Path -LiteralPath $extract) { Remove-Item -LiteralPath $extract -Recurse -Force }
    if (Test-Path -LiteralPath $nodeHome) { Remove-Item -LiteralPath $nodeHome -Recurse -Force }

    Write-Host "[BOOTSTRAP] Downloading Node.js $($release.version) LTS from nodejs.org..."
    Invoke-WebRequest -UseBasicParsing -Uri "https://nodejs.org/dist/$($release.version)/$archiveName.zip" -OutFile $archive
    Expand-Archive -LiteralPath $archive -DestinationPath $extract -Force
    Move-Item -LiteralPath (Join-Path $extract $archiveName) -Destination $nodeHome
    Remove-Item -LiteralPath $extract -Recurse -Force
    Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
    $nodeExe = Find-NodeRuntime
    if (-not $nodeExe) { throw "Node.js downloaded but could not be validated." }
}

$nodeDirectory = Split-Path -Parent $nodeExe
$npmCmd = Join-Path $nodeDirectory "npm.cmd"
if (-not (Test-Path -LiteralPath $npmCmd)) { throw "npm.cmd was not found beside Node.js at $nodeDirectory." }

$runtimeLines = @(
    "@echo off",
    "set `"PYTHON_EXE=$pythonExe`"",
    "set `"NODE_EXE=$nodeExe`"",
    "set `"NPM_CMD=$npmCmd`"",
    "set `"PATH=$nodeDirectory;%PATH%`""
)
[IO.File]::WriteAllLines($runtimeFile, $runtimeLines, [Text.UTF8Encoding]::new($false))

Write-Host "[BOOTSTRAP] Python: $pythonExe"
Write-Host "[BOOTSTRAP] Node.js: $nodeExe"
Write-Host "[BOOTSTRAP] Runtime prerequisites are ready."
