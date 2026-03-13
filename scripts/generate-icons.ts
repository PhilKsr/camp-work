import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { colors } from '../src/lib/brand';

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const faviconPath = path.join(publicDir, 'favicon.svg');

  // Ensure icons directory exists
  await fs.mkdir(iconsDir, { recursive: true });

  // Read the favicon SVG
  const faviconSvg = await fs.readFile(faviconPath, 'utf-8');

  console.log('🎨 Generating app icons...');

  // Generate PWA icons
  const pwaIcons = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ];

  for (const icon of pwaIcons) {
    await sharp(Buffer.from(faviconSvg))
      .resize(icon.size, icon.size)
      .png({ quality: 100 })
      .toFile(path.join(iconsDir, icon.name));

    console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate Apple Touch Icon with cream background padding
  const appleTouchIconSvg = `
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" fill="${colors.primary.mint}" rx="20"/>
      <g transform="translate(90, 90) scale(2.8)">
        <!-- WiFi signal arcs on tent peak -->
        <g transform="translate(0, -8)">
          <path
            d="M-6 6 C-6 2.5, -3 0, 0 0 C3 0, 6 2.5, 6 6"
            stroke="#ABD8EF"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M-4 5 C-4 3, -2 2, 0 2 C2 2, 4 3, 4 5"
            stroke="#ABD8EF"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M-2 4.5 C-2 3.8, -1 3.5, 0 3.5 C1 3.5, 2 3.8, 2 4.5"
            stroke="#ABD8EF"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
        </g>
        
        <!-- Tent shape -->
        <path
          d="M-6 10 L0 -8 L6 10 Z"
          fill="#E19B53"
          stroke="#C47F35"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        
        <!-- Tent door opening -->
        <path
          d="M-1.5 10 L0 4 L1.5 10"
          fill="#C47F35"
          stroke="none"
        />
        
        <!-- Tent center line for depth -->
        <line
          x1="0"
          y1="-8"
          x2="0"
          y2="10"
          stroke="#C47F35"
          stroke-width="1.5"
          opacity="0.6"
        />
      </g>
    </svg>
  `;

  await sharp(Buffer.from(appleTouchIconSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log(
    '✅ Generated apple-touch-icon.png (180x180 with cream background)',
  );

  // Generate additional PWA sizes
  const additionalSizes = [72, 96, 128, 144, 152, 384];

  for (const size of additionalSizes) {
    await sharp(Buffer.from(faviconSvg))
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(path.join(iconsDir, `icon-${size}.png`));

    console.log(`✅ Generated icon-${size}.png`);
  }

  console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
