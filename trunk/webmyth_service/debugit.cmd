@echo off

plink -P 10022 root@localhost -pw "" "killall -9 gdbserver telnet_pdk_service"
plink -P 10022 root@localhost -pw "" "/usr/bin/gdbserver host:2345 /media/internal/telnet_pdk_service &"
