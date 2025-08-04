@echo off

REM Set environment variables for Docker registry
set IMAGE_NAME=registry.gitlab.com/dblab-system/dblab-web
set IMAGE_TAG=1.0.7

echo Building web ...
call npm run build
REM Build the Docker image
echo Building Docker image %IMAGE_NAME%:%IMAGE_TAG%...
call docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

REM Check if the build was successful
IF %ERRORLEVEL% NEQ 0 (
    echo Docker build failed. Exiting...
    exit /b %ERRORLEVEL%
)

REM Push the Docker image to the registry
echo Pushing Docker image to %IMAGE_NAME%:%IMAGE_TAG%...
call docker push %IMAGE_NAME%:%IMAGE_TAG%

REM Check if the push was successful
IF %ERRORLEVEL% NEQ 0 (
    echo Docker push failed. Exiting...
    exit /b %ERRORLEVEL%
)

echo Docker image %IMAGE_NAME%:%IMAGE_TAG% built and pushed successfully.
pause