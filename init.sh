#!/bin/sh
rm -rf ./server/files/*
mysql -u admin -ppassword < ./server/init_db.sql
