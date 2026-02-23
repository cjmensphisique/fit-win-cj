import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sharp from 'sharp';
import fs from 'fs';
import { Client } from './db.js';

// Load env
dotenv.config({ path: '../.env' });
if (!process.env.MONGODB_URI) dotenv.config();

async function runCleanup() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Starting DB Image Compression...\n');

    const clients = await Client.find();
    console.log(`Found ${clients.length} clients to check.`);
    
    let totalSavedBytes = 0;
    
    for (const client of clients) {
      if (!client.photos || client.photos.length === 0) continue;
      
      let modified = false;
      for (let i = 0; i < client.photos.length; i++) {
        const photo = client.photos[i];
        
        // Only target strings that are large (e.g. > 150KB) and are valid data URLs
        if (photo.dataUrl && photo.dataUrl.length > 150000 && photo.dataUrl.startsWith('data:image')) {
          console.log(`Compressing photo for ${client.name} | Original size: ${(photo.dataUrl.length/1024/1024).toFixed(2)} MB`);
          
          try {
            // Extract the base64 part
            const base64Data = photo.dataUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Resize and compress
            const compressedBuffer = await sharp(buffer)
              .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 70 })
              .toBuffer();
              
            const newDataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
            const savedBytes = photo.dataUrl.length - newDataUrl.length;
            totalSavedBytes += savedBytes;
            
            console.log(`  -> New size: ${(newDataUrl.length/1024/1024).toFixed(2)} MB (Saved ${(savedBytes/1024/1024).toFixed(2)} MB)`);
            
            client.photos[i].dataUrl = newDataUrl;
            modified = true;
          } catch(e) {
            console.error('  -> Failed to compress photo, skipping.', e.message);
          }
        }
      }
      
      if (modified) {
        // Mark the photos array as modified manually since we altered nested objects directly
        client.markModified('photos');
        await client.save();
        console.log(`✅ Saved compressed photos for client ${client.name}\n`);
      }
    }
    
    console.log(`\n🎉 Cleanup complete! Total storage saved: ${(totalSavedBytes/1024/1024).toFixed(2)} MB`);
    process.exit(0);
  } catch (err) {
    console.error('Error in cleanup script:', err);
    process.exit(1);
  }
}

runCleanup();
