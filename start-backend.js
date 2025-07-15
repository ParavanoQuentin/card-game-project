const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Aether Beasts Backend Server...');

const backendPath = path.join(__dirname, 'backend');
console.log('Backend path:', backendPath);

// Change to backend directory and run npm run dev
const npmProcess = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

npmProcess.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

npmProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

console.log('✅ Backend startup command executed');
