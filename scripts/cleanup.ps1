# Cleanup script: stop common services and remove legacy folders
$ErrorActionPreference = 'Continue'
Write-Host '-> Recherche des processus sur les ports 8000, 5173, 5174'
$ports = @(8000,5173,5174)
foreach ($port in $ports) {
    $lines = netstat -ano | findstr ":$port"
    if ($lines) {
        $pids = $lines | ForEach-Object { ($_ -replace '^\\s+','') -split '\\s+' | Select-Object -Last 1 } | Sort-Object -Unique
        foreach ($pid in $pids) {
            Write-Host "-> Tenter d'arreter PID $pid (port $port)"
            try {
                taskkill /PID $pid /F | Out-Null
                Write-Host "  PID $pid arreté"
            } catch {
                Write-Host "  Impossible d'arreter PID $pid :" $_.Exception.Message
            }
        }
    } else {
        Write-Host "-> Aucun process trouvé sur le port $port"
    }
}

Write-Host "-> Tentative de suppression des dossiers legacy"
$itemsToRemove = @('back','front','logs','.venv')
foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        try {
            Remove-Item -LiteralPath $item -Recurse -Force -ErrorAction Stop
            Write-Host "Supprimé: $item"
        } catch {
            Write-Host "Impossible de supprimer $item :" $_.Exception.Message
        }
    } else {
        Write-Host "Non trouvé: $item"
    }
}

Write-Host "-> Suppression des node_modules dans packages/*"
$pkgDirs = Get-ChildItem -Path .\\packages -Directory -Recurse -Force -ErrorAction SilentlyContinue
foreach ($d in $pkgDirs) {
    $pathnm = Join-Path $d.FullName 'node_modules'
    if (Test-Path $pathnm) {
        try {
            Remove-Item -LiteralPath $pathnm -Recurse -Force -ErrorAction Stop
            Write-Host "Supprimé: $pathnm"
        } catch {
            Write-Host "Erreur suppression $pathnm :" $_.Exception.Message
        }
    }
}

Write-Host "`n-> Listing racine après suppressions:"
Get-ChildItem -Force | ForEach-Object { if ($_.PSIsContainer) { Write-Host "DIR: $($_.Name)/" } else { Write-Host "FILE: $($_.Name)" } }
