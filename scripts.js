const teeTypeElement = document.querySelector('[data-tee-type]');
const teeType = teeTypeElement ? teeTypeElement.textContent.trim() : 'Unknown';

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
        url: '/mainnet/oracle/api/v1/test',
        enabled: true
    },
    oracleDevnet: {
        url: '/devnet/oracle/api/v1/test',
        enabled: true
    }
};

function updateUIForTEEType() {
    const teeInfoElement = document.getElementById('tee-info');
    if (!teeInfoElement) return;

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
    // These variables are injected by env-config.js
    if (typeof GUARDIAN_MAINNET_URL !== 'undefined') {
        serviceEndpoints.guardianMainnet.url = GUARDIAN_MAINNET_URL;
        console.log(`Using custom Guardian Mainnet URL: ${GUARDIAN_MAINNET_URL}`);
    }

    if (typeof GUARDIAN_DEVNET_URL !== 'undefined') {
        serviceEndpoints.guardianDevnet.url = GUARDIAN_DEVNET_URL;
        console.log(`Using custom Guardian Devnet URL: ${GUARDIAN_DEVNET_URL}`);
    }

    if (typeof ORACLE_MAINNET_URL !== 'undefined') {
        serviceEndpoints.oracleMainnet.url = ORACLE_MAINNET_URL;
        console.log(`Using custom Oracle Mainnet URL: ${ORACLE_MAINNET_URL}`);
    }

    if (typeof ORACLE_DEVNET_URL !== 'undefined') {
        serviceEndpoints.oracleDevnet.url = ORACLE_DEVNET_URL;
        console.log(`Using custom Oracle Devnet URL: ${ORACLE_DEVNET_URL}`);
    }
    
    // Update iframe sources to match the service endpoints
    const mainnetFrame = document.getElementById('mainnet-frame');
    const devnetFrame = document.getElementById('devnet-frame');
    
    if (mainnetFrame) {
        mainnetFrame.src = serviceEndpoints.oracleMainnet.url;
    }
    
    if (devnetFrame) {
        devnetFrame.src = serviceEndpoints.oracleDevnet.url;
    }
}

// Check if a service is responsive by making a fetch request
async function checkServiceStatus(endpoint) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.status === 200;
    } catch (error) {
        console.error(`Error checking service at ${endpoint}:`, error);
        return false;
    }
}

// Update the UI for a specific service card
function updateServiceCard(serviceId, isEnabled, isOnline) {
    const card = document.getElementById(`${serviceId}-logo-card`);
    if (!card) {
        console.error(`Card not found: ${serviceId}-logo-card`);
        return;
    }

    const statusIndicator = document.getElementById(`${serviceId}-status`);
    const statusText = document.getElementById(`${serviceId}-status-text`);

    if (!statusIndicator || !statusText) {
        console.error(`Status elements not found for ${serviceId}`);
        return;
    }

    // Always show the card, but apply deactivated class if not enabled or not online
    card.style.display = 'block';

    if (isEnabled) {
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
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Disabled';
        card.classList.add('deactivated');
    }
}

// Check all services and update their status
async function checkServices() {
    console.log("Checking services...");

    // Guardian Mainnet
    try {
        const guardianMainnetOnline = await checkServiceStatus(serviceEndpoints.guardianMainnet.url);
        updateServiceCard('guardian-mainnet', serviceEndpoints.guardianMainnet.enabled, guardianMainnetOnline);
    } catch (error) {
        console.error("Error checking Guardian Mainnet:", error);
        updateServiceCard('guardian-mainnet', serviceEndpoints.guardianMainnet.enabled, false);
    }

    // Guardian Devnet
    try {
        const guardianDevnetOnline = await checkServiceStatus(serviceEndpoints.guardianDevnet.url);
        updateServiceCard('guardian-devnet', serviceEndpoints.guardianDevnet.enabled, guardianDevnetOnline);
    } catch (error) {
        console.error("Error checking Guardian Devnet:", error);
        updateServiceCard('guardian-devnet', serviceEndpoints.guardianDevnet.enabled, false);
    }

    // Oracle Mainnet
    try {
        const oracleMainnetOnline = await checkServiceStatus(serviceEndpoints.oracleMainnet.url);
        updateServiceCard('oracle-mainnet', serviceEndpoints.oracleMainnet.enabled, oracleMainnetOnline);
    } catch (error) {
        console.error("Error checking Oracle Mainnet:", error);
        updateServiceCard('oracle-mainnet', serviceEndpoints.oracleMainnet.enabled, false);
    }

    // Oracle Devnet
    try {
        const oracleDevnetOnline = await checkServiceStatus(serviceEndpoints.oracleDevnet.url);
        updateServiceCard('oracle-devnet', serviceEndpoints.oracleDevnet.enabled, oracleDevnetOnline);
    } catch (error) {
        console.error("Error checking Oracle Devnet:", error);
        updateServiceCard('oracle-devnet', serviceEndpoints.oracleDevnet.enabled, false);
    }
    
    // Update endpoint tabs to reflect current service status
    updateEndpointTabs();
}

