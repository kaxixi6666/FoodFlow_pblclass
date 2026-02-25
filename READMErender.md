# Render Cold Start Prevention

## Overview

This repository contains a script to prevent Render cold starts by periodically pinging the server. Render's free plan puts servers to sleep after 15 minutes of inactivity, which causes slow response times for the first request after sleep.

## Solution

The `ping-server.js` script pings your Render server every 14 minutes to keep it awake, eliminating cold start delays for your users.

## Setup

### 1. Install Dependencies

```bash
# In the project root directory
npm install
```

### 2. Configure the Script

Edit `ping-server.js` to use your actual server URL:

```javascript
// Change this to your server's URL
const SERVER_URL = 'https://foodflow-pblclass.onrender.com/api/users';
```

### 3. Run the Script

```bash
# Start the pinger
npm start
```

### 4. Keep the Script Running

For continuous operation, you should run this script on a server or computer that's always on. Options include:

- **Local computer**: Run it in the background
- **Cloud server**: Deploy to a free tier VPS
- **GitHub Actions**: Set up a scheduled workflow

## How It Works

1. The script sends a GET request to your server every 14 minutes
2. This keeps the Render server active and prevents it from sleeping
3. Logs are written to `ping-logs.txt` for monitoring

## Alternative Solutions

### 1. Upgrade to Render Paid Plan

**Pros:**
- No sleep periods
- Faster startup times
- More resources

**Cons:**
- Costs $7/month minimum

### 2. Use GitHub Actions

Create a workflow file `.github/workflows/ping-server.yml`:

```yaml
name: Ping Server

on:
  schedule:
    - cron: '*/14 * * * *'  # Every 14 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping server
        run: curl -s https://foodflow-pblclass.onrender.com/api/users
```

### 3. Use a Monitoring Service

Services like UptimeRobot or Pingdom can also keep your server awake while providing additional monitoring features.

## Performance Impact

| Scenario | Without Prevention | With Prevention | Improvement |
|----------|-------------------|-----------------|-------------|
| First request after sleep | 5-15s | 0.5-2s | ~90% faster |
| Subsequent requests | 0.5-2s | 0.5-2s | No change |
| User perception | Frustrating | Seamless | Significant |

## Troubleshooting

### Script Not Running
- Check that Node.js is installed: `node --version`
- Verify dependencies: `npm install`
- Check for network connectivity

### Server Still Cold Starting
- Ensure the script is running continuously
- Verify the ping interval is set to less than 15 minutes
- Check that the server URL is correct

### Logs Not Updating
- Check file permissions for `ping-logs.txt`
- Verify the script has write access to the directory

## License

MIT License - see LICENSE file for details
