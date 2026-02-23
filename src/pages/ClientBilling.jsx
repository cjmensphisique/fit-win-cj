import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const API = 'http://localhost:3001';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#ffc105', bg: 'rgba(255,193,5,0.1)',   icon: Clock },
  paid:     { label: 'Paid',     color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: CheckCircle },
  overdue:  { label: 'Overdue',  color: '#f87171', bg: 'rgba(248,113,113,0.1)',icon: AlertCircle },
};

export default function ClientBilling() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/api/payments`)
      .then(r => r.json())
      .then(d => setPayments(Array.isArray(d) ? d.filter(p => p.clientId === user.id) : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const totalPaid   = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalOwed   = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const nextDue     = payments.filter(p => p.status === 'pending').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <CreditCard className="w-5 h-5" style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">My Billing</h1>
          <p className="text-sm mt-0.5" style={{ color: '#ccc' }}>Payment history & invoices</p>
        </div>
      </div>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Paid',   val: `₹${totalPaid.toLocaleString()}`,  color: '#4ade80' },
            { label: 'Amount Due',   val: `₹${totalOwed.toLocaleString()}`,  color: '#f87171' },
            { label: 'Next Due Date', val: nextDue ? nextDue.dueDate : 'None', color: '#ffc105' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 relative" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: s.color }} />
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#ccc' }}>{s.label}</p>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Invoice list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#333', borderTopColor: '#60a5fa' }} /></div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <CreditCard className="w-10 h-10" style={{ color: '#333' }} />
          <p className="font-semibold text-white text-sm">No invoices yet</p>
          <p className="text-xs" style={{ color: '#ccc' }}>Your coach will create invoices here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(p => {
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl"
                style={{ background: '#141414', border: `1px solid ${p.status === 'overdue' ? '#f8717130' : '#1e1e1e'}` }}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{p.description}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>
                    Due: {p.dueDate}
                    {p.paidDate && ` · Paid: ${p.paidDate}`}
                  </p>
                  {p.notes && <p className="text-xs mt-1" style={{ color: '#ccc' }}>{p.notes}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-xl font-black text-white">₹{parseFloat(p.amount).toLocaleString()}</p>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: sc.bg, color: sc.color }}>
                    <StatusIcon className="w-3 h-3" />{sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
