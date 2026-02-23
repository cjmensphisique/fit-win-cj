import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/admin/Clients'));
const WorkoutPlans = lazy(() => import('./pages/admin/WorkoutPlans'));
const ExerciseLibrary = lazy(() => import('./pages/admin/ExerciseLibrary'));
const MealPlans = lazy(() => import('./pages/admin/MealPlans'));
const Billing = lazy(() => import('./pages/admin/Billing'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const ClientProfile = lazy(() => import('./pages/ClientProfile'));
const ClientWorkoutPlan = lazy(() => import('./pages/ClientWorkoutPlan'));
const BMRCalculator = lazy(() => import('./pages/BMRCalculator'));
const ExerciseBrowse = lazy(() => import('./pages/ExerciseBrowse'));
const BodyMetrics = lazy(() => import('./pages/BodyMetrics'));
const ClientMealPlan = lazy(() => import('./pages/ClientMealPlan'));
const ClientBilling = lazy(() => import('./pages/ClientBilling'));
const GoalTracker = lazy(() => import('./pages/GoalTracker'));
const ClientCheckIns = lazy(() => import('./pages/ClientCheckIns'));
const AdminCheckIns = lazy(() => import('./pages/admin/AdminCheckIns'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Messages = lazy(() => import('./pages/Messages'));
const Reminders = lazy(() => import('./pages/admin/Reminders'));

import InstallPrompt from './components/InstallPrompt';

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-[#141414] text-[#ffc105]">Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<Layout />}>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/clients" element={<Clients />} />
                  <Route path="/admin/clients/:id" element={<ClientProfile />} />
                  <Route path="/admin/workout-plans" element={<WorkoutPlans />} />
                  <Route path="/admin/exercise-library" element={<ExerciseLibrary />} />
                  <Route path="/admin/meal-plans" element={<MealPlans />} />
                  <Route path="/admin/check-ins" element={<AdminCheckIns />} />
                  <Route path="/admin/billing" element={<Billing />} />
                  <Route path="/admin/bmr-calculator" element={<BMRCalculator />} />
                  <Route path="/admin/messages" element={<Messages />} />
                  <Route path="/admin/reminders" element={<Reminders />} />
                  <Route path="/admin/metrics/:clientId" element={<BodyMetrics />} />
                </Route>
              </Route>

              {/* Client Routes */}
              <Route element={<ProtectedRoute role="client" />}>
                <Route element={<Layout />}>
                  <Route path="/client" element={<Dashboard />} />
                  <Route path="/client/profile" element={<ClientProfile />} />
                  <Route path="/client/workout-plan" element={<ClientWorkoutPlan />} />
                  <Route path="/client/exercise-library" element={<ExerciseBrowse />} />
                  <Route path="/client/meal-plan" element={<ClientMealPlan />} />
                  <Route path="/client/metrics" element={<BodyMetrics />} />
                  <Route path="/client/goal-assist" element={<GoalTracker />} />
                  <Route path="/client/check-ins" element={<ClientCheckIns />} />
                  <Route path="/client/billing" element={<ClientBilling />} />
                  <Route path="/client/bmr-calculator" element={<BMRCalculator />} />
                  <Route path="/client/messages" element={<Messages />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
          <InstallPrompt />
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
