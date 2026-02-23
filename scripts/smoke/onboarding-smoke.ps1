param()

Write-Host "Running onboarding smoke validation..."

if (-not (Test-Path "package.json")) {
  Write-Error "package.json not found"
  exit 1
}

Write-Host "Step 1: package.json found"
Write-Host "Step 2: Verify workspace manifests"
$required = @('apps/api/package.json','apps/web/package.json','apps/cli/package.json')
foreach ($file in $required) {
  if (-not (Test-Path $file)) {
    Write-Error "Missing file: $file"
    exit 1
  }
}

Write-Host "Onboarding smoke validation passed."
