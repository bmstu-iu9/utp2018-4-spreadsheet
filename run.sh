#!/bin/bash

cd ./save_service && mkdir -p ./logs/ && node save_service.js > ./logs/save_service_log.log &
cd ./auth_service && mkdir -p ./logs/ && node auth_service.js > ./logs/auth_service_log.log &
mkdir -p ./logs/ && node app.js > ./logs/main_service_log.log &
echo 'All servers on'