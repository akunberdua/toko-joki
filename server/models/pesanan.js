const mongoose = require('mongoose');

const pesananSchema = new mongoose.Schema({
  idUser: { type: String, required: true },
  namaUser: { type: String, required: true },
  layanan: { type: String, required: true },
  metode: { type: String, required: true },
  total: { type: String, required: true },
  status: { type: String, default: 'Menunggu' }, // Menunggu, Diproses, Selesai, Ditolak
  tanggal: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pesanan', pesananSchema);