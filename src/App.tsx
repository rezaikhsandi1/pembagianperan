import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldCheck, Database, LayoutDashboard, Send, Trash2, RotateCcw, PlusCircle } from 'lucide-react';

interface Assignment {
  no: number;
  name: string;
  email: string;
  role: string;
  time: string;
  status: string;
}

interface Status {
  total: number;
  assigned: number;
  available: number;
  assignments: Assignment[];
}

export default function App() {
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/roles/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll for updates in admin mode
    if (mode === 'admin') {
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (name.toLowerCase().trim() === '/admin') {
      setMode('admin');
      setName('');
      setResponse(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setResponse(data.message);
      fetchStatus();
    } catch (err) {
      setResponse('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (action: string, payload?: any) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (res.ok) {
        fetchStatus();
        if (action === 'add') {
          setNewRole({ name: '', description: '' });
          setMessage({ text: 'Peran baru berhasil ditambahkan.', type: 'success' });
        }
        if (action === 'reset') {
          setMessage({ text: 'Semua data pengisi telah direset.', type: 'success' });
        }
        if (action === 'delete') {
          setMessage({ text: 'Peran berhasil dihapus.', type: 'success' });
        }
      }
    } catch (err) {
      console.error('Admin action failed', err);
      setMessage({ text: 'Terjadi kesalahan pada aksi admin.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Pembagian Peran</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Simulasi Sidang Perkara Pidana</p>
            </div>
          </div>
          {mode === 'admin' && (
            <button 
              onClick={() => setMode('user')}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              Keluar Admin
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {mode === 'user' ? (
            <motion.div 
              key="user-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Selamat Datang</h2>
                <p className="text-slate-500 mb-6">Silakan masukkan nama Anda untuk menerima peran dalam simulasi sidang perkara pidana.</p>
                
                {/* Stats Display */}
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-blue-700">{status?.assigned || 0}/{status?.total || 16} Peran Terisi</span>
                  </div>
                  <div className="bg-slate-100 px-4 py-2 rounded-xl">
                    <span className="text-sm font-bold text-slate-600">{status?.available || 0} Tersedia</span>
                  </div>
                </div>
              </div>

              {!response ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full h-16 bg-white border-2 border-slate-200 rounded-2xl px-6 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all shadow-sm italic"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Alamat Email"
                      className="w-full h-16 bg-white border-2 border-slate-200 rounded-2xl px-6 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all shadow-sm italic"
                      required
                    />
                  </div>
                  <button 
                    disabled={loading || !name.trim() || !email.trim()}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Klaim Peran Saya
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-t-4 border-t-blue-600"
                >
                  <div className="mb-6 flex justify-between items-start">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <button 
                      onClick={() => setResponse(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl leading-relaxed text-slate-700">
                      {response.split('**').map((part, i) => 
                        i % 2 === 1 ? <span key={i} className="font-black text-blue-700 underline decoration-blue-200 underline-offset-4">{part}</span> : part
                      )}
                    </p>
                  </div>
                </motion.div>
              )}

              <footer className="mt-20 text-center text-slate-400 text-sm">
                <p>&copy; 2026 Trial Role Manager. Satu Orang, Satu Peran.</p>
              </footer>
            </motion.div>
          ) : (
            <motion.div 
              key="admin-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* Admin Notification */}
              <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-20 right-6 z-[60] px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 ${
                      message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Peran</span>
                  </div>
                  <p className="text-3xl font-black">{status?.total || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-green-500 mb-2">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tersedia</span>
                  </div>
                  <p className="text-3xl font-black">{status?.available || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Terisi</span>
                  </div>
                  <p className="text-3xl font-black">{status?.assigned || 0}</p>
                </div>
                <div className="bg-white border-2 border-dashed border-slate-200 p-4 rounded-2xl flex flex-col justify-center items-center gap-2">
                   <button 
                    onClick={() => handleAdminAction('reset')}
                    className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data Pengisi
                  </button>
                </div>
              </div>

              {/* Add New Role */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-blue-400" />
                    Tambah Peran Baru
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input 
                      placeholder="Nama Peran"
                      value={newRole.name}
                      onChange={e => setNewRole({...newRole, name: e.target.value})}
                      className="bg-slate-800 border-none rounded-xl px-4 py-3 placeholder-slate-500 flex-1 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      placeholder="Deskripsi Singkat"
                      value={newRole.description}
                      onChange={e => setNewRole({...newRole, description: e.target.value})}
                      className="bg-slate-800 border-none rounded-xl px-4 py-3 placeholder-slate-500 flex-[2] outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={() => {
                        if(newRole.name && newRole.description) handleAdminAction('add', newRole);
                      }}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all text-sm whitespace-nowrap"
                    >
                      Simpan Peran
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 blur-[120px] opacity-20 -mr-32 -mt-32"></div>
              </div>

              {/* Status Report Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-lg">Laporan Status Database</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4 w-16">No</th>
                        <th className="px-6 py-4">Nama Pengisi</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Peran yang Didapat</th>
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {status?.assignments.map((row) => (
                        <tr key={row.no} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.no}</td>
                          <td className="px-6 py-4 font-semibold">{row.name}</td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">{row.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase tracking-tight">
                              {row.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">{row.time}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${row.status === 'Tersedia' ? 'text-green-500 bg-green-50' : 'text-blue-500 bg-blue-50'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleAdminAction('delete', { name: row.role })}
                              className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
