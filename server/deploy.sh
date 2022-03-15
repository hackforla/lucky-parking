#! /bin/bash
cd ~/lucky-parking/server
# Pull code from repo
sudo git pull
# Stop docker
sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
# Restart database
sudo systemctl restart postgresql
# Run docker in production mode
sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d