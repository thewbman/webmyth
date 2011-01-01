@echo off
@rem Set the device you want to build for to 1
set PRE=0
set PIXI=1
set DEBUG=0

@rem List your source files here
set SRC=webmyth_service.cpp

@rem List the libraries needed
set LIBS=-lSDL -lGLESv2 -lpdl

@rem Name your output executable
set OUTFILE=webmyth_service

if %PRE% equ 0 if %PIXI% equ 0 goto :END

if %DEBUG% equ 1 (
   set DEVICEOPTS=-g
) else (
   set DEVICEOPTS=
)

if %PRE% equ 1 (
   set DEVICEOPTS=%DEVICEOPTS% -mcpu=cortex-a8 -mfpu=neon -mfloat-abi=softfp
)

if %PIXI% equ 1 (
   set DEVICEOPTS=%DEVICEOPTS% -mcpu=arm1136jf-s -mfpu=vfp -mfloat-abi=softfp
)

echo %DEVICEOPTS%

arm-none-linux-gnueabi-g++ %DEVICEOPTS% -o %OUTFILE% %SRC% "-I%PALMPDK%\include" "-I%PALMPDK%\include\SDL" "-L%PALMPDK%\device\lib" -Wl,--allow-shlib-undefined %LIBS%

copy /Y %OUTFILE% ..\2.0\WebMyth

goto :EOF

:END
echo Please select the target device by editing the PRE/PIXI variable in this file.
exit /b 1

