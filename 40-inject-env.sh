#!/bin/sh
echo "=== Environment Variables at startup ===" >>/proc/1/fd/1

env | sort >>/proc/1/fd/1

# Replace placeholders in HTML
sed -i "s/HOSTNAME_PLACEHOLDER/$HOSTNAME/g" /usr/share/nginx/html/index.html
sed -i "s/TEE_TYPE_PLACEHOLDER/$TEE_TYPE/g" /usr/share/nginx/html/index.html
sed -i "s/ORACLE_VERSION_PLACEHOLDER/${ORACLE_VERSION:-Unknown}/g" /usr/share/nginx/html/index.html

# Handle Oracle and Guardian visibility based on environment variables
if [ "${ORACLE_ENABLED:-true}" = "true" ]; then
  sed -i 's/id="oracle-mainnet-logo-card" style="display: none;"/id="oracle-mainnet-logo-card"/g' /usr/share/nginx/html/index.html
  sed -i 's/id="oracle-devnet-logo-card" style="display: none;"/id="oracle-devnet-logo-card"/g' /usr/share/nginx/html/index.html
fi

if [ "${GUARDIAN_ENABLED:-false}" = "true" ]; then
  sed -i 's/id="guardian-mainnet-logo-card" style="display: none;"/id="guardian-mainnet-logo-card"/g' /usr/share/nginx/html/index.html
  sed -i 's/id="guardian-devnet-logo-card" style="display: none;"/id="guardian-devnet-logo-card"/g' /usr/share/nginx/html/index.html
fi
