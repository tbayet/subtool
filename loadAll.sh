#!/bin/sh
./sql_user.sh;
./init.sh;
npm install; cd server; npm install; cd ..;
npm run serve;
