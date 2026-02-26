import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import bcrypt from 'bcrypt';
import * as models from './db.js';
import { sendReminderEmail, sendMondayCheckinEmail } from './emailService.js';

dotenv.config(); // Load from current working directory (usually root)
dotenv.config({ path: './.env' }); 
dotenv.config({ path: '../.env' }); 

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI not found in environment. Check your .env file.');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*', // Allow Vercel frontend to reach this backend
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB with robust handling
const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryInterval = 5000; // 5 seconds

  try {
    console.log(`Connecting to MongoDB Atlas (Attempt ${retryCount + 1})...`);
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Wait 10 seconds for server selection
      socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
    });
  } catch (err) {
    console.error(`MongoDB connection attempt ${retryCount + 1} failed:`, err.message);
    
    if (retryCount < maxRetries) {
      console.log(`Retrying in ${retryInterval / 1000} seconds...`);
      setTimeout(() => connectDB(retryCount + 1), retryInterval);
    } else {
      console.error('Max retries reached. Could not connect to MongoDB Atlas.');
      process.exit(1);
    }
  }
};

// Connection Event Listeners
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB Atlas');
  seedAdminAndMigrate();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Mongoose will automatically try to reconnect.');
});

// Seed default admin if missing and run migrations
async function seedAdminAndMigrate() {
  try {
    const exists = await models.Admin.findOne({ email: "chiranjeeviwyld5@gmail.com" });
    if (!exists) {
      const hashedPassword = await bcrypt.hash("Cjfitness@55", 10);
      await models.Admin.create({
        name: "CJ Fitness",
        email: "chiranjeeviwyld5@gmail.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log('Default admin seeded to database');
    }
    
    // Migration: Hash existing plain text passwords
    const admins = await models.Admin.find();
    for (const admin of admins) {
      if (!admin.password.startsWith('$2b$')) {
        admin.password = await bcrypt.hash(admin.password, 10);
        await admin.save();
        console.log(`Hashed password for admin: ${admin.email}`);
      }
    }
    
    const clients = await models.Client.find();
    for (const client of clients) {
      if (client.password && !client.password.startsWith('$2b$')) {
        client.password = await bcrypt.hash(client.password, 10);
        await client.save();
        console.log(`Hashed password for client: ${client.email}`);
      }
    }
  } catch (err) {
    console.error('Failed during seed/migration:', err);
  }
}

connectDB();

// ─── DATA (legacy endpoint for Dashboard load) ──────────────────────────────
app.get('/api/data', async (req, res) => {
  try {
    const [clients, tasks, notifications, workoutPlans, exercises, mealPlans, messages, metrics, payments, goals, checkIns, adminDoc] = await Promise.all([
      models.Client.find().select('-password'),
      models.Task.find(),
      models.Notification.find(),
      models.WorkoutPlan.find(),
      models.Exercise.find(),
      models.MealPlan.find(),
      models.Message.find(),
      models.Metric.find(),
      models.Payment.find(),
      models.Goal.find(),
      models.CheckIn.find(),
      models.Admin.findOne({ email: "chiranjeeviwyld5@gmail.com" }).select('-password')
    ]);
    
    res.json({
      admin: adminDoc || { email: "chiranjeeviwyld5@gmail.com", role: 'admin' },
      clients, tasks, notifications, workoutPlans, exercises, mealPlans, messages, metrics, payments, goals, checkIns
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/save', async (req, res) => {
  res.json({ success: true });
});

// ─── AUTHENTICATION ──────────────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  try {
    // 1. Try Admin check
    let user = await models.Admin.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    });
    
    // 2. Try Client check if not admin
    if (!user) {
      user = await models.Client.findOne({ 
        $or: [{ email: identifier }, { phone: identifier }] 
      });
    }
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Success: Return user without password
        const userData = user.toObject();
        delete userData.password;
        // Ensure role is present for clients (to handle legacy data)
        if (!userData.role && identifier !== "chiranjeeviwyld5@gmail.com") {
          userData.role = 'client';
        }
        return res.json({ success: true, user: userData });
      }
    }
    
    res.status(401).json({ error: 'Invalid email/phone or password' });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/api/auth/verify-identity', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await models.Admin.findOne({ email });
    if (!user) {
      user = await models.Client.findOne({ email });
    }
    
    if (user) {
      return res.json({ success: true, message: 'Identity found' });
    }
    res.status(404).json({ error: 'User with this email not found' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, phone, newPassword } = req.body;
  try {
    let user = await models.Admin.findOne({ email });
    
    if (!user) {
      user = await models.Client.findOne({ email });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if phone matches (basic equality check for the demo)
    if (user.phone !== phone) {
      return res.status(401).json({ error: 'Phone number does not match our records' });
    }
    
    // Update password (hashed)
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// ─── CLIENTS ─────────────────────────────────────────────────────────────────

app.post('/api/clients', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || 'Welcome@123', 10);
    const referralCode = 'CJFIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClient = new models.Client({ ...req.body, password: hashedPassword, id: Date.now().toString(), referralCode });
    await newClient.save();
    res.json(newClient);
  } catch (error) { res.status(500).json({ error: 'Failed to create client' }); }
});

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await models.Client.find();
    res.json(clients);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch clients' }); }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await models.Client.findOne({ id: req.params.id });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) { res.status(500).json({ error: 'Failed to find client' }); }
});

