const mongoose = require('mongoose');

const layananSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  kategori: { type: String, required: true }
});

module.exports = mongoose.model('Layanan', layananSchema);