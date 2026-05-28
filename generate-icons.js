const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const SOURCE_IMAGE = 'public/logo-master.png';
const OUTPUT_DIR = 'public/assets/icons';
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
    console.log('Generating PWA icons...\n');
    const image = await loadImage(SOURCE_IMAGE);
    
    for (const size of SIZES) {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        // Draw the image scaled to fit the size
        ctx.drawImage(image, 0, 0, size, size);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Generated icon-${size}x${size}.png`);
    }
    
    console.log(`\nAll ${SIZES.length} icons generated in ${OUTPUT_DIR}!`);
}

generateIcons().catch(console.error);
