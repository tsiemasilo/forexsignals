#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Building for Netlify deployment...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build server with individual files
  console.log('Building server...');
  
  // Create dist/server directory
  if (!fs.existsSync('dist/server')) {
    fs.mkdirSync('dist/server', { recursive: true });
  }
  
  // Build each server file individually
  const serverFiles = [
    'server/index.ts',
    'server/routes.ts', 
    'server/db.ts',
    'server/storage.ts'
  ];
  
  for (const file of serverFiles) {
    if (fs.existsSync(file)) {
      const outputName = path.basename(file, '.ts') + '.js';
      const outputPath = file.startsWith('server/') ? `dist/server/${outputName}` : `dist/${outputName}`;
      
      console.log(`Building ${file} -> ${outputPath}`);
      execSync(`esbuild ${file} --platform=node --packages=external --bundle --format=esm --outfile=${outputPath}`, { stdio: 'inherit' });
    }
  }
  
  // Copy shared schema
  if (fs.existsSync('shared/schema.ts')) {
    if (!fs.existsSync('dist/shared')) {
      fs.mkdirSync('dist/shared', { recursive: true });
    }
    execSync('esbuild shared/schema.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/shared/schema.js', { stdio: 'inherit' });
  }
  
  console.log('✅ Netlify build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}