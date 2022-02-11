#! /bin/bash
cd ~/lucky-parking/js
sudo git pull
pm2 stop "npm run server:dev"
# kill the node process
sudo pkill -f 'nodemon'
sudo pkill -f 'node'
# restart sql
sudo systemctl restart postgresql
# install packages silently
npm install &>/dev/null
# start the server then exit the cmd shell
pm2 start "npm run server:dev"
