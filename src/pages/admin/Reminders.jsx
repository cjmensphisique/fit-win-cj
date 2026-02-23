import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../api';
import { AlarmClock, Plus, Trash2, Calendar, Clock, User } from 'lucide-react';

export default function Reminders() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all clients
  useEffect(() => {
    fetch(`${API_URL}/api/clients`)
      .then(res => res.json())
      .then(data => {
        setClients(data);
        if (data.length > 0) {
          setSelectedClient(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load clients', err));
  }, []);

  // Fetch reminders for selected client
  useEffect(() => {
    if (!selectedClient) return;
    fetch(`${API_URL}/api/reminders/${selectedClient}`)
      .then(res => res.json())
      .then(data => setReminders(data))
      .catch(err => console.error('Failed to load reminders', err));
  }, [selectedClient]);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!description || !dateStr || !timeStr) {
      setError('Please fill in all fields.');
      return;
    }

    // Parse local date + time strings to a JS Date object
    const triggerDate = new Date(`${dateStr}T${timeStr}:00`);
    
    if (triggerDate <= new Date()) {
      setError('Reminder time must be in the future.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          description,
          triggerDate: triggerDate.toISOString()
        })
      });
      
      const newReminder = await res.json();
      setReminders([...reminders, newReminder].sort((a, b) => new Date(a.triggerDate) - new Date(b.triggerDate)));
      
      // Reset form
      setDescription('');
      setDateStr('');
      setTimeStr('');
    } catch (err) {
      setError('Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/reminders/${id}`, { method: 'DELETE' });
      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete reminder', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-yellow-500/20 rounded-xl">
          <AlarmClock className="w-8 h-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Client Reminders</h1>
          <p className="text-zinc-400 mt-1">Set custom alarms and notifications for your clients</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Create Reminder Form */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#1a1a1a] rounded-2xl border border-zinc-800 p-6 flex flex-col h-fit">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-yellow-500" />
            New Alarm
          </h2>

          <form onSubmit={handleCreateReminder} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Client
              </label>
              <select 
                value={selectedClient} 
                onChange={e => setSelectedClient(e.target.value)}
                className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl p-3 text-base focus:border-yellow-500 focus:outline-none transition-colors appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffc105%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                required
              >
                <option value="" disabled className="text-zinc-500">Select a Client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a1a] text-white">
                    {c.name || 'Unnamed Client'} {c.email ? `(${c.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-400">Description</label>
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Drink 1 gallon of water!"
                className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl p-3 focus:border-yellow-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input 
                  type="date" 
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl p-3 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time
                </label>
                <input 
                  type="time" 
                  value={timeStr}
                  onChange={e => setTimeStr(e.target.value)}
                  className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl p-3 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <AlarmClock className="w-5 h-5" />
              {loading ? 'Saving...' : 'Set Alarm'}
            </button>
          </form>
        </div>

        {/* Upcoming Reminders List */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[#1a1a1a] rounded-2xl border border-zinc-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Upcoming Alarms</h2>
            {clients.length > 0 && (
              <span className="bg-[#111] border border-zinc-800 px-3 py-1 rounded-full text-zinc-400 text-sm">
                {clients.find(c => c.id === selectedClient)?.name}
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {reminders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                <AlarmClock className="w-12 h-12 mb-3 opacity-20" />
                <p>No upcoming alarms for this client.</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div key={reminder.id} className="bg-[#111] border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-yellow-500/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-yellow-500/10 rounded-lg text-yellow-500 mt-0.5">
                      <AlarmClock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{reminder.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(reminder.triggerDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-yellow-500/70" /> {new Date(reminder.triggerDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(reminder.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
