import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: String, email: String, phone: String, password: String,
  weight: String, height: String, age: String, address: String,
  goal: String, joinedDate: String,
  photos: [{ id: String, data: String, date: String }],
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: String,
  id: { type: String, unique: true } // keeping original ID for migration
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: String, date: String, clientId: String, type: String,
  description: String, assignedBy: String, completed: Boolean,
  id: { type: String, unique: true }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: String, message: String, type: String, icon: String,
  read: Boolean, createdAt: String,
  id: { type: String, unique: true }
});

const reminderSchema = new mongoose.Schema({
  id: String,
  clientId: String,
  description: String,
  triggerDate: Date,
  isTriggered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'reminders' });

const workoutPlanSchema = new mongoose.Schema({
  name: String, description: String, durationWeeks: Number,
  clientId: String, schedule: mongoose.Schema.Types.Mixed,
  createdAt: String, updatedAt: String,
  id: { type: String, unique: true }
});

const exerciseSchema = new mongoose.Schema({
  name: String, muscleGroup: String, equipment: String,
  difficulty: String, description: String, defaultSets: Number,
  defaultReps: String, defaultRest: String, createdAt: String,
  id: { type: String, unique: true }
});

const mealPlanSchema = new mongoose.Schema({
  name: String, clientId: String, goal: String,
  schedule: mongoose.Schema.Types.Mixed,
  createdAt: String, updatedAt: String,
  id: { type: String, unique: true }
});

const messageSchema = new mongoose.Schema({
  senderId: String, receiverId: String, text: String,
  read: Boolean, createdAt: String,
  id: { type: String, unique: true }
});

const paymentSchema = new mongoose.Schema({
  clientId: String, description: String, amount: Number,
  currency: String, status: String, dueDate: String, notes: String,
  paidDate: String, createdAt: String,
  id: { type: String, unique: true }
});

const checkInSchema = new mongoose.Schema({
  clientId: String, weight: String, energyLevel: String,
  sleepQuality: String, notes: String, reviewed: Boolean,
  createdAt: String,
  id: { type: String, unique: true }
});

const metricSchema = new mongoose.Schema({
  clientId: String, date: String, weight: String, bodyFat: String,
  muscleMass: String, measurements: mongoose.Schema.Types.Mixed,
  id: { type: String, unique: true }
});

const goalSchema = new mongoose.Schema({
  clientId: String, 
  title: String,
  type: String, 
  duration: Number,
  targetValue: String,
  currentValue: String, 
  targetDate: String, 
  startDate: String,
  dailyTargets: [String],
  monthlyTargets: [String],
  checkins: [mongoose.Schema.Types.Mixed],
  streak: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  notes: String,
  id: { type: String, unique: true }
});

export const Client = mongoose.model('Client', clientSchema);
export const Task = mongoose.model('Task', taskSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const Reminder = mongoose.model('Reminder', reminderSchema);
export const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
export const Exercise = mongoose.model('Exercise', exerciseSchema);
export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export const Message = mongoose.model('Message', messageSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const CheckIn = mongoose.model('CheckIn', checkInSchema);
export const Metric = mongoose.model('Metric', metricSchema);
export const Goal = mongoose.model('Goal', goalSchema);
