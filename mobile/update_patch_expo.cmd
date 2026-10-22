@echo off
setlocal
title Academia App - Envio ao Expo
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_patch_expo.ps1"
set "codigoEnvio=%ERRORLEVEL%"
echo.
if not "%codigoEnvio%"=="0" echo O envio nao foi concluido. Confira as mensagens acima.
echo Pressione uma tecla para fechar esta janela.
pause >nul
exit /b %codigoEnvio%
