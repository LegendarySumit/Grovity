#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate config-loader.js from environment variables
const configContent = `// Auto-generated config file from environment variables
// DO NOT commit this file to Git

window.__FB_API_KEY__ = '${process.env.NEXT_PUBLIC_FB_API_KEY || ''}';
window.__FB_AUTH_DOMAIN__ = '${process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN || ''}';
window.__FB_PROJECT_ID__ = '${process.env.NEXT_PUBLIC_FB_PROJECT_ID || ''}';
window.__FB_STORAGE_BUCKET__ = '${process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET || ''}';
window.__FB_MESSAGING_SENDER_ID__ = '${process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID || ''}';
window.__FB_APP_ID__ = '${process.env.NEXT_PUBLIC_FB_APP_ID || ''}';
window.__FB_MEASUREMENT_ID__ = '${process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID || ''}';
`;

const configPath = path.join(__dirname, '../src/js/config-loader.js');

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(configPath).replace(/src\/js/, '');
fs.mkdirSync(path.join(scriptsDir, 'src/js'), { recursive: true });

// Write the config file
fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✅ config-loader.js generated from environment variables');
