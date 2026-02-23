import { useState } from 'react';
import { useData } from '../../context/DataContext';
import WorkoutPlanModal from '../../components/WorkoutPlanModal';
import { Plus, Edit2, Trash2, Users, Dumbbell, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutPlans() {
  const { data, workoutPlans, saveWorkoutPlan, deleteWorkoutPlan, addNotification } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleSave = async (planData) => {
    const saved = await saveWorkoutPlan(planData);
    // Notify client if assigned
    if (planData.clientId) {
      const client = data.clients.find(c => c.id === planData.clientId);
      if (client) {
        await addNotification({
          userId: planData.clientId,
          message: `A new workout plan "${planData.name}" has been assigned to you!`,
          type: 'success',
          icon: 'workout',
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this workout plan?')) {
      await deleteWorkoutPlan(id);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const getExerciseCount = (plan) =>
    Object.values(plan.schedule || {}).reduce((sum, arr) => sum + arr.length, 0);

  const getActiveDays = (plan) =>
    DAYS.filter(d => (plan.schedule?.[d] || []).length > 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Workout Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">{workoutPlans.length} plans created</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center px-4 py-2 rounded-lg font-medium transition-all"
          style={{ background: '#ffc105', color: '#111' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
        >
          <Plus className="w-5 h-5 mr-2" /> Create Plan
        </button>
      </div>

      {workoutPlans.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed border-gray-700 p-16 text-center"
          style={{ background: '#1a1a1a' }}
        >
          <Dumbbell className="w-14 h-14 mx-auto mb-4 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No workout plans yet</h3>
          <p className="text-sm text-gray-600 mb-6">Create your first workout plan and assign it to a client.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#ffc105', color: '#111' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
          >
            <Plus className="w-4 h-4 mr-2" /> Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {workoutPlans.map(plan => {
            const client = data.clients.find(c => c.id === plan.clientId);
            const exerciseCount = getExerciseCount(plan);
            const activeDays = getActiveDays(plan);

            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-gray-700 overflow-hidden transition-all hover:border-gray-600"
                style={{ background: '#1a1a1a' }}
              >
                {/* Card Header */}
                <div
                  className="px-5 py-4 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #222, #1a1a1a)', borderBottom: '1px solid #2a2a2a' }}
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                    style={{ background: '#ffc105', transform: 'translate(30%, -30%)' }}
                  />
                  <div className="flex items-start justify-between relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,193,5,0.15)' }}>
                        <Dumbbell className="w-5 h-5" style={{ color: '#ffc105' }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{plan.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-500 hover:bg-gray-800 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-5 py-4 space-y-3">
                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Dumbbell className="w-3.5 h-3.5 text-gray-600" />
                      <span>{exerciseCount} exercises</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                      <span>{plan.durationWeeks}w program</span>
                    </div>
                  </div>

                  {/* Active Days */}
                  <div className="flex flex-wrap gap-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                      const full = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i];
                      const active = activeDays.includes(full);
                      return (
                        <span
                          key={d}
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            background: active ? 'rgba(255,193,5,0.15)' : '#222',
                            color: active ? '#ffc105' : '#444',
                          }}
                        >
                          {d}
                        </span>
                      );
                    })}
                  </div>

                  {/* Assigned Client */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                    <Users className="w-3.5 h-3.5 text-gray-600" />
                    {client ? (
                      <span className="text-sm text-gray-300">{client.name}</span>
                    ) : (
                      <span className="text-sm text-gray-600 italic">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WorkoutPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        plan={editingPlan}
        clients={data.clients}
      />
    </div>
  );
}
