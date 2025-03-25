import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPng(pngPath, width, height) {
  try {
    // Create canvas with the specified dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw black background (full circle)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(width/2, height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Load the white TTwW logo
    const logoPath = path.join(__dirname, '../attached_assets/TTwW Logo v4 White.png');
    const logo = await loadImage(logoPath);
    
    // Calculate position for the logo to be centered (about 65% of canvas size)
    const logoSize = width * 0.65;
    const ratio = logoSize / Math.max(logo.width, logo.height);
    const logoWidth = logo.width * ratio;
    const logoHeight = logo.height * ratio;
    const x = (width - logoWidth) / 2;
    const y = (height - logoHeight) / 2;
    
    // Draw the logo
    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
    
    // Convert canvas to PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`Created PNG icon: ${pngPath}`);
  } catch (error) {
    console.error(`Error creating ${pngPath}:`, error);
  }
}

async function main() {
  // Create 192x192 icon
  await createPng(
    path.join(__dirname, '../client/public/icons/icon-192x192.png'),
    192,
    192
  );

  // Create 512x512 icon
  await createPng(
    path.join(__dirname, '../client/public/icons/icon-512x512.png'),
    512,
    512
  );
  
  // Also create a favicon
  await createPng(
    path.join(__dirname, '../client/public/favicon.png'),
    64,
    64
  );
  
  console.log('All icons created successfully!');
}

main().catch(console.error);