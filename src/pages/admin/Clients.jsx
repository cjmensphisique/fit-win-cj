import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import ClientModal from '../../components/ClientModal';
import { Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';

export default function Clients() {
  const { data, updateClient, addClient, removeClient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        // Update existing via individual PATCH
        await updateClient(editingClient.id, clientData);
      } else {
        // Add new via POST
        await addClient({
          ...clientData,
          joinedDate: new Date().toISOString().split('T')[0]
        });
      }
      setEditingClient(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save client", err);
      alert("Failed to save client.");
    }
  };

  const handleDelete = async (id) => {
     if (window.confirm('Are you sure you want to delete this client?')) {
        try {
          await removeClient(id);
        } catch (err) {
          console.error("Failed to delete client", err);
          alert("Failed to delete client.");
        }
     }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const filteredClients = data.clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Clients Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 rounded-lg font-medium transition-all self-start sm:self-auto"
          style={{ background: '#ffc105', color: '#111' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e6ad00')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffc105')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Onboard Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-dark-card text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-900 focus:border-yellow-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="shadow rounded-lg overflow-hidden border border-gray-700" style={{ background: '#1a1a1a' }}>
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Goal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stats (W/H)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{client.name}</div>
                  <div className="text-sm text-gray-400">Age: {client.age}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{client.email}</div>
                  <div className="text-sm text-gray-400">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-200">
                    {client.goal}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {client.weight}kg / {client.height}cm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(client)} className="mr-4 transition-colors" style={{ color: '#ffc105' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#e6ad00')} onMouseLeave={(e) => (e.currentTarget.style.color = '#ffc105')}>
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </div>
  );
}
