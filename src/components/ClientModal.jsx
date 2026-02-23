import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ClientModal({ isOpen, onClose, onSave, client }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    weight: '',
    height: '',
    age: '',
    address: '',
    goal: '',
    referredBy: '',
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '', // Should be empty for new, or prefilled if editing? Usually blank for security but for this simulated app...
        weight: '',
        height: '',
        age: '',
        address: '',
        goal: '',
        referredBy: '',
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
      <div className="bg-dark-card border border-gray-700 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {client ? 'Edit Client' : 'Onboard New Client'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Email (User ID)</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Phone</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input
              type="text" // Visible for admin as per requirement/implication of "shows me... password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-400">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Fitness Goal</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
            >
              <option value="">Select Goal</option>
              <option value="Hypertrophy">Hypertrophy (Muscle Gain)</option>
              <option value="Strength">Strength Training</option>
              <option value="Fat Loss">Fat Loss</option>
              <option value="Endurance">Endurance</option>
              <option value="Rehabilitation">Rehabilitation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Referral Code (Optional)</label>
            <input
              type="text"
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              placeholder="e.g. CJFIT-1234"
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm px-3 py-2"
            />
          </div>

          <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
             <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-all"
              style={{ background: '#ffc105', color: '#111' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e6ad00')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffc105')}
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
