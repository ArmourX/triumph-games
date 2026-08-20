param(
    [string]$UnityPath = "",
    [switch]$Deploy
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ProjectPath = Join-Path $RepoRoot "unity\MonsterCollect"
$OutputDir = Join-Path $RepoRoot "qrm"

function Find-UnityEditor {
    param([string]$Version = "6000.3.22f1")

    if ($UnityPath -and (Test-Path $UnityPath)) {
        return $UnityPath
    }

    $hubRoot = Join-Path ${env:ProgramFiles} "Unity\Hub\Editor"
    if (Test-Path $hubRoot) {
        $match = Get-ChildItem $hubRoot -Directory |
            Where-Object { $_.Name -like "$Version*" } |
            Sort-Object Name -Descending |
            Select-Object -First 1
        if ($match) {
            return Join-Path $match.FullName "Editor\Unity.exe"
        }
    }

    throw "Unity $Version not found. Install via Unity Hub or pass -UnityPath."
}

$unity = Find-UnityEditor
Write-Host "Building WebGL with $unity"

& $unity `
    -batchmode -nographics -quit `
    -projectPath $ProjectPath `
    -executeMethod MonsterCollect.Editor.WebGLBuildSetup.BuildForVercel `
    -logFile -

if ($LASTEXITCODE -ne 0) {
    throw "Unity WebGL build failed (exit $LASTEXITCODE)."
}

Write-Host "WebGL build output: $OutputDir"

if ($Deploy) {
    Push-Location $OutputDir
    try {
        npx vercel deploy --prod --yes
    }
    finally {
        Pop-Location
    }
}
