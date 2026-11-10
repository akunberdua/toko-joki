const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Layanan = require('./models/layanan.js');
const Pesanan = require('./models/pesanan.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Berhasil terhubung ke MongoDB!'))
.catch((err) => console.error('❌ Gagal terhubung ke MongoDB:', err));

// --- API ROUTES ---

// 1. Ambil Semua Layanan (dengan Seed Data dari Gambar)
app.get('/api/layanan', async (req, res) => {
  try {
    const list = await Layanan.find();
    
    // Jika database masih kosong, masukkan seluruh data sesuai brosur
    if (list.length === 0) {
      const defaultLayanan = [
        // Push Divisi
        { nama: 'Divisi 10 → Divisi 6', harga: 10000, kategori: 'Push Divisi' },
        { nama: 'Divisi 6 → Divisi 3', harga: 20000, kategori: 'Push Divisi' },
        { nama: 'Divisi 3 → Divisi 2', harga: 40000, kategori: 'Push Divisi' },
        { nama: 'Divisi 2 → Divisi 1', harga: 80000, kategori: 'Push Divisi' },
        
        // Bundling Hemat
        { nama: 'Divisi 3 → Divisi 1', harga: 100000, kategori: 'Bundling Hemat' },
        { nama: 'Divisi 5 → Divisi 1', harga: 140000, kategori: 'Bundling Hemat' },
        
        // Paket Event
        { nama: 'Clear 1 Event Mingguan', harga: 15000, kategori: 'Paket Event' },
        { nama: 'Borongan Semua Event', harga: 35000, kategori: 'Paket Event' }
      ];
      await Layanan.insertMany(defaultLayanan);
      return res.json(await Layanan.find());
    }
    
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Buat Pesanan Baru
app.post('/api/pesanan', async (req, res) => {
  try {
    const pesananBaru = new Pesanan(req.body);
    await pesananBaru.save();
    res.json({ message: 'Pesanan berhasil disimpan ke database!', data: pesananBaru });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Ambil Semua Pesanan (Untuk Panel Admin)
app.get('/api/pesanan', async (req, res) => {
  try {
    const list = await Pesanan.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Update Status Pesanan (Verifikasi / Tolak / Selesai)
app.patch('/api/pesanan/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Pesanan.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: 'Status berhasil diperbarui!', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Tambah Layanan Baru (Kelola Harga)
app.post('/api/layanan', async (req, res) => {
  try {
    const layananBaru = new Layanan(req.body);
    await layananBaru.save();
    res.json({ message: 'Layanan berhasil ditambahkan!', data: layananBaru });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Hapus Layanan (Kelola Harga)
app.delete('/api/layanan/:id', async (req, res) => {
  try {
    await Layanan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Layanan berhasil dihapus!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Di bagian akhir file server.js Anda, tambahkan/pastikan ada kode ini:
module.exports = app;