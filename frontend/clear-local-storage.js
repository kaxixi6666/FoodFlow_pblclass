// Script to clear old user data from localStorage
const { execSync } = require('child_process');

// Clear localStorage using a Chrome extension or by running a simple HTTP server
// For simplicity, we'll create a small HTML file that clears localStorage
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Clear Local Storage</title>
</head>
<body>
    <h1>Clearing Local Storage...</h1>
    <script>
        // Clear all localStorage
        localStorage.clear();
        console.log('Local Storage cleared successfully!');
        document.body.innerHTML = '<h1>Local Storage cleared successfully!</h1><p>You can now close this page.</p>';
    </script>
</body>
</html>
`;

// Write the HTML file
const fs = require('fs');
fs.writeFileSync('/Users/kaxixi/Desktop/FoodFlow_pblclass/frontend/clear-storage.html', htmlContent);

console.log('Created clear-storage.html file. Open this file in your browser to clear localStorage.');
console.log('After clearing, please re-login to get the correct user ID.');
