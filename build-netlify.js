import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

console.log('🚀 Starting Netlify build process...');

try {
  // Build the client
  console.log('📦 Building client...');
  execSync('vite build', { stdio: 'inherit' });

  // Ensure netlify functions directory exists  
  if (!existsSync('netlify/functions')) {
    mkdirSync('netlify/functions', { recursive: true });
  }

  console.log('✅ Netlify build completed successfully!');
  console.log('📁 Client built to: dist/public');
  console.log('🔧 Functions available in: netlify/functions');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}