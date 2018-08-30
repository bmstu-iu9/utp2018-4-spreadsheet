#!/bin/bash

gnome-terminal -e "bash -c 'cd ./save_service && node ./save_service.js'"
gnome-terminal -e "bash -c 'cd ./auth_service && node ./auth_service.js'"
gnome-terminal -e "node app.js"