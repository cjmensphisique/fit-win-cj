import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import * as models from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');

    const dataPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dataPath)) {
      console.log('No data.json found, skipping migration.');
      process.exit(0);
    }
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const db = JSON.parse(rawData);

    // Map JSON arrays to models
    const mappings = [
      { key: 'clients', model: models.Client },
      { key: 'tasks', model: models.Task },
      { key: 'notifications', model: models.Notification },
      { key: 'workoutPlans', model: models.WorkoutPlan },
      { key: 'exercises', model: models.Exercise },
      { key: 'mealPlans', model: models.MealPlan },
      { key: 'messages', model: models.Message },
      { key: 'metrics', model: models.Metric },
      { key: 'payments', model: models.Payment },
      { key: 'goals', model: models.Goal },
      { key: 'checkIns', model: models.CheckIn }
    ];

    for (const mapping of mappings) {
      const records = db[mapping.key] || [];
      if (records.length > 0) {
        console.log(`Migrating ${records.length} records for ${mapping.key}...`);
        await mapping.model.deleteMany({}); // clear existing
        await mapping.model.insertMany(records);
      }
    }

    console.log('Migration completed successfully! All JSON data has been moved to MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
