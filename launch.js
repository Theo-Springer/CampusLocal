#!/usr/bin/env node

/**
 * 🚀 CampusLocal Launch Script
 * 
 * Launches all services (backend, frontend-official, frontend-demo)
 * Works on Windows, Mac, and Linux
 * 
 * Usage: npm run launch
 *        node launch.js
 *        npm run launch:demo  (demo only)
 *        npm run launch:dev   (dev only)
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'packages', 'backend');
const FRONTEND_OFFICIAL_DIR = path.join(ROOT_DIR, 'packages', 'frontend-official');
const FRONTEND_DEMO_DIR = path.join(ROOT_DIR, 'packages', 'frontend-demo');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'═'.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'═'.repeat(60)}\n`, 'cyan');
}

function checkPrerequisites() {
  logSection('🔍 Checking Prerequisites');

  // Check Node.js
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    log(`✅ Node.js: ${nodeVersion}`, 'green');
  } catch (e) {
    log('❌ Node.js not found! Please install Node.js', 'red');
    process.exit(1);
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version').toString().trim();
    log(`✅ npm: ${npmVersion}`, 'green');
  } catch (e) {
    log('❌ npm not found!', 'red');
    process.exit(1);
  }

  // Check Python
  try {
    const pythonVersion = execSync('python --version').toString().trim();
    log(`✅ Python: ${pythonVersion}`, 'green');
  } catch (e) {
    try {
      const pythonVersion = execSync('python3 --version').toString().trim();
      log(`✅ Python: ${pythonVersion}`, 'green');
    } catch (e2) {
      log('⚠️  Python not found (needed for backend)', 'yellow');
    }
  }

  log('');
}

function installDependencies() {
  logSection('📦 Installing Dependencies');

  // Check if node_modules exists
  if (!fs.existsSync(path.join(ROOT_DIR, 'node_modules'))) {
    log('Installing root dependencies...', 'yellow');
    try {
      execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
      log('✅ Root dependencies installed', 'green');
    } catch (e) {
      log('⚠️  Error installing root dependencies', 'yellow');
    }
  } else {
    log('✅ Root dependencies already installed', 'green');
  }

  // Check backend venv
  const venvPath = path.join(BACKEND_DIR, 'venv');
  if (!fs.existsSync(venvPath)) {
    log('Creating Python virtual environment...', 'yellow');
    try {
      const isWindows = os.platform() === 'win32';
      if (isWindows) {
        execSync('python -m venv venv', { cwd: BACKEND_DIR, stdio: 'inherit' });
      } else {
        execSync('python3 -m venv venv', { cwd: BACKEND_DIR, stdio: 'inherit' });
      }
      log('✅ Virtual environment created', 'green');
    } catch (e) {
      log('⚠️  Error creating virtual environment', 'yellow');
    }

    // Install Python requirements
    log('Installing Python requirements...', 'yellow');
    try {
      const isWindows = os.platform() === 'win32';
      const pip = isWindows ? 
        path.join(venvPath, 'Scripts', 'pip') : 
        path.join(venvPath, 'bin', 'pip');
      
      if (fs.existsSync(pip)) {
        execSync(`${pip} install -r requirements.txt`, { cwd: BACKEND_DIR, stdio: 'inherit' });
        log('✅ Python requirements installed', 'green');
      }
    } catch (e) {
      log('⚠️  Error installing Python requirements', 'yellow');
    }
  } else {
    log('✅ Backend virtual environment exists', 'green');
  }

  log('');
}

function startService(name, command, cwd, port) {
  return new Promise((resolve) => {
    log(`🚀 Starting ${name} on port ${port}...`, 'yellow');
    
    const service = spawn('npm', ['run', command], {
      cwd: cwd,
      shell: true,
      stdio: 'inherit',
    });

    service.on('error', (err) => {
      log(`❌ Error starting ${name}: ${err.message}`, 'red');
      resolve();
    });

    service.on('exit', (code) => {
      if (code !== 0) {
        log(`❌ ${name} exited with code ${code}`, 'red');
      }
      resolve();
    });
  });
}

function displayStatus() {
  logSection('✨ Services Ready!');

  log('📋 Available Services:', 'cyan');
  log('');
  log('🔵 Backend API:', 'blue');
  log('   http://localhost:8000', 'green');
  log('   API Documentation: http://localhost:8000/docs', 'green');
  log('');
  log('🟢 Frontend Demo (Autonomous):', 'green');
  log('   http://localhost:5174', 'green');
  log('   👉 Click "Connexion rapide" to test', 'green');
  log('');
  log('🟡 Frontend Official:', 'yellow');
  log('   http://localhost:5173', 'green');
  log('');
  log('💡 Tips:', 'cyan');
  log('   • Demo works WITHOUT backend (try disabling backend)', 'blue');
  log('   • Ctrl+C to stop all services', 'blue');
  log('   • Changes are live-reloaded (HMR enabled)', 'blue');
  log('');
}

async function launchAll() {
  console.clear();
  
  logSection('🎉 CampusLocal v2.0.0 - Launch Script');
  
  // Check requirements
  checkPrerequisites();
  
  // Install dependencies
  installDependencies();
  
  logSection('🚀 Starting All Services');
  
  // Start all services in parallel
  const services = [
    { name: 'Backend (FastAPI)', command: 'dev:backend', dir: ROOT_DIR, port: 8000 },
    { name: 'Frontend Official (React)', command: 'dev:official', dir: ROOT_DIR, port: 5173 },
    { name: 'Frontend Demo (React)', command: 'dev:demo', dir: ROOT_DIR, port: 5174 },
  ];

  // Start services (non-blocking)
  services.forEach(service => {
    log(`\n📍 ${service.name}...`, 'yellow');
    startService(service.name, service.command, service.dir, service.port);
  });

  // Wait a bit then display status
  setTimeout(() => {
    displayStatus();
    log('📝 Press Ctrl+C to stop all services\n', 'cyan');
  }, 2000);
}

function launchDemo() {
  console.clear();
  logSection('🎉 CampusLocal v2.0.0 - Demo Only');
  
  checkPrerequisites();
  
  log('🚀 Starting Frontend Demo...', 'yellow');
  log('⚠️  Backend will NOT start (demo is autonomous)', 'yellow');
  log('');
  
  const service = spawn('npm', ['run', 'dev:demo'], {
    cwd: ROOT_DIR,
    shell: true,
    stdio: 'inherit',
  });
  
  setTimeout(() => {
    logSection('✨ Demo Ready!');
    log('🟢 Frontend Demo:', 'green');
    log('   http://localhost:5174', 'green');
    log('');
    log('👉 Click "Connexion rapide" to test\n', 'yellow');
  }, 2000);
}

function launchDev() {
  console.clear();
  logSection('🎉 CampusLocal v2.0.0 - Dev Only');
  
  checkPrerequisites();
  
  log('🚀 Starting Frontend Official...', 'yellow');
  log('⚠️  Backend will NOT start', 'yellow');
  log('⚠️  Demo will NOT start', 'yellow');
  log('');
  
  const service = spawn('npm', ['run', 'dev:official'], {
    cwd: ROOT_DIR,
    shell: true,
    stdio: 'inherit',
  });
  
  setTimeout(() => {
    logSection('✨ Dev Ready!');
    log('🟡 Frontend Official:', 'yellow');
    log('   http://localhost:5173', 'green');
    log('');
    log('⚠️  Make sure backend is running on port 8000\n', 'yellow');
  }, 2000);
}

// Parse arguments
const args = process.argv.slice(2);
const mode = args[0] || 'all';

switch (mode) {
  case 'demo':
    launchDemo();
    break;
  case 'dev':
    launchDev();
    break;
  case 'all':
  default:
    launchAll();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n👋 Stopping all services...\n', 'cyan');
  process.exit(0);
});
