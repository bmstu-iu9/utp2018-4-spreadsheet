#!/bin/bash

APPS_LIST="node app.js node auth_service.js node save_service.js"
for pid_i in $(pidof node)
do
    if echo "$APPS_LIST" | grep -q "$(xargs -0 < /proc/$pid_i/cmdline)"; then
        echo "kill $pid_i"
        kill -INT $pid_i
    else
        echo "no mathced"
    fi
done
echo "stop done"