import express from 'express';
import path from 'path';

interface Role {
  id: string;
  name: string;
  description: string;
  assignedTo: string | null;
  assignedEmail: string | null;
  assignedAt: string | null;
}

// Initial Data
let roles: Role[] = [
  { id: '1', name: 'Hakim Ketua', description: 'Memimpin pemeriksaan di sidang pengadilan, menjaga ketertiban, dan menjamin kebebasan terdakwa/saksi.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '2', name: 'Hakim Anggota 1', description: 'Bersama majelis hakim, menerima, memeriksa, dan memutus perkara secara objektif.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '3', name: 'Hakim Anggota 2', description: 'Bersama majelis hakim, menerima, memeriksa, dan memutus perkara secara objektif.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '4', name: 'Panitera Pengganti', description: 'Mencatat secara cermat dan rinci seluruh keterangan dalam berita acara sidang.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '5', name: 'Jaksa Penuntut Umum 1', description: 'Melakukan penuntutan dan membuktikan dakwaan kejahatan individual serta korporasi.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '6', name: 'Jaksa Penuntut Umum 2', description: 'Melakukan penuntutan dan membuktikan dakwaan kejahatan individual serta korporasi.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '7', name: 'Terdakwa (Leonardo)', description: 'Pelaku eksploitasi sekaligus perwakilan pengurus Korporasi PT Cahaya Bina Insani.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '8', name: 'Penasihat Hukum 1', description: 'Memberikan jasa hukum dan mendampingi Terdakwa dalam menghadapi dakwaan berat.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '9', name: 'Penasihat Hukum 2', description: 'Memberikan jasa hukum dan mendampingi Terdakwa dalam menghadapi dakwaan berat.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '10', name: 'Saksi Korban 1', description: 'Mengalami penderitaan fisik/mental, menjelaskan bentuk eksploitasi (jam kerja, upah, dokumen).', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '11', name: 'Saksi Korban 2', description: 'Mengalami penderitaan fisik/mental, menjelaskan bentuk eksploitasi (jam kerja, upah, dokumen).', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '12', name: 'Saksi Fakta (Staf Keuangan)', description: 'Membuktikan aliran keuntungan tindak pidana untuk aset dan pengembangan korporasi.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '13', name: 'Ahli Hukum Pidana Korporasi', description: 'Memberikan keterangan mengenai doktrin pertanggungjawaban mutlak korporasi.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '14', name: 'Ahli TPPO', description: 'Menganalisis unsur perekrutan, pengangkutan, penipuan, dan penjeratan utang.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '15', name: 'Ahli Psikologi Forensik', description: 'Menjelaskan kondisi psikologis korban yang berada dalam jeratan trauma dan keberdayaan.', assignedTo: null, assignedEmail: null, assignedAt: null },
  { id: '16', name: 'Ahli Bahasa Asing/Penerjemah', description: 'Membedah forensik isi kontrak berbahasa asing untuk membuktikan tipu daya pelaku.', assignedTo: null, assignedEmail: null, assignedAt: null },
];

const app = express();
app.use(express.json());

// API Routes
app.get('/api/roles/status', (req, res) => {
  res.json({
    total: roles.length,
    assigned: roles.filter(r => r.assignedTo).length,
    available: roles.filter(r => !r.assignedTo).length,
    assignments: roles.map((r, index) => ({
      no: index + 1,
      name: r.assignedTo || '-',
      email: r.assignedEmail || '-',
      role: r.name,
      time: r.assignedAt || '-',
      status: r.assignedTo ? 'Terisi' : 'Tersedia'
    }))
  });
});

app.post('/api/assign', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nama dan Email harus diisi' });

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  
  // Check if email already assigned
  const existing = roles.find(r => r.assignedEmail?.toLowerCase() === cleanEmail);
  if (existing) {
    return res.json({ 
      type: 'existing', 
      message: `Halo ${existing.assignedTo}, email **${cleanEmail}** sudah terdaftar dengan peran: **${existing.name}**. ${existing.description}` 
    });
  }

  // Assign new role
  const available = roles.filter(r => !r.assignedTo);
  if (available.length === 0) {
    return res.json({ 
      type: 'full', 
      message: `Mohon maaf ${cleanName}, semua peran sudah terisi.` 
    });
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  const selectedRole = available[randomIndex];
  
  selectedRole.assignedTo = cleanName;
  selectedRole.assignedEmail = cleanEmail;
  selectedRole.assignedAt = new Date().toLocaleString('id-ID');

  res.json({ 
    type: 'new', 
    message: `Halo ${cleanName}, peran Anda adalah: **${selectedRole.name}**. ${selectedRole.description}` 
  });
});

app.post('/api/admin/roles', (req, res) => {
  const { action, payload } = req.body;
  console.log(`Admin action: ${action}`, payload);
  
  if (action === 'add') {
    const { name, description } = payload;
    roles.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      assignedTo: null,
      assignedEmail: null,
      assignedAt: null
    });
  } else if (action === 'delete') {
    const { name } = payload;
    roles = roles.filter(r => r.name !== name);
  } else if (action === 'reset') {
    roles.forEach(r => {
      r.assignedTo = null;
      r.assignedEmail = null;
      r.assignedAt = null;
    });
    console.log('Roles reset successfully in-place');
  }

  res.json({ success: true });
});

async function startServer() {
  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
