#!/bin/sh
echo "=== Environment Variables at startup ===" >>/proc/1/fd/1

env | sort >>/proc/1/fd/1

# Replace placeholders in HTML
sed -i "s/HOSTNAME_PLACEHOLDER/$HOSTNAME/g" /usr/share/nginx/html/index.html
sed -i "s/TEE_TYPE_PLACEHOLDER/$TEE_TYPE/g" /usr/share/nginx/html/index.html
sed -i "s/ORACLE_VERSION_PLACEHOLDER/${ORACLE_VERSION:-Unknown}/g" /usr/share/nginx/html/index.html

# Inject environment variables into JavaScript
# Default ORACLE_ENABLED to true and GUARDIAN_ENABLED to false if not set
ORACLE_ENABLED_VALUE="${ORACLE_ENABLED:-true}"
GUARDIAN_ENABLED_VALUE="${GUARDIAN_ENABLED:-false}"

# Create a script tag to inject these variables
cat > /usr/share/nginx/html/env-config.js << EOF
// Environment variables injected by the container
const ORACLE_ENABLED = '${ORACLE_ENABLED_VALUE}';
const GUARDIAN_ENABLED = '${GUARDIAN_ENABLED_VALUE}';

// Override endpoint URLs if provided
const ORACLE_MAINNET_URL = '${ORACLE_MAINNET_URL:-/mainnet/gateway/api/v1/test}';
const ORACLE_DEVNET_URL = '${ORACLE_DEVNET_URL:-/devnet/gateway/api/v1/test}';
const GUARDIAN_MAINNET_URL = '${GUARDIAN_MAINNET_URL:-/mainnet/guardian/api/v1/test}';
const GUARDIAN_DEVNET_URL = '${GUARDIAN_DEVNET_URL:-/devnet/guardian/api/v1/test}';
EOF

# Insert the script tag reference in the HTML head
sed -i '/<head>/a \    <script src="env-config.js"></script>' /usr/share/nginx/html/index.html

# Update the endpoint URLs in the HTML
sed -i "s|https://HOSTNAME_PLACEHOLDER/mainnet/oracle/api/v1/test|https://${HOSTNAME}${ORACLE_MAINNET_URL:-/mainnet/gateway/api/v1/test}|g" /usr/share/nginx/html/index.html
sed -i "s|https://HOSTNAME_PLACEHOLDER/devnet/oracle/api/v1/test|https://${HOSTNAME}${ORACLE_DEVNET_URL:-/devnet/gateway/api/v1/test}|g" /usr/share/nginx/html/index.html

# Handle Oracle and Guardian visibility based on environment variables
if [ "${ORACLE_ENABLED_VALUE}" = "true" ]; then
  sed -i 's/id="oracle-mainnet-logo-card" style="display: none;"/id="oracle-mainnet-logo-card"/g' /usr/share/nginx/html/index.html
  sed -i 's/id="oracle-devnet-logo-card" style="display: none;"/id="oracle-devnet-logo-card"/g' /usr/share/nginx/html/index.html
fi

if [ "${GUARDIAN_ENABLED_VALUE}" = "true" ]; then
  sed -i 's/id="guardian-mainnet-logo-card" style="display: none;"/id="guardian-mainnet-logo-card"/g' /usr/share/nginx/html/index.html
  sed -i 's/id="guardian-devnet-logo-card" style="display: none;"/id="guardian-devnet-logo-card"/g' /usr/share/nginx/html/index.html
fi
