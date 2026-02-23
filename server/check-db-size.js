import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
if (!process.env.MONGODB_URI) dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Overall DB Stats
    const stats = await db.command({ dbStats: 1 });
    console.log(`\n=== DATABASE OVERVIEW ===`);
    console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Objects: ${stats.objects}`);
    
    // Collection Stats
    console.log(`\n=== COLLECTIONS BREAKDOWN ===`);
    const collections = await db.listCollections().toArray();
    for (let c of collections) {
      const collStats = await db.command({ collStats: c.name });
      if (collStats.size > 0) {
        console.log(`- ${c.name.padEnd(15)} | Size: ${(collStats.size / 1024 / 1024).toFixed(2)} MB | Documents: ${collStats.count}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
check();
