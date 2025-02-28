const teeTypeElement = document.querySelector('[data-tee-type]');
const teeType = teeTypeElement.textContent.trim();

// Service endpoints configuration
let serviceEndpoints = {
    guardianMainnet: {
        url: '/mainnet/guardian/api/v1/test',
        enabled: false
    },
    guardianDevnet: {
        url: '/devnet/guardian/api/v1/test',
        enabled: false
    },
    oracleMainnet: {
        url: '/mainnet/gateway/api/v1/test',
        enabled: false
    },
    oracleDevnet: {
        url: '/devnet/gateway/api/v1/test',
        enabled: false
    }
};

function updateUIForTEEType() {
    const teeInfoElement = document.getElementById('tee-info');

    // Default content for unknown TEE type
    let teeContent = `
        <p>This oracle is running in a secure environment.</p>
        <div class="terminal-line">
            <div class="terminal-prompt">$</div>
            <div class="terminal-output">TEE Type: Unknown</div>
        </div>
    `;

    // Set content based on TEE type
    if (teeType.includes('COCO-DEV')) {
        teeContent = `
            <p>This oracle is running in a Confidential Container (CoCo) development environment, simulating hardware-level isolation and attestation.</p>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">TEE Type: Confidential Container (CoCo-Dev)</div>
            </div>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">Security Features: Simulated Memory Encryption, Attestation, Secure Boot</div>
            </div>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">Note: Development environment for testing purposes</div>
            </div>
        `;
    } else if (teeType.includes('SEV-SNP')) {
        teeContent = `
            <p>This oracle is running in an AMD SEV-SNP (Secure Encrypted Virtualization-Secure Nested Paging) environment, providing the highest level of hardware-based security isolation.</p>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">TEE Type: AMD SEV-SNP</div>
            </div>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">Security Features: Advanced Memory Encryption, Hardware-based Attestation, Secure Boot</div>
            </div>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">Protection: Hypervisor-level Attack Prevention, Memory Integrity Protection</div>
            </div>
            <div class="terminal-line">
                <div class="terminal-prompt">$</div>
                <div class="terminal-output">Verification: Cryptographic Measurement of VM State, Secure Key Management</div>
            </div>
        `;
    }

    teeInfoElement.innerHTML = teeContent;
}

// Setup service endpoints based on environment variables
function setupEndpoints() {
    // Read environment variables if they exist
    if (typeof GUARDIAN_MAINNET_ENABLED !== 'undefined') {
        serviceEndpoints.guardianMainnet.enabled = GUARDIAN_MAINNET_ENABLED === 'true';
    }

    if (typeof GUARDIAN_DEVNET_ENABLED !== 'undefined') {
        serviceEndpoints.guardianDevnet.enabled = GUARDIAN_DEVNET_ENABLED === 'true';
    }

    if (typeof ORACLE_MAINNET_ENABLED !== 'undefined') {
        serviceEndpoints.oracleMainnet.enabled = ORACLE_MAINNET_ENABLED === 'true';
    }

    if (typeof ORACLE_DEVNET_ENABLED !== 'undefined') {
        serviceEndpoints.oracleDevnet.enabled = ORACLE_DEVNET_ENABLED === 'true';
    }

    // Override URLs if custom ones are provided
    if (typeof GUARDIAN_MAINNET_URL !== 'undefined') {
        serviceEndpoints.guardianMainnet.url = GUARDIAN_MAINNET_URL;
    }

    if (typeof GUARDIAN_DEVNET_URL !== 'undefined') {
        serviceEndpoints.guardianDevnet.url = GUARDIAN_DEVNET_URL;
    }

    if (typeof ORACLE_MAINNET_URL !== 'undefined') {
        serviceEndpoints.oracleMainnet.url = ORACLE_MAINNET_URL;
    }

    if (typeof ORACLE_DEVNET_URL !== 'undefined') {
        serviceEndpoints.oracleDevnet.url = ORACLE_DEVNET_URL;
    }
}

// Check if a service is responsive by making a fetch request
async function checkServiceStatus(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            // Short timeout to prevent long waits
            signal: AbortSignal.timeout(5000)
        });

        return response.status === 200;
    } catch (error) {
        console.error(`Error checking service at ${endpoint}:`, error);
        return false;
    }
}

// Update the UI for a specific service card
function updateServiceCard(serviceId, isEnabled, isOnline) {
    const card = document.getElementById(`${serviceId}-logo-card`);
    const statusIndicator = document.getElementById(`${serviceId}-status`);
    const statusText = document.getElementById(`${serviceId}-status-text`);

    if (!card) return;

    // Show the card if the service is enabled
    if (isEnabled) {
        card.style.display = 'block';

        // Update status indicator based on online status
        if (isOnline) {
            statusIndicator.classList.remove('offline');
            statusIndicator.classList.add('online');
            statusText.textContent = 'Online';
            card.classList.remove('deactivated');
        } else {
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusText.textContent = 'Offline';
            card.classList.add('deactivated');
        }
    } else {
        // If service is not enabled, show it as deactivated
        card.style.display = 'block';
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Disabled';
        card.classList.add('deactivated');
    }
}

// Check all services and update their status
async function checkServices() {
    // Guardian Mainnet
    if (serviceEndpoints.guardianMainnet.enabled) {
        const isOnline = await checkServiceStatus(serviceEndpoints.guardianMainnet.url);
        updateServiceCard('guardian-mainnet', true, isOnline);
    } else {
        updateServiceCard('guardian-mainnet', false, false);
    }

    // Guardian Devnet
    if (serviceEndpoints.guardianDevnet.enabled) {
        const isOnline = await checkServiceStatus(serviceEndpoints.guardianDevnet.url);
        updateServiceCard('guardian-devnet', true, isOnline);
    } else {
        updateServiceCard('guardian-devnet', false, false);
    }

    // Oracle Mainnet
    if (serviceEndpoints.oracleMainnet.enabled) {
        const isOnline = await checkServiceStatus(serviceEndpoints.oracleMainnet.url);
        updateServiceCard('oracle-mainnet', true, isOnline);
    } else {
        updateServiceCard('oracle-mainnet', false, false);
    }

    // Oracle Devnet
    if (serviceEndpoints.oracleDevnet.enabled) {
        const isOnline = await checkServiceStatus(serviceEndpoints.oracleDevnet.url);
        updateServiceCard('oracle-devnet', true, isOnline);
    } else {
        updateServiceCard('oracle-devnet', false, false);
    }

    // Check if any services are enabled
    const anyServiceEnabled = 
        serviceEndpoints.guardianMainnet.enabled || 
        serviceEndpoints.guardianDevnet.enabled || 
        serviceEndpoints.oracleMainnet.enabled || 
        serviceEndpoints.oracleDevnet.enabled;

    // If no services are enabled, hide the entire section
    if (!anyServiceEnabled) {
        document.querySelector('.service-logos').style.display = 'none';
    }
}

// Periodically check services status
function startServiceMonitoring() {
    // Initial check
    checkServices();

    // Set up periodic checking every 30 seconds
    setInterval(checkServices, 30000);
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateUIForTEEType();
    setupEndpoints();
    startServiceMonitoring();
});

// Matrix background effect
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6EE7B7';
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start the matrix animation
setInterval(draw, 33);
