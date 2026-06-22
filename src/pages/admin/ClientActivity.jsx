import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Clock, ChevronDown, ChevronUp, Search, RefreshCw, Smartphone, Monitor, Tablet } from 'lucide-react';
import { API_URL } from '../../api';

export default function ClientActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/activity/logs`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Client Activity Tracker | CJ Fitness Geek";
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter ? log.date === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  const activeSessionsCount = logs.filter(log => log.isActive).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const sessionsTodayCount = logs.filter(log => log.date === todayStr).length;

  const totalDuration = logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
  const averageDuration = logs.length > 0 ? Math.round(totalDuration / logs.length) : 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#222] pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Client Activity Tracker</h1>
          <p className="text-[#888] mt-1 font-medium text-sm">Monitor live client sessions and page navigation history</p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#444] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Sessions */}
        <div className="bg-[#161616] border border-[#222] p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Active Sessions</p>
              <h3 className="text-4xl font-black text-white flex items-center gap-2">
                {activeSessionsCount}
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4ade80]"></span>
                </span>
              </h3>
            </div>
            <div className="p-3 bg-[#4ade80]/10 rounded-xl text-[#4ade80]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Sessions Today */}
        <div className="bg-[#161616] border border-[#222] p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffc105]/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sessions Today</p>
              <h3 className="text-4xl font-black text-white">{sessionsTodayCount}</h3>
            </div>
            <div className="p-3 bg-[#ffc105]/10 rounded-xl text-[#ffc105]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Avg Session Length */}
        <div className="bg-[#161616] border border-[#222] p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a78bfa]/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg. Session Duration</p>
              <h3 className="text-4xl font-black text-white">{averageDuration} <span className="text-sm font-bold text-gray-500">mins</span></h3>
            </div>
            <div className="p-3 bg-[#a78bfa]/10 rounded-xl text-[#a78bfa]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-[#161616] border border-[#222] p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by client name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#333] focus:border-[#ffc105] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Calendar className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full bg-[#111] border border-[#333] focus:border-[#ffc105] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="px-4 py-2.5 bg-[#222] hover:bg-[#333] text-gray-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Logs Container */}
      <div className="bg-[#161616] border border-[#222] rounded-[2rem] overflow-hidden shadow-2xl">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-base font-bold text-white mb-1">No activity logs found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-[#222] bg-[#111]/40">
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">End Time</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {filteredLogs.map(log => {
                  const isSessionLive = log.isActive;
                  const isExpanded = expandedLogId === log.id;
                  
                  const startLocal = new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const endLocal = log.isActive ? 'Present' : new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`border-b border-[#222]/60 hover:bg-[#222]/10 transition-colors ${isExpanded ? 'bg-[#222]/5' : ''} flex flex-col md:table-row p-4 md:p-0 space-y-3.5 md:space-y-0`}>
                        <td className="py-1 md:py-4 px-0 md:px-6 block md:table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffc105] to-[#f59e0b] text-[#111] flex items-center justify-center font-black text-sm shrink-0">
                              {log.clientName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                {log.clientName}
                                {isSessionLive && (
                                  <span className="flex h-1.5 w-1.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ade80]"></span>
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-1 md:py-4 px-0 md:px-6 text-sm text-gray-300 flex justify-between items-center md:table-cell">
                          <span className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold bg-[#222] px-2.5 py-1 rounded-lg w-max border border-[#333]">
                            {log.platform === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-[#ffc105]" /> : 
                             log.platform === 'Tablet' ? <Tablet className="w-3.5 h-3.5 text-[#a78bfa]" /> : 
                             <Monitor className="w-3.5 h-3.5 text-[#60a5fa]" />}
                            {log.platform}
                          </span>
                        </td>
                        <td className="py-1 md:py-4 px-0 md:px-6 text-sm text-gray-300 font-medium flex justify-between items-center md:table-cell">
                          <span className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider">Date</span>
                          <span>{log.date}</span>
                        </td>
                        <td className="py-1 md:py-4 px-0 md:px-6 text-sm text-gray-400 font-semibold flex justify-between items-center md:table-cell">
                          <span className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider">Start Time</span>
                          <span>{startLocal}</span>
                        </td>
                        <td className="py-1 md:py-4 px-0 md:px-6 text-sm text-gray-400 font-semibold flex justify-between items-center md:table-cell">
                          <span className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider">End Time</span>
                          <span>{isSessionLive ? <span className="text-[#4ade80] font-black">Live</span> : endLocal}</span>
                        </td>
                        <td className="py-1 md:py-4 px-0 md:px-6 text-sm flex justify-between items-center md:table-cell">
                          <span className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</span>
                          <span className="font-bold text-white bg-[#ffc105]/10 text-[#ffc105] px-2 py-0.5 rounded-md text-xs">
                            {log.durationMinutes} mins
                          </span>
                        </td>
                        <td className="py-2 md:py-4 px-0 md:px-6 flex justify-end items-center md:table-cell">
                          <button 
                            onClick={() => toggleExpand(log.id)}
                            className="p-2 bg-[#222] hover:bg-[#333] border border-[#333] hover:border-[#444] rounded-lg text-gray-400 hover:text-white transition-all inline-flex items-center gap-1 text-xs font-bold w-full md:w-auto justify-center"
                          >
                            {isExpanded ? 'Hide Path' : 'View Path'}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable path row */}
                      {isExpanded && (
                        <tr className="block md:table-row animate-in slide-in-from-top-2 duration-300">
                          <td colSpan={7} className="bg-[#1a1a1a]/40 px-6 md:px-8 py-5 border-b border-[#222] block md:table-cell">
                            <div className="relative pl-6 border-l border-[#333] space-y-4">
                              <p className="text-xs font-black uppercase tracking-wider text-[#ffc105] mb-3">Navigation Timeline</p>
                              {log.pagesVisited && log.pagesVisited.length > 0 ? (
                                log.pagesVisited.map((page, index) => {
                                  const cleanPage = page.replace('/client/', '').replace('/', '');
                                  const label = cleanPage === 'client' || cleanPage === '' ? 'dashboard' : cleanPage;
                                  return (
                                    <div key={index} className="relative flex items-center gap-3">
                                      {/* Node */}
                                      <div className="absolute -left-[30px] w-2 h-2 rounded-full bg-[#ffc105] border-4 border-[#161616]" style={{ transform: 'translateX(-2px)' }} />
                                      <div>
                                        <p className="text-xs text-white font-bold capitalize">{label}</p>
                                        <p className="text-[10px] text-gray-500 font-semibold font-mono">{page}</p>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-gray-500 italic">No page navigation history recorded.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
