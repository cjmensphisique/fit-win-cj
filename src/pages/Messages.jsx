import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  MessageSquare, Send, Search, User, Users, ArrowLeft
} from 'lucide-react';

const API = 'http://localhost:3001';
const ADMIN_ID = 'admin';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function Avatar({ name, size = 8, color = '#ffc105' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center font-black text-xs shrink-0`}
      style={{ background: `${color}22`, color, border: `1.5px solid ${color}44`, width: size * 4, height: size * 4 }}
    >
      {initials}
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { data, addNotification, loadNotifications } = useData();
  const clients = data?.clients || [];
  const isAdmin = user?.role === 'admin';

  // Admin state = selected client conversation
  // Client state = single conversation with admin
  const [conversations, setConversations] = useState([]); // admin
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [search, setSearch] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // For client: fetch own messages
  const fetchMessages = async (fromId) => {
    const id = isAdmin ? ADMIN_ID : user.id;
    try {
      const r = await fetch(`${API}/api/messages/${id}`);
      const d = await r.json();
      const msgs = Array.isArray(d) ? d : [];
      if (isAdmin && fromId) {
        setMessages(msgs.filter(m =>
          (m.senderId === fromId && m.receiverId === ADMIN_ID) ||
          (m.senderId === ADMIN_ID && m.receiverId === fromId)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      } else {
        setMessages(msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      }
      return msgs;
    } catch { return []; }
  };

  // Build admin conversation list from all messages
  const buildConversations = (msgs) => {
    const map = {};
    msgs.forEach(m => {
      const clientId = m.senderId === ADMIN_ID ? m.receiverId : m.senderId;
      if (!map[clientId]) map[clientId] = { clientId, messages: [], unread: 0 };
      map[clientId].messages.push(m);
      if (!m.read && m.receiverId === ADMIN_ID) map[clientId].unread++;
    });
    return Object.values(map).sort((a, b) => {
      const la = a.messages[a.messages.length - 1]?.createdAt;
      const lb = b.messages[b.messages.length - 1]?.createdAt;
      return new Date(lb) - new Date(la);
    });
  };

  const load = async () => {
    const msgs = await fetchMessages(selectedClientId);
    if (isAdmin) {
      setConversations(buildConversations(msgs));
      if (selectedClientId && msgs.some(m => !m.read && m.receiverId === ADMIN_ID && m.senderId === selectedClientId)) {
        fetch(`${API}/api/messages/read/${ADMIN_ID}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId: selectedClientId }),
        });
      }
    } else {
      if (msgs.some(m => !m.read && m.receiverId === user.id && m.senderId === ADMIN_ID)) {
        fetch(`${API}/api/messages/read/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId: ADMIN_ID }),
        });
      }
    }
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 3000); // poll every 3s
    return () => clearInterval(pollRef.current);
  }, [selectedClientId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const selectClient = async (clientId) => {
    setSelectedClientId(clientId);
    setMobileView('chat');
    // Mark read
    await fetch(`${API}/api/messages/read/${ADMIN_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: clientId }),
    });
    
    // Force global components to drop their red unread badges instantly
    window.dispatchEvent(new Event('messages-read'));
    loadNotifications(isAdmin ? 'admin' : user.id);
  };

  const send = async () => {
    if (!text.trim()) return;
    const receiverId = isAdmin ? selectedClientId : ADMIN_ID;
    const senderId = isAdmin ? ADMIN_ID : user.id;
    if (!receiverId) return;
    setSending(true);
    try {
      await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, text: text.trim() }),
      });
      setText('');
      await load();

      // Trigger a real-time notification for the receiver
      const senderName = isAdmin ? 'Coach CJ' : (user.name || 'Client');
      await addNotification({
        userId: receiverId,
        message: `New message from ${senderName}`,
        type: 'info',
        icon: 'message'
      });
    } catch {}
    setSending(false);
  };

  const deleteConversation = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this entire conversation permanently?")) return;
    try {
      await fetch(`${API}/api/messages/conversation/${clientId}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.clientId !== clientId));
      setMessages(prev => prev.filter(m => m.senderId !== clientId && m.receiverId !== clientId));
      if (selectedClientId === clientId) setSelectedClientId(null);
    } catch (err) { console.error("Failed to delete conversation", err); }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const filteredConvs = conversations.filter(conv => {
    const client = clients.find(c => c.id === conv.clientId);
    return !search || (client?.name || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden" style={{ border: '1px solid #1e1e1e', background: '#111' }}>

      {/* ── Sidebar (Admin: client list | Client: header only) ── */}
      {/* On mobile: show sidebar OR chat, not both */}
      <div
        className={`${mobileView === 'chat' && isAdmin ? 'hidden sm:flex' : 'flex'} flex-col sm:w-72 w-full`}
        style={{ borderRight: '1px solid #1e1e1e', background: '#0d0d0d' }}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5" style={{ color: '#ffc105' }} />
            <p className="font-black text-white text-sm">Messages</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: '#ccc' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="flex-1 bg-transparent text-xs text-white outline-none" />
            </div>
          )}
        </div>

        {/* Admin: list of client conversations */}
        {isAdmin ? (
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2 px-4">
                <Users className="w-8 h-8" style={{ color: '#333' }} />
                <p className="text-xs text-center" style={{ color: '#ccc' }}>
                  No conversations yet. Send a message to a client!
                </p>
              </div>
            ) : filteredConvs.map(conv => {
              const client = clients.find(c => c.id === conv.clientId);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isSelected = conv.clientId === selectedClientId;
              return (
                <div key={conv.clientId} className="relative group">
                  <button onClick={() => selectClient(conv.clientId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all pr-12"
                    style={{ background: isSelected ? '#1a1a1a' : 'transparent', borderBottom: '1px solid #111' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#141414'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar name={client?.name} size={8} color="#ffc105" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{client?.name || '—'}</p>
                        <span className="text-xs shrink-0 ml-2" style={{ color: '#bbb' }}>
                          {lastMsg ? timeAgo(lastMsg.createdAt) : ''}
                        </span>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#ccc' }}>
                        {lastMsg?.text || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: '#ffc105', color: '#111' }}>
                        {conv.unread}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.clientId); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 bg-[#222] rounded-lg text-[#888] hover:text-[#f87171] hover:bg-[#333] transition-all shadow-lg border border-[#333]"
                    title="Delete Conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              );
            })}
            {/* Start new conversation with any client */}
            {clients.filter(c => !conversations.find(conv => conv.clientId === c.id)).map(c => (
              <button key={c.id} onClick={() => selectClient(c.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                style={{ borderBottom: '1px solid #111' }}
                onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar name={c.name} size={8} color="#555" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: '#bbb' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: '#bbb' }}>Start conversation</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Client: sidebar shows "Coach CJ" profile panel */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
            <Avatar name="Coach CJ" size={14} color="#ffc105" />
            <div className="text-center">
              <p className="font-bold text-white text-sm">Coach CJ</p>
              <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>Personal Trainer</p>
              <div className="mt-2 flex items-center gap-1.5 justify-center">
                <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
                <p className="text-xs" style={{ color: '#4ade80' }}>Online</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat panel ── */}
      <div
        className={`flex-1 flex flex-col ${mobileView === 'list' && isAdmin ? 'hidden sm:flex' : 'flex'}`}
        style={{ background: '#111' }}
      >
        {/* No chat selected (admin) */}
        {isAdmin && !selectedClientId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageSquare className="w-12 h-12" style={{ color: '#2a2a2a' }} />
            <p className="font-semibold" style={{ color: '#ccc' }}>Select a client to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 shrink-0 flex items-center gap-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
              {isAdmin && (
                <button onClick={() => { setMobileView('list'); setSelectedClientId(null); }} className="sm:hidden p-1" style={{ color: '#ccc' }}>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <Avatar name={isAdmin ? selectedClient?.name || '—' : 'Coach CJ'} size={8} color={isAdmin ? '#ffc105' : '#ffc105'} />
              <div>
                <p className="font-bold text-white text-sm">{isAdmin ? (selectedClient?.name || '—') : 'Coach CJ'}</p>
                <p className="text-xs" style={{ color: '#4ade80' }}>● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <MessageSquare className="w-8 h-8" style={{ color: '#2a2a2a' }} />
                  <p className="text-sm" style={{ color: '#ccc' }}>No messages yet. Say hello! 👋</p>
                </div>
              ) : messages.map(m => {
                const isMine = isAdmin ? m.senderId === ADMIN_ID : m.senderId === user.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isMine && <Avatar name={isAdmin ? selectedClient?.name : 'CJ'} size={6} color="#555" />}
                    <div className="max-w-[75%]">
                      <div className="px-3.5 py-2.5 rounded-2xl text-sm"
                        style={{
                          background: isMine ? '#ffc105' : '#1e1e1e',
                          color: isMine ? '#111' : '#ddd',
                          borderBottomRightRadius: isMine ? 4 : 16,
                          borderBottomLeftRadius: isMine ? 16 : 4,
                        }}>
                        {m.text}
                      </div>
                      <p className="text-xs mt-1 px-1" style={{ color: '#3a3a3a', textAlign: isMine ? 'right' : 'left' }}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 shrink-0 flex items-center gap-3" style={{ borderTop: '1px solid #1e1e1e' }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white outline-none"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
              <button onClick={send} disabled={sending || !text.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0"
                style={{ background: text.trim() ? '#ffc105' : '#1a1a1a', color: text.trim() ? '#111' : '#444' }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
