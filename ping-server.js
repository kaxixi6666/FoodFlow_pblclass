const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Server URL to ping
const SERVER_URL = 'https://foodflow-pblclass.onrender.com/api/users';

// Ping interval in milliseconds (14 minutes)
const PING_INTERVAL = 14 * 60 * 1000;

// Log file path
const LOG_FILE = path.join(__dirname, 'ping-logs.txt');

// Function to append to log file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  
  fs.appendFile(LOG_FILE, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// Function to ping the server
async function pingServer() {
  try {
    log('Pinging server...');
    
    const response = await axios.get(SERVER_URL, {
      timeout: 30000, // 30 seconds timeout
      headers: {
        'User-Agent': 'FoodFlow Server Pinger'
      }
    });
    
    log(`Server ping successful! Status: ${response.status}`);
    
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      log(`Server ping failed with status: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response
      log('Server ping failed: No response received');
    } else {
      // Other error
      log(`Server ping failed: ${error.message}`);
    }
  }
}

// Initial ping
log('Starting server pinger...');
log(`Server URL: ${SERVER_URL}`);
log(`Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);

pingServer();

// Set up interval for regular pings
setInterval(pingServer, PING_INTERVAL);

log('Server pinger initialized successfully!');
