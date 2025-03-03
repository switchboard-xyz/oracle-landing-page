document.addEventListener('DOMContentLoaded', function() {
    initializeMatrixEffect();
    initializeServices();
    setupTabNavigation();
    updateUIForTEEType();
});

// Service configuration - now uses separate environment variables for mainnet and devnet
const services = {
    guardianMainnet: {
        url: typeof GUARDIAN_MAINNET_URL !== 'undefined' ? GUARDIAN_MAINNET_URL : '/mainnet/guardian/api/v1/test',
        enabled: typeof GUARDIAN_MAINNET_ENABLED !== 'undefined' ? GUARDIAN_MAINNET_ENABLED === 'true' : false
    },
    guardianDevnet: {
        url: typeof GUARDIAN_DEVNET_URL !== 'undefined' ? GUARDIAN_DEVNET_URL : '/devnet/guardian/api/v1/test',
        enabled: typeof GUARDIAN_DEVNET_ENABLED !== 'undefined' ? GUARDIAN_DEVNET_ENABLED === 'true' : false
    },
    oracleMainnet: {
        url: typeof ORACLE_MAINNET_URL !== 'undefined' ? ORACLE_MAINNET_URL : '/mainnet/oracle/api/v1/test',
        enabled: typeof ORACLE_MAINNET_ENABLED !== 'undefined' ? ORACLE_MAINNET_ENABLED === 'true' : true
    },
    oracleDevnet: {
        url: typeof ORACLE_DEVNET_URL !== 'undefined' ? ORACLE_DEVNET_URL : '/devnet/oracle/api/v1/test',
        enabled: typeof ORACLE_DEVNET_ENABLED !== 'undefined' ? ORACLE_DEVNET_ENABLED === 'true' : true
    }
};

function initializeServices() {
    // Display service cards based on enabled status
    // Start health checks for enabled services
    startHealthChecks();
    document.getElementById('oracle-mainnet-logo-card').style.display = services.oracleMainnet.enabled ? 'block' : 'none';
    document.getElementById('oracle-devnet-logo-card').style.display = services.oracleDevnet.enabled ? 'block' : 'none';
    document.getElementById('guardian-mainnet-logo-card').style.display = services.guardianMainnet.enabled ? 'block' : 'none';
    document.getElementById('guardian-devnet-logo-card').style.display = services.guardianDevnet.enabled ? 'block' : 'none';
    
    // Set service status indicators
    updateServiceStatus('oracle-mainnet', services.oracleMainnet.enabled);
    updateServiceStatus('oracle-devnet', services.oracleDevnet.enabled);
    updateServiceStatus('guardian-mainnet', services.guardianMainnet.enabled);
    updateServiceStatus('guardian-devnet', services.guardianDevnet.enabled);
    
    // Update endpoint URLs and iframes
    updateEndpoints();
}

function updateServiceStatus(serviceId, isEnabled) {
    const statusIndicator = document.getElementById(`${serviceId}-status`);
    const statusText = document.getElementById(`${serviceId}-status-text`);
    
    if (statusIndicator && statusText) {
        if (isEnabled) {
            statusIndicator.classList.remove('offline');
            statusIndicator.classList.add('online');
            statusText.textContent = 'Online';
        } else {
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusText.textContent = 'Offline';
        }
    }
}

function updateEndpoints() {
    // Get hostname from env variable or window location
    const hostname = window.location.hostname;
    
    // Update mainnet endpoint
    const mainnetEndpointUrl = document.getElementById('mainnet-endpoint-url');
    const mainnetFrame = document.getElementById('mainnet-frame');
    if (mainnetEndpointUrl && mainnetFrame) {
        mainnetEndpointUrl.textContent = `https://${hostname}${services.oracleMainnet.url}`;
        if (services.oracleMainnet.enabled) {
            mainnetFrame.src = services.oracleMainnet.url;
        } else {
            mainnetFrame.src = "about:blank";
            mainnetEndpointUrl.textContent += " (Disabled)";
        }
    }
    
    // Update devnet endpoint
    const devnetEndpointUrl = document.getElementById('devnet-endpoint-url');
    const devnetFrame = document.getElementById('devnet-frame');
    if (devnetEndpointUrl && devnetFrame) {
        devnetEndpointUrl.textContent = `https://${hostname}${services.oracleDevnet.url}`;
        if (services.oracleDevnet.enabled) {
            devnetFrame.src = services.oracleDevnet.url;
        } else {
            devnetFrame.src = "about:blank";
            devnetEndpointUrl.textContent += " (Disabled)";
        }
    }
}

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.endpoint-tab');
    const contents = document.querySelectorAll('.endpoint-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-content`).classList.add('active');
        });
    });
}

function updateUIForTEEType() {
    const teeInfoElement = document.getElementById('tee-info');
    if (!teeInfoElement) return;

    // Get TEE type from data attribute
    const teeTypeElement = document.querySelector('[data-tee-type]');
    const teeType = teeTypeElement ? teeTypeElement.textContent : 'Unknown';

    // Default content for unknown TEE type
    let teeContent = `
        <div class="tee-details">
            <p><strong>TEE Type:</strong> ${teeType}</p>
            <p>This Oracle is running in a secure environment.</p>
        </div>
    `;

    // Customize content based on TEE type - only SEV-SNP and COCO-DEV are supported
    if (teeType === 'SEV-SNP') {
        teeContent = `
            <div class="tee-details">
                <p><strong>TEE Type:</strong> AMD SEV-SNP</p>
                <p>This Oracle is running in an AMD SEV-SNP (Secure Encrypted Virtualization-Secure Nested Paging) environment, which provides hardware-level memory encryption and attestation.</p>
                <p>Learn more about <a href="https://www.amd.com/en/processors/amd-secure-encrypted-virtualization" target="_blank">AMD SEV-SNP</a></p>
            </div>
        `;
    } else if (teeType === 'COCO-DEV') {
        teeContent = `
            <div class="tee-details">
                <p><strong>TEE Type:</strong> Confidential Container (Development)</p>
                <p>This is a development instance running in a simulated confidential container environment.</p>
                <p><strong>Note:</strong> This environment does not provide the same security guarantees as a production TEE.</p>
            </div>
        `;
    }

    teeInfoElement.innerHTML = teeContent;
}

// Health check functionality to periodically ping service endpoints
function startHealthChecks() {
    // Only perform health checks for enabled services
    const enabledServices = [];
    
    if (services.oracleMainnet.enabled) {
        enabledServices.push({
            id: 'oracle-mainnet',
            url: services.oracleMainnet.url
        });
    }
    
    if (services.oracleDevnet.enabled) {
        enabledServices.push({
            id: 'oracle-devnet',
            url: services.oracleDevnet.url
        });
    }
    
    if (services.guardianMainnet.enabled) {
        enabledServices.push({
            id: 'guardian-mainnet',
            url: services.guardianMainnet.url
        });
    }
    
    if (services.guardianDevnet.enabled) {
        enabledServices.push({
            id: 'guardian-devnet',
            url: services.guardianDevnet.url
        });
    }
    
    // If no services are enabled, exit the function
    if (enabledServices.length === 0) return;
    
    // Function to check a specific service
    function checkServiceHealth(service) {
        // Create a new fetch request with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        fetch(service.url, { 
            method: 'GET',
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (response.ok) {
                updateServiceStatus(service.id, true);
            } else {
                updateServiceStatus(service.id, false);
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            updateServiceStatus(service.id, false);
            console.error(`Health check failed for ${service.id}:`, error);
        });
    }
    
    // Perform initial health checks
    enabledServices.forEach(checkServiceHealth);
    
    // Set up a periodic health check every 30 seconds
    setInterval(() => {
        enabledServices.forEach(checkServiceHealth);
    }, 30000);
}

// Matrix effect for background
function initializeMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Matrix effect settings
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height);
    }
    
    // Characters to display
    const matrix_chars = '01';
    
    // Drawing function
    function draw() {
        // Translucent black background to show trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f0'; // Green text
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = matrix_chars.charAt(Math.floor(Math.random() * matrix_chars.length));
            
            // Draw character
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            
            // Move drop position
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    // Run animation
    setInterval(draw, 35);
}
