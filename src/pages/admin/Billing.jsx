import { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  CreditCard, Plus, Trash2, CheckCircle, Clock,
  AlertCircle, X, ChevronDown, Pencil
} from 'lucide-react';

const API = 'http://localhost:3001';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#ffc105', bg: 'rgba(255,193,5,0.1)',   icon: Clock },
  paid:     { label: 'Paid',     color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: CheckCircle },
  overdue:  { label: 'Overdue',  color: '#f87171', bg: 'rgba(248,113,113,0.1)',icon: AlertCircle },
};

const EMPTY_FORM = {
  clientId: '', description: '', amount: '', currency: 'INR',
  status: 'pending', dueDate: '', notes: '',
};

export default function Billing() {
  const { data } = useData();
  const clients = data?.clients || [];
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');

  const load = async () => {
    try {
      const r = await fetch(`${API}/api/payments`);
      const d = await r.json();
      setPayments(Array.isArray(d) ? d : []);
    } catch { setPayments([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = k => v => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      clientId: p.clientId || '',
      description: p.description || '',
      amount: p.amount ?? '',
      currency: p.currency || 'INR',
      status: p.status || 'pending',
      dueDate: p.dueDate || '',
      notes: p.notes || '',
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const save = async () => {
    if (!form.clientId || !form.description || !form.amount || !form.dueDate) return;
    setSaving(true);
    try {
      if (editingId) {
        // Update existing invoice
        await fetch(`${API}/api/payments/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
        });
      } else {
        // Create new invoice
        await fetch(`${API}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
        });
        // Notify client only on creation
        await fetch(`${API}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: form.clientId,
            message: `New invoice: "${form.description}" — ₹${form.amount} due ${form.dueDate}`,
            type: 'info', icon: 'billing',
          }),
        });
      }
      await load();
      closeForm();
    } catch {}
    setSaving(false);
  };

  const markPaid = async (id) => {
    await fetch(`${API}/api/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', paidDate: new Date().toISOString().split('T')[0] }),
    });
    await load();
  };

  const del = async (id) => {
    await fetch(`${API}/api/payments/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    await load();
  };

  const filtered = useMemo(() => payments.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterClient !== 'all' && p.clientId !== filterClient) return false;
    return true;
  }), [payments, filterStatus, filterClient]);

  const totals = useMemo(() => ({
    total: payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
    paid: payments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
    pending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
    overdue: payments.filter(p => p.status === 'overdue').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
  }), [payments]);

  const clientName = id => clients.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <CreditCard className="w-5 h-5" style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Billing</h1>
            <p className="text-sm mt-0.5" style={{ color: '#ccc' }}>{payments.length} invoices</p>
          </div>
        </div>
        <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0"
          style={{ background: '#ffc105', color: '#111' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e6ad00'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffc105'}
        >
          <Plus className="w-4 h-4" />New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Billed', val: totals.total, color: '#60a5fa' },
          { label: 'Collected',    val: totals.paid,  color: '#4ade80' },
          { label: 'Pending',      val: totals.pending, color: '#ffc105' },
          { label: 'Overdue',      val: totals.overdue, color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 relative" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: s.color }} />
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#ccc' }}>{s.label}</p>
            <p className="text-xl font-black text-white">₹{s.val.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'paid', 'overdue'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize"
            style={{
              background: filterStatus === s ? '#ffc105' : '#1a1a1a',
              color: filterStatus === s ? '#111' : '#777',
              border: `1px solid ${filterStatus === s ? '#ffc105' : '#2a2a2a'}`,
            }}>{s === 'all' ? 'All Invoices' : s}</button>
        ))}
        <div className="relative ml-auto">
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold appearance-none pr-7 outline-none"
            style={{ background: '#1a1a1a', color: '#ccc', border: '1px solid #2a2a2a' }}>
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#ccc' }} />
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#333', borderTopColor: '#60a5fa' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <CreditCard className="w-10 h-10" style={{ color: '#333' }} />
          <p className="font-semibold text-white text-sm">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl group transition-all"
                style={{ background: '#141414', border: '1px solid #1e1e1e' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{p.description}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>{clientName(p.clientId)} · Due {p.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-black text-white">₹{parseFloat(p.amount).toLocaleString()}</p>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: sc.bg, color: sc.color }}>
                    <StatusIcon className="w-3 h-3" />{sc.label}
                  </span>
                  {p.status === 'pending' && (
                    <button onClick={() => markPaid(p.id)}
                      className="text-xs font-bold px-2.5 py-1 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                      Mark Paid
                    </button>
                  )}
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit invoice"
                    style={{ color: '#bbb' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffc105'}
                    onMouseLeave={e => e.currentTarget.style.color = '#444'}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete invoice"
                    style={{ color: '#bbb' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = '#444'}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #222' }}>
              <p className="font-bold text-white">{editingId ? 'Edit Invoice' : 'New Invoice'}</p>
              <button onClick={closeForm} style={{ color: '#ccc' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Client select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Client</label>
                <div className="relative">
                  <select value={form.clientId} onChange={e => setF('clientId')(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none appearance-none" style={{ border: '1px solid #2a2a2a', background: '#111' }}>
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#ccc' }} />
                </div>
              </div>
              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Description</label>
                <input value={form.description} onChange={e => setF('description')(e.target.value)}
                  placeholder="e.g. Monthly Coaching — March 2026"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ border: '1px solid #2a2a2a', background: '#111' }} />
              </div>
              {/* Amount + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={e => setF('amount')(e.target.value)} placeholder="3000"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ border: '1px solid #2a2a2a', background: '#111' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setF('dueDate')(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ border: '1px solid #2a2a2a', background: '#111' }} />
                </div>
              </div>
              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbb' }}>Notes (optional)</label>
                <input value={form.notes} onChange={e => setF('notes')(e.target.value)} placeholder="Payment instructions, bank details..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ border: '1px solid #2a2a2a', background: '#111' }} />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #222' }}>
              <button onClick={closeForm} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#ffc105', color: '#111' }}>
                {saving ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Invoice')}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center space-y-4" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="font-bold text-white">Delete this invoice?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #2a2a2a' }}>Cancel</button>
              <button onClick={() => del(deleteId)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: '#f87171', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
