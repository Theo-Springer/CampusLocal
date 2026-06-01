# Find processes with server.log or CampusLocal in command line
Write-Host "-> Recherche de processus avec 'server.log' ou 'CampusLocal' dans la ligne de commande"
$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and ($_.CommandLine -match 'server.log' -or $_.CommandLine -match 'CampusLocal') }
if ($null -ne $procs) {
    $procs | Select-Object ProcessId, Name, CommandLine | ForEach-Object {
        Write-Host "PID: $($_.ProcessId) Name: $($_.Name)"
        Write-Host "CMD: $($_.CommandLine)"
        Write-Host "---"
    }
} else {
    Write-Host "Aucun processus trouvé via CommandLine match."
}
