
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class ElectronBuilder {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.electronDir = path.join(this.rootDir, 'electron');
    this.distDir = path.join(this.rootDir, 'dist');
  }

  async build() {
    console.log('🚀 Building AlgoTrade Pro Desktop Application...');
    
    try {
      // Step 1: Build the React application
      console.log('📦 Building React application...');
      execSync('npm run build', { stdio: 'inherit', cwd: this.rootDir });
      
      // Step 2: Compile TypeScript files for Electron
      console.log('🔧 Compiling Electron TypeScript files...');
      execSync('npx tsc electron/*.ts --outDir dist-electron --target es2020 --module commonjs --moduleResolution node', 
        { stdio: 'inherit', cwd: this.rootDir });
      
      // Step 3: Copy assets
      console.log('📋 Copying assets...');
      this.copyAssets();
      
      // Step 4: Package the application
      console.log('📦 Packaging Electron application...');
      execSync('npx electron-forge package', { stdio: 'inherit', cwd: this.rootDir });
      
      console.log('✅ Build completed successfully!');
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  copyAssets() {
    const assetsDir = path.join(this.rootDir, 'assets');
    const distAssetsDir = path.join(this.rootDir, 'dist-electron', 'assets');
    
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      
      // Create placeholder assets
      const iconContent = '/* Placeholder for app icon */';
      fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconContent);
      fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), iconContent);
      fs.writeFileSync(path.join(assetsDir, 'icon.ico'), iconContent);
    }
    
    if (fs.existsSync(assetsDir)) {
      fs.cpSync(assetsDir, distAssetsDir, { recursive: true });
    }
  }

  async dev() {
    console.log('🔧 Starting development mode...');
    
    try {
      // Start the React dev server
      console.log('🌐 Starting React development server...');
      const reactProcess = execSync('npm run dev', { 
        stdio: 'pipe', 
        cwd: this.rootDir 
      });
      
      // Wait a moment for the server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Compile Electron files
      console.log('⚡ Compiling Electron files...');
      execSync('npx tsc electron/*.ts --outDir dist-electron --target es2020 --module commonjs --moduleResolution node --watch', 
        { stdio: 'inherit', cwd: this.rootDir });
      
    } catch (error) {
      console.error('❌ Development setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run based on command line argument
const builder = new ElectronBuilder();
const command = process.argv[2];

if (command === 'dev') {
  builder.dev();
} else {
  builder.build();
}
