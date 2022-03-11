npx kill-port 8080

Set-Location -Path "C:\Dev\webveiwer\webviewer-ui"

npm run build

Get-ChildItem -Path 'C:\Dev\fileman2\Bundle\Web\Fileman2.Bundle.Web.Client\clientapp\public\webviewer\ui' -Include * -File -Recurse | ForEach-Object { $_.Delete()} -Recurse

Copy-Item -Path "C:\Dev\webveiwer\webviewer-ui\build\*" -Destination "C:\Dev\fileman2\Bundle\Web\Fileman2.Bundle.Web.Client\clientapp\public\webviewer\ui" -Recurse

Set-Location -Path "C:\Dev\fileman2\Bundle\Web\Fileman2.Bundle.Web.Client\clientapp"

Start-Process -FilePath "cmd.exe"  -ArgumentList '/c npm run serve'