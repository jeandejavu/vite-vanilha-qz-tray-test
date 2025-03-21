import qz from 'qz-tray';

// API endpoint constants
const API_BASE_URL = 'http://localhost:8000/api/qz-tray';
const CERTIFICATE_ENDPOINT = `${API_BASE_URL}/certificate`;
const SIGN_ENDPOINT = `${API_BASE_URL}/sign`;

// Setup secure certificate and signature handling
async function setupSecurity() {
  // Configure certificate promise
  qz.security.setCertificatePromise(function(resolve, reject) {
    fetch(CERTIFICATE_ENDPOINT)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success && data.certificate) {
          resolve(data.certificate);
        } else {
          reject(data.message || 'Failed to get certificate');
        }
      })
      .catch(error => {
        console.error('Error fetching certificate:', error);
        reject(error instanceof Error ? error.message : String(error));
      });
  });

  // Configure signature promise
  qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
      // Send the data to be signed to our backend
      fetch(SIGN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: toSign })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success && data.signature) {
          resolve(data.signature);
        } else {
          reject(data.message || 'Failed to sign data');
        }
      })
      .catch(error => {
        console.error('Error signing data:', error);
        reject(error instanceof Error ? error.message : String(error));
      });
    };
  });
}

// Initialize QZ Tray
export async function initQzTray(): Promise<void> {
  try {
    // Setup security with backend signing
    await setupSecurity();
    
    // Connect to QZ Tray
    await qz.websocket.connect({
      retries: 3,
      delay: 1000
    });
    
    console.log('QZ Tray connected successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error connecting to QZ Tray:', error);
    return Promise.reject(error);
  }
}

// Get list of available printers
export async function getPrinters(): Promise<string[]> {
  try {
    const printers = await qz.printers.find();
    // Ensure return is always an array
    return Array.isArray(printers) ? printers : [printers].filter(Boolean) as string[];
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
}

// Print test page
export async function printTestPage(printerName: string): Promise<void> {
  try {
    // Create configuration for the printer
    const config = qz.configs.create(printerName);
    
    // Create test data - plain text
    const data = [
      'QZ Tray Test Print\n',
      '=================\n',
      'This is a test print from QZ Tray\n',
      'Date: ' + new Date().toLocaleString() + '\n',
      '\n\n\n\n\n' // Add some line breaks to advance the paper
    ];
    
    // Send the print job to QZ Tray
    await qz.print(config, data);
    console.log('Test page sent to printer:', printerName);
    return Promise.resolve();
  } catch (error) {
    console.error('Error printing test page:', error);
    return Promise.reject(error);
  }
}

// Disconnect from QZ Tray
export async function disconnectQzTray(): Promise<void> {
  try {
    await qz.websocket.disconnect();
    console.log('Disconnected from QZ Tray');
    return Promise.resolve();
  } catch (error) {
    console.error('Error disconnecting from QZ Tray:', error);
    return Promise.reject(error);
  }
} 