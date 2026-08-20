# Triumph Guides - push backend env vars to Vercel and init the database.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env.local"

if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $root ".env.example") $envFile
  Write-Host "Created .env.local - fill in Turso values and run again."
  exit 1
}

function Read-EnvFile($path) {
  $vars = @{}
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    if ($_ -match '^([^=]+)=(.*)$') {
      $vars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
  }
  return $vars
}

function Add-VercelEnv($name, $value) {
  Write-Host "Adding $name to Vercel..."
  npx vercel env add $name production,preview --value $value --force --yes
}

$config = Read-EnvFile $envFile
$required = @("TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "JWT_SECRET")

foreach ($key in $required) {
  $val = $config[$key]
  if (-not $val -or $val -match 'your-|change-me') {
    Write-Error "Set $key in .env.local before running this script."
  }
}

Push-Location $root
try {
  foreach ($key in $required) {
    Add-VercelEnv $key $config[$key]
  }

  if ($config["BLOB_READ_WRITE_TOKEN"] -and $config["BLOB_READ_WRITE_TOKEN"] -notmatch 'vercel_blob_rw_\.\.\.') {
    Add-VercelEnv "BLOB_READ_WRITE_TOKEN" $config["BLOB_READ_WRITE_TOKEN"]
  } else {
    Write-Host ""
    Write-Host "Note: BLOB_READ_WRITE_TOKEN not set in .env.local."
    Write-Host "Create a Blob store in Vercel: Project -> Storage -> Create -> Blob (public access)."
    Write-Host "Connect it to Production and Preview. Vercel adds BLOB_READ_WRITE_TOKEN automatically."
    Write-Host "Then run: npx vercel env pull .env.local   (or paste the token into .env.local and re-run this script)"
  }

  Write-Host "Initializing database schema..."
  $env:TURSO_DATABASE_URL = $config["TURSO_DATABASE_URL"]
  $env:TURSO_AUTH_TOKEN = $config["TURSO_AUTH_TOKEN"]
  npm run db:init

  Write-Host ""
  Write-Host "Done. Redeploy with: npx vercel deploy --prod"
} finally {
  Pop-Location
}
