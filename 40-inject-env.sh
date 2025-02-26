#!/bin/sh
echo "=== Environment Variables at startup ===" >>/proc/1/fd/1

env | sort >>/proc/1/fd/1

sed -i "s/HOSTNAME_PLACEHOLDER/$HOSTNAME/g" /usr/share/nginx/html/index.html
sed -i "s/TEE_TYPE_PLACEHOLDER/$TEE_TYPE/g" /usr/share/nginx/html/index.html
sed -i "s/ORACLE_VERSION_PLACEHOLDER/${ORACLE_VERSION:-Unknown}/g" /usr/share/nginx/html/index.html
