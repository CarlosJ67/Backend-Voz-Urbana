@echo off
echo ===============================================
echo    INSTALADOR DE DEPENDENCIAS PYTHON
echo    Proyecto: Voz Urbana Backend
echo ===============================================
echo.
echo Instalando dependencias de Python...
echo.

pip install -r requirements.txt

echo.
echo ===============================================
echo    INSTALACION COMPLETADA
echo ===============================================
echo.
echo Para verificar la instalacion, ejecuta:
echo python -c "import mysql.connector, sklearn, pandas; print('Todas las dependencias instaladas correctamente')"
echo.
pause