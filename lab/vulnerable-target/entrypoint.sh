#!/bin/sh
set -eu

mkdir -p /srv/labdata /var/run/vsftpd/empty
chmod -R 0777 /srv/labdata

if ! grep -q "documento_01" /srv/labdata/.seeded 2>/dev/null; then
  for i in $(seq -w 1 40); do
    echo "Documento de laboratorio ${i}" > "/srv/labdata/documento_${i}.txt"
  done
  echo "documento_01" > /srv/labdata/.seeded
fi

# Weak SMB users for controlled vulnerability tests.
if ! pdbedit -L | grep -q "^admin:"; then
  (echo "admin"; echo "admin") | smbpasswd -s -a admin >/dev/null
fi
if ! pdbedit -L | grep -q "^user:"; then
  (echo "password"; echo "password") | smbpasswd -s -a user >/dev/null
fi

/usr/sbin/inetd -f &
/usr/sbin/vsftpd /etc/vsftpd.conf &
/usr/sbin/smbd --foreground --no-process-group &
/usr/sbin/nmbd --foreground --no-process-group &

wait -n
