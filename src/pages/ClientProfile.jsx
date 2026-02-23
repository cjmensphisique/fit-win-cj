import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Camera, Edit3, Save, X, Scale, Ruler, User, Target,
  Calendar, Trash2, ChevronLeft, ChevronRight, Upload,
  Trophy, Award, Star, Flame, Copy, Users
} from 'lucide-react';

const GOAL_COLORS = {
  'Hypertrophy': { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  'Fat Loss': { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  'Strength': { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'Endurance': { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  'Rehabilitation': { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
};

function calcBMI(weight, height) {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return null;
  return (w / (h * h)).toFixed(1);
}

function BMICategory(bmi) {
  if (!bmi) return { label: 'N/A', color: '#bbb' };
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: 'Underweight', color: '#60a5fa' };
  if (b < 25) return { label: 'Normal', color: '#4ade80' };
  if (b < 30) return { label: 'Overweight', color: '#fb923c' };
  return { label: 'Obese', color: '#f87171' };
}

// Before/After slider component
function BeforeAfterSlider({ before, after }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden cursor-col-resize select-none"
      style={{ height: '280px' }}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After (right) */}
      <img src={after.dataUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      {/* Before (left, clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before.dataUrl} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${10000 / pos}%`, maxWidth: 'none' }} />
      </div>
      {/* Divider */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <ChevronLeft className="w-3 h-3 text-gray-800 -mr-0.5" />
          <ChevronRight className="w-3 h-3 text-gray-800 -ml-0.5" />
        </div>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 text-xs font-bold bg-black bg-opacity-60 text-white px-2 py-1 rounded">BEFORE</div>
      <div className="absolute top-3 right-3 text-xs font-bold bg-black bg-opacity-60 text-white px-2 py-1 rounded">AFTER</div>
    </div>
  );
}

export default function ClientProfile({ clientId: propClientId }) {
  const { user } = useAuth();
  const { data, updateClient, addPhoto, deletePhoto } = useData();
  const params = useParams();

  // Admin can view any client via URL param; client views their own
  const targetId = params.id || propClientId || user.id;
  const client = data.clients.find(c => c.id === targetId);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoLabel, setPhotoLabel] = useState('Progress');
  const [compareMode, setCompareMode] = useState(false);
  const fileRef = useRef(null);

  if (!client) {
    return (
      <div className="text-center py-20 text-gray-500">
        Client not found.
      </div>
    );
  }

  const bmi = calcBMI(client.weight, client.height);
  const bmiCat = BMICategory(bmi);
  const goalStyle = GOAL_COLORS[client.goal] || { bg: 'rgba(255,193,5,0.15)', text: '#ffc105', border: 'rgba(255,193,5,0.3)' };
  const photos = client.photos || [];
  const referralsCount = data.clients.filter(c => c.referredBy && client.referralCode && c.referredBy.toUpperCase() === client.referralCode.toUpperCase()).length;
  const isOwnProfile = user.id === targetId;

  const startEdit = () => {
    setForm({ weight: client.weight, phone: client.phone, address: client.address });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClient(targetId, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const compressedDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const maxWidth = 800; // Optimal size for a web dashboard viewer
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress as JPEG at 70% quality (massively reduces payload size)
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => reject(new Error('Failed to load image for compression'));
          img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      await addPhoto(targetId, {
        dataUrl: compressedDataUrl,
        label: photoLabel,
        date: new Date().toISOString().split('T')[0],
      });
      setPhotoLabel('Progress');
    } catch (err) {
      console.error(err);
      alert('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    await deletePhoto(targetId, photoId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Card */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)', border: '1px solid #333' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: 'linear-gradient(135deg, #ffc105, transparent)' }}
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #ffc105, #e6a800)', color: '#111' }}
          >
            {(client.name || 'C')[0].toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ background: goalStyle.bg, color: goalStyle.text, borderColor: goalStyle.border }}
              >
                🎯 {client.goal}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{client.email}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {client.joinedDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Age {client.age}
              </span>
              {client.referralCode && (
                <span
                  className="flex items-center gap-1 cursor-pointer bg-[#ffc105]/10 text-[#ffc105] px-2 py-0.5 rounded hover:bg-[#ffc105]/20 transition-colors border border-[#ffc105]/20"
                  onClick={() => {
                    navigator.clipboard.writeText(client.referralCode);
                    alert('Referral code copied to clipboard!');
                  }}
                  title="Copy Referral Code"
                >
                  <Copy className="w-3 h-3" />
                  Code: {client.referralCode}
                </span>
              )}
              {client.referredBy && (
                <span className="flex items-center gap-1 text-[#4ade80] px-2 py-0.5 bg-[#4ade80]/10 rounded border border-[#4ade80]/20">
                  <User className="w-3 h-3" />
                  Referred by: {client.referredBy}
                </span>
              )}
            </div>
          </div>

          {(isOwnProfile || user.role === 'admin') && !editing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(255,193,5,0.1)', color: '#ffc105', border: '1px solid rgba(255,193,5,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,193,5,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,193,5,0.1)'}
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Weight', value: `${client.weight} kg`, icon: Scale, color: '#ffc105' },
          { label: 'Height', value: `${client.height} cm`, icon: Ruler, color: '#60a5fa' },
          { label: 'BMI', value: bmi || 'N/A', icon: Target, color: bmiCat.color, sub: bmiCat.label },
          { label: 'Phone', value: client.phone || '—', icon: User, color: '#a78bfa' },
          { label: 'Referrals', value: referralsCount, icon: Users, color: '#4ade80' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl p-4 border border-gray-700"
            style={{ background: '#1a1a1a' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            {stat.sub && <p className="text-xs mt-0.5" style={{ color: stat.color }}>{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="rounded-xl p-5 border border-yellow-500 border-opacity-40" style={{ background: '#1a1a1a' }}>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Edit3 className="w-4 h-4" style={{ color: '#ffc105' }} /> Edit Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Weight (kg)', key: 'weight', type: 'number' },
              { label: 'Phone', key: 'phone', type: 'tel' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500"
                />
              </div>
            ))}
            <div className="sm:col-span-3">
              <label className="block text-xs text-gray-400 mb-1">Address</label>
              <textarea
                rows={2}
                value={form.address || ''}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white border border-gray-600 bg-gray-800 focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#ffc105', color: '#111' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address display */}
      {!editing && client.address && (
        <div className="rounded-xl p-4 border border-gray-700" style={{ background: '#1a1a1a' }}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
          <p className="text-sm text-gray-300">{client.address}</p>
        </div>
      )}

      {/* Trophy Room (Badges) */}
      <div className="rounded-xl border border-[#ffc105]/20 overflow-hidden relative" style={{ background: '#161616' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffc105]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] relative z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffc105]" />
            <h2 className="text-white font-bold leading-none">Trophy Room</h2>
            <span className="text-xs font-bold text-[#ffc105] bg-[#ffc105]/10 px-2 py-0.5 rounded-full">{client.badges?.length || 0}</span>
          </div>
        </div>
        <div className="p-5 relative z-10">
           {(!client.badges || client.badges.length === 0) ? (
             <div className="text-center py-8">
               <div className="w-16 h-16 rounded-full bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-3 shadow-inner">
                 <Trophy className="w-6 h-6 text-[#333]" />
               </div>
               <p className="text-sm font-bold text-white mb-1">No badges earned yet</p>
               <p className="text-xs text-[#888]">Keep training and logging check-ins to unlock achievements!</p>
             </div>
           ) : (
             <div className="flex flex-wrap gap-4">
               {client.badges.map(b => (
                 <div key={b.id} className="relative group w-24 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffc105]/20 to-[#f59e0b]/5 border-[3px] border-[#ffc105]/30 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,193,5,0.1)] group-hover:border-[#ffc105] group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                       {b.icon === 'Star' ? <Star className="w-8 h-8 text-[#ffc105] fill-[#ffc105]" /> :
                        b.icon === 'Flame' ? <Flame className="w-8 h-8 text-[#f87171] fill-[#f87171]" /> :
                        <Award className="w-8 h-8 text-[#ffc105]" />}
                    </div>
                    <p className="text-[10px] font-black text-white text-center leading-tight">{b.title}</p>
                    <p className="text-[9px] text-[#666] font-bold mt-0.5">{new Date(b.dateAwarded).toLocaleDateString()}</p>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Progress Photos */}
      <div className="rounded-xl border border-gray-700 overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" style={{ color: '#ffc105' }} />
            <h2 className="text-white font-semibold">Progress Photos</h2>
            <span className="text-xs text-gray-500">({photos.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {photos.length >= 2 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{
                  background: compareMode ? '#ffc105' : 'rgba(255,193,5,0.1)',
                  color: compareMode ? '#111' : '#ffc105',
                  border: '1px solid rgba(255,193,5,0.3)',
                }}
              >
                {compareMode ? 'Gallery View' : 'Before/After'}
              </button>
            )}
            {(isOwnProfile || user.role === 'admin') && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={photoLabel}
                  onChange={e => setPhotoLabel(e.target.value)}
                  placeholder="Label"
                  className="text-xs px-2 py-1.5 rounded-lg border border-gray-600 bg-gray-800 text-white w-24 focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{ background: '#ffc105', color: '#111' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          {photos.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No progress photos yet.</p>
              {(isOwnProfile || user.role === 'admin') && (
                <p className="text-xs mt-1 text-gray-700">Upload your first photo to start tracking progress!</p>
              )}
            </div>
          ) : compareMode && photos.length >= 2 ? (
            <div className="space-y-3">
              <BeforeAfterSlider before={photos[0]} after={photos[photos.length - 1]} />
              <p className="text-xs text-center text-gray-500">
                Comparing: <span className="text-gray-400">{photos[0].label} ({photos[0].date})</span>
                {' → '}
                <span className="text-gray-400">{photos[photos.length - 1].label} ({photos[photos.length - 1].date})</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={photo.dataUrl}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-xs font-semibold text-white truncate">{photo.label}</p>
                    <p className="text-xs text-gray-300">{photo.date}</p>
                  </div>
                  {(isOwnProfile || user.role === 'admin') && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