app.patch('/api/clients/:id', async (req, res) => {
  try {
    const client = await models.Client.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) { res.status(500).json({ error: 'Failed to update client' }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await models.Client.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete client' }); }
});

app.post('/api/clients/:id/photos', async (req, res) => {
  try {
    const client = await models.Client.findOne({ id: req.params.id });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    
    const photo = {
      id: Date.now().toString(),
      dataUrl: req.body.dataUrl,
      label: req.body.label || 'Progress',
      date: req.body.date || new Date().toISOString().split('T')[0],
    };
    client.photos.push(photo);
    await client.save();
    res.json(photo);
  } catch (error) { res.status(500).json({ error: 'Failed to add photo' }); }
});

app.delete('/api/clients/:id/photos/:photoId', async (req, res) => {
  try {
    const client = await models.Client.findOne({ id: req.params.id });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    client.photos = client.photos.filter(p => String(p.id) !== req.params.photoId);
    await client.save();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete photo' }); }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    // Return all notifications sorted by most recent first
    const notifs = await models.Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notif = new models.Notification({
      id: Date.now().toString(),
      userId: req.body.userId,
      message: req.body.message,
      type: req.body.type || 'info', 
      icon: req.body.icon || 'bell',
      read: false,
      createdAt: new Date().toISOString(),
    });
    await notif.save();
    res.json(notif);
  } catch (error) { res.status(500).json({ error: 'Failed to create notification' }); }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await models.Notification.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete notification' }); }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notif = await models.Notification.findOneAndUpdate({ id: req.params.id }, { read: true }, { new: true });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif);
  } catch (error) { res.status(500).json({ error: 'Failed to update notification' }); }
});

app.patch('/api/notifications/read-all/:userId', async (req, res) => {
  try {
    await models.Notification.updateMany({ userId: req.params.userId }, { read: true });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to mark all read' }); }
});

// ─── REMINDERS ──────────────────────────────────────────────────────────────────

app.get('/api/reminders/:clientId', async (req, res) => {
  try {
    const reminders = await models.Reminder.find({ clientId: req.params.clientId, isTriggered: false }).sort({ triggerDate: 1 });
    res.json(reminders);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch reminders' }); }
});

app.post('/api/reminders', async (req, res) => {
  try {
    const reminder = new models.Reminder({
      id: Date.now().toString(),
      clientId: req.body.clientId,
      description: req.body.description,
      triggerDate: new Date(req.body.triggerDate),
      isTriggered: false,
      createdAt: new Date().toISOString(),
    });
    await reminder.save();
    res.json(reminder);
  } catch (error) { res.status(500).json({ error: 'Failed to create reminder' }); }
});

app.delete('/api/reminders/:id', async (req, res) => {
  try {
    await models.Reminder.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete reminder' }); }
});

// ─── WORKOUT PLANS ────────────────────────────────────────────────────────────

app.get('/api/workout-plans', async (req, res) => {
  try {
    const plans = await models.WorkoutPlan.find();
    res.json(plans);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.post('/api/workout-plans', async (req, res) => {
  try {
    const planId = req.body.id || Date.now().toString();
    const planData = {
      ...req.body,
      id: planId,
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const plan = await models.WorkoutPlan.findOneAndUpdate(
      { id: planId }, 
      planData, 
      { new: true, upsert: true }
    );
    res.json(plan);
  } catch (error) { res.status(500).json({ error: 'Failed to save' }); }
});

app.delete('/api/workout-plans/:id', async (req, res) => {
  try {
    await models.WorkoutPlan.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete' }); }
});

// ─── EXERCISES ───────────────────────────────────────────────────────────────

app.get('/api/exercises', async (req, res) => {
  try {
    res.json(await models.Exercise.find());
  } catch { res.status(500).json({ error: 'Failed to fetch exercises' }); }
});

app.post('/api/exercises', async (req, res) => {
  try {
    const ex = new models.Exercise({ ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() });
    await ex.save();
    res.json(ex);
  } catch { res.status(500).json({ error: 'Failed to create exercise' }); }
});

app.patch('/api/exercises/:id', async (req, res) => {
  try {
    const ex = await models.Exercise.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(ex);
  } catch { res.status(500).json({ error: 'Failed to update exercise' }); }
});

app.delete('/api/exercises/:id', async (req, res) => {
  try {
    await models.Exercise.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete exercise' }); }
});

// ─── MEAL PLANS ──────────────────────────────────────────────────────────────

app.get('/api/meal-plans', async (req, res) => {
  try {
    res.json(await models.MealPlan.find());
  } catch { res.status(500).json({ error: 'Failed to fetch meal plans' }); }
});

app.post('/api/meal-plans', async (req, res) => {
  try {
    const id = req.body.id || Date.now().toString();
    const planData = { ...req.body, id, createdAt: req.body.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    const plan = await models.MealPlan.findOneAndUpdate({ id }, planData, { new: true, upsert: true });
    res.json(plan);
  } catch { res.status(500).json({ error: 'Failed to save meal plan' }); }
});

app.delete('/api/meal-plans/:id', async (req, res) => {
  try {
    await models.MealPlan.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete' }); }
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const msgs = await models.Message.find({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }]
    });
    res.json(msgs);
  } catch { res.status(500).json({ error: 'Failed to fetch messages' }); }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = new models.Message({ ...req.body, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() });
    await msg.save();
    res.json(msg);
  } catch { res.status(500).json({ error: 'Failed to send message' }); }
});

app.patch('/api/messages/read/:userId', async (req, res) => {
  try {
    const { fromId } = req.body;
    
    // Mark messages as read
    await models.Message.updateMany({ receiverId: req.params.userId, senderId: fromId }, { read: true });
    
    // Also mark associated notifications as read
    const senderData = await models.Client.findOne({ id: fromId });
    const nameMatch = fromId === 'admin' ? 'Coach CJ' : (senderData?.name || 'Client');
    
    await models.Notification.updateMany(
      { userId: req.params.userId, icon: 'message', message: new RegExp(nameMatch, 'i') },
      { read: true }
    );

    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to mark messages read' }); }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await models.Message.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete message' }); }
});

app.delete('/api/messages/conversation/:userId', async (req, res) => {
  try {
    const adminId = 'admin';
    const userId = req.params.userId;
    await models.Message.deleteMany({
      $or: [
        { senderId: adminId, receiverId: userId },
        { senderId: userId, receiverId: adminId }
      ]
    });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete conversation' }); }
});

// ─── BODY METRICS ─────────────────────────────────────────────────────────────

app.get('/api/metrics/:clientId', async (req, res) => {
  try {
    const entries = await models.Metric.find({ clientId: req.params.clientId }).sort({ date: 1 });
    res.json(entries);
  } catch { res.status(500).json({ error: 'Failed to fetch metrics' }); }
});

app.post('/api/metrics', async (req, res) => {
  try {
    const entry = new models.Metric({ ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() });
    await entry.save();
    res.json(entry);
  } catch { res.status(500).json({ error: 'Failed to add metric' }); }
});

app.delete('/api/metrics/:id', async (req, res) => {
  try {
    await models.Metric.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete metric' }); }
});

// ─── PAYMENTS / BILLING ───────────────────────────────────────────────────────

app.get('/api/payments', async (req, res) => {
  try { res.json(await models.Payment.find()); } catch { res.status(500).json({ error: 'Failed to fetch payments' }); }
});

app.post('/api/payments', async (req, res) => {
  try {
    const payment = new models.Payment({ ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() });
    await payment.save();
    res.json(payment);
  } catch { res.status(500).json({ error: 'Failed to create payment' }); }
});

app.patch('/api/payments/:id', async (req, res) => {
  try {
    const payment = await models.Payment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(payment);
  } catch { res.status(500).json({ error: 'Failed to update payment' }); }
});

app.delete('/api/payments/:id', async (req, res) => {
  try {
    await models.Payment.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete payment' }); }
});

// ─── GOALS ───────────────────────────────────────────────────────────────────

app.get('/api/goals/:clientId', async (req, res) => {
  try { res.json(await models.Goal.find({ clientId: req.params.clientId })); } catch { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/goals', async (req, res) => {
  try {
    const goal = new models.Goal({ ...req.body, id: Date.now().toString(), status: 'active', checkins: [], createdAt: new Date().toISOString() });
    await goal.save();
    res.json(goal);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

app.patch('/api/goals/:id', async (req, res) => {
  try {
    const goal = await models.Goal.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(goal);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    await models.Goal.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

// ─── CHECK-INS ───────────────────────────────────────────────────────────────

app.get('/api/check-ins', async (req, res) => {
  try { res.json(await models.CheckIn.find()); } catch { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.post('/api/check-ins', async (req, res) => {
  try {
    const checkIn = new models.CheckIn({ 
      ...req.body, id: Date.now().toString(), reviewed: false, createdAt: new Date().toISOString() 
    });
    
    // Auto-update client weight if provided
    if (req.body.weight) {
      await models.Client.findOneAndUpdate({ id: req.body.clientId }, { weight: req.body.weight });
    }
    
    await checkIn.save();
    res.json(checkIn);
  } catch { res.status(500).json({ error: 'Failed to create check-in' }); }
});

app.patch('/api/check-ins/:id', async (req, res) => {
  try {
    const checkIn = await models.CheckIn.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(checkIn);
  } catch { res.status(500).json({ error: 'Failed to update check-in' }); }
});

// ─── CRON JOBS ─────────────────────────────────────────────────────────────────
// 1. Run every Monday at 9:00 AM server time (0 9 * * 1) for check-ins
cron.schedule('0 9 * * 1', async () => {
  console.log('Running automated Monday check-in reminders...');
  try {
    const clients = await models.Client.find();
    
    // Create an array of notification promises
    const promises = clients.map(async (client) => {
      // Send Email
      await sendMondayCheckinEmail(client.email, client.name);

      // Create App Notification
      return new models.Notification({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        userId: client.id,
        message: "Happy Monday! Don't forget to submit your weekly check-in today to track your progress.",
        type: 'info',
        icon: 'bell',
        read: false,
        createdAt: new Date().toISOString()
      }).save();
    });

    await Promise.all(promises);
    console.log(`Successfully sent check-in reminders and emails to ${promises.length} clients.`);
  } catch (error) {
    console.error('Failed to run automated Monday reminders:', error);
  }
});

// 2. Run every minute to check for triggering custom Reminders/Alarms
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Find reminders where triggerDate is past but they haven't triggered yet
    const pendingReminders = await models.Reminder.find({
      isTriggered: false,
      triggerDate: { $lte: now }
    });

    if (pendingReminders.length > 0) {
      console.log(`Triggering ${pendingReminders.length} custom reminders...`);
      
      const updatePromises = pendingReminders.map(async (reminder) => {
        // Find client to get email
        const client = await models.Client.findOne({ id: reminder.clientId });

        // 1. Send Email Notification
        if (client) {
          await sendReminderEmail(client.email, client.name, reminder.description);
        }

        // 2. Create an in-app notification for the client
        await new models.Notification({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          userId: reminder.clientId,
          message: `ALARM: ${reminder.description}`,
          type: 'alert',
          icon: 'bell',
          read: false,
          createdAt: new Date().toISOString()
        }).save();

        // 3. Mark reminder as triggered
        reminder.isTriggered = true;
        await reminder.save();
      });

      await Promise.all(updatePromises);
    }
  } catch (error) {
    console.error('Failed to run custom reminders check:', error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running with MongoDB Atlas on http://localhost:${PORT}`);
});
