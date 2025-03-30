
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPng(pngPath, width, height) {
  try {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw dark blue background circle
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(width/2, height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Load and draw the white TTwW logo
    const logoPath = path.join(__dirname, '../attached_assets/TTwW Logo v4 White.png');
    const logo = await loadImage(logoPath);
    
    // Calculate size to fit 60% of the circle width while maintaining aspect ratio
    const targetWidth = width * 0.6;
    const scale = targetWidth / logo.width;
    const targetHeight = logo.height * scale;
    
    // Center the logo
    const x = (width - targetWidth) / 2;
    const y = (height - targetHeight) / 2;
    
    // Draw the logo
    ctx.drawImage(logo, x, y, targetWidth, targetHeight);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`Created PNG icon: ${pngPath}`);
  } catch (error) {
    console.error(`Error creating ${pngPath}:`, error);
  }
}

async function main() {
  // Ensure the icons directory exists
  const iconsDir = path.join(__dirname, '../client/public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Create icons
  await createPng(path.join(iconsDir, 'icon-192x192.png'), 192, 192);
  await createPng(path.join(iconsDir, 'icon-512x512.png'), 512, 512);
  await createPng(path.join(__dirname, '../client/public/favicon.png'), 64, 64);
  
  console.log('All icons created successfully!');
}

main().catch(console.error);
