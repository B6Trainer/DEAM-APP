@echo off
setlocal enabledelayedexpansion


rem Set the home path
set "homePath=C:\Projects\deam"

rem Set the relative paths for the source and destination folders
set "sourceRelativePath=DEAM-APP\dist"
set "destinationRelativePath=build"

rem Build the full paths using the home path
set "sourceFolder=!homePath!\!sourceRelativePath!"
set "destinationFolder=!homePath!\!destinationRelativePath!"

rem Build the timestamp in the format YYYYMMDD-HHMMSS
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "timestamp=%%c%%a%%b"
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set "timestamp=!timestamp!-%%a%%b"
)

rem Set the name prefix
set "namePrefix=deamappbuild"

rem Get the current date and time in a format suitable for filenames
for /f "delims=" %%a in ('wmic OS Get localdatetime ^| find "."') do (
    set "timestamp=%%a"
)

rem Set the name of the zip file including the prefix and timestamp
set "zipFileName=!namePrefix!!timestamp:~0,14!.zip"

rem Build the full paths for source, destination, and the zip file
set "sourcePath=!sourceFolder!\*"
set "destinationPath=!destinationFolder!\!zipFileName!"

rem Check if the destination folder exists, create it if not
if not exist "!destinationFolder!" mkdir "!destinationFolder!"

rem Use PowerShell to zip the folder
powershell -command "Compress-Archive -Path '!sourcePath!' -DestinationPath '!destinationPath!'"

echo "Folder has been zipped and saved to the destination folder with timestamp."

rem Print source path, destination path, and zip file name
echo Source Path: !sourcePath!
echo Destination Path: !destinationPath!
echo Zip File Name: !zipFileName!


endlocal