// Periodically check services status
function startServiceMonitoring() {
    // Initial check
    checkServices();

    // Set up periodic checking every 30 seconds
    setInterval(checkServices, 30000);
}

// Setup tab functionality for endpoint tabs
function setupTabFunctionality() {
    const tabs = document.querySelectorAll('.endpoint-tab');
    const contents = document.querySelectorAll('.endpoint-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Skip if tab is disabled
            if (tab.classList.contains('disabled')) {
                return;
            }
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            const tabName = tab.getAttribute('data-tab');
            tab.classList.add('active');
            document.getElementById(`${tabName}-content`).classList.add('active');
        });
    });
}

// Update endpoint tabs based on Oracle enabled/disabled state
function updateEndpointTabs() {
    const mainnetTab = document.querySelector('.endpoint-tab[data-tab="mainnet"]');
    const devnetTab = document.querySelector('.endpoint-tab[data-tab="devnet"]');
    const mainnetContent = document.getElementById('mainnet-content');
    const devnetContent = document.getElementById('devnet-content');
    
    // Check if Oracle services are enabled
    const oracleMainnetEnabled = serviceEndpoints.oracleMainnet.enabled;
    const oracleDevnetEnabled = serviceEndpoints.oracleDevnet.enabled;
    
    // Update mainnet tab
    if (!oracleMainnetEnabled && mainnetTab) {
        mainnetTab.classList.add('disabled');
        // If mainnet is disabled but active, activate devnet if it's enabled
        if (mainnetTab.classList.contains('active') && oracleDevnetEnabled) {
            mainnetTab.classList.remove('active');
            mainnetContent.classList.remove('active');
            devnetTab.classList.add('active');
            devnetContent.classList.add('active');
        }
    } else if (mainnetTab) {
        mainnetTab.classList.remove('disabled');
    }
    
    // Update devnet tab
    if (!oracleDevnetEnabled && devnetTab) {
        devnetTab.classList.add('disabled');
        // If devnet is disabled but active, activate mainnet if it's enabled
        if (devnetTab.classList.contains('active') && oracleMainnetEnabled) {
            devnetTab.classList.remove('active');
            devnetContent.classList.remove('active');
            mainnetTab.classList.add('active');
            mainnetContent.classList.add('active');
        }
    } else if (devnetTab) {
        devnetTab.classList.remove('disabled');
    }
    
    // If both are disabled, hide the entire oracle-endpoints section
    const endpointsSection = document.querySelector('.oracle-endpoints');
    if (endpointsSection) {
        if (!oracleMainnetEnabled && !oracleDevnetEnabled) {
            endpointsSection.style.display = 'none';
        } else {
            endpointsSection.style.display = 'block';
        }
    }
    
    // Update iframe URLs to use the same endpoint pattern as the service checks
    const mainnetFrame = document.getElementById('mainnet-frame');
    const devnetFrame = document.getElementById('devnet-frame');
    
    if (mainnetFrame) {
        mainnetFrame.src = serviceEndpoints.oracleMainnet.url;
    }
    
    if (devnetFrame) {
        devnetFrame.src = serviceEndpoints.oracleDevnet.url;
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing...");
    updateUIForTEEType();
    setupEndpoints();
    setupTabFunctionality();
    updateEndpointTabs();
    startServiceMonitoring();
});

// Matrix background effect
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

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
});
