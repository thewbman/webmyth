@echo off

plink -P 10022 root@localhost -pw "" "killall -9 gdbserver telnet_pdk_service"
pscp -scp -P 10022 -pw "" telnet_pdk_service root@localhost:/media/internal
