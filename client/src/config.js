// Konfigurasi API Backend
// Di mode development memakai localhost:5000/api, di production otomatis memakai '/api' (atau VITE_API_URL jika di-set)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Nomor WhatsApp Admin untuk Checkout
export const WHATSAPP_NUMBER = '6285895783342';

// Password Default Admin
export const ADMIN_DEFAULT_PASSWORD = 'admin123';

// Data Layanan Default (digunakan sebagai fallback jika backend/database belum berjalan)
export const DEFAULT_SERVICES = [
  // Push Divisi
  { _id: 'def-1', nama: 'Divisi 10 → Divisi 6', harga: 10000, kategori: 'Push Divisi' },
  { _id: 'def-2', nama: 'Divisi 6 → Divisi 3', harga: 20000, kategori: 'Push Divisi' },
  { _id: 'def-3', nama: 'Divisi 3 → Divisi 2', harga: 40000, kategori: 'Push Divisi' },
  { _id: 'def-4', nama: 'Divisi 2 → Divisi 1', harga: 80000, kategori: 'Push Divisi' },

  // Bundling Hemat
  { _id: 'def-5', nama: 'Divisi 3 → Divisi 1', harga: 100000, kategori: 'Bundling Hemat' },
  { _id: 'def-6', nama: 'Divisi 5 → Divisi 1', harga: 140000, kategori: 'Bundling Hemat' },

  // Paket Event
  { _id: 'def-7', nama: 'Clear 1 Event Mingguan', harga: 15000, kategori: 'Paket Event' },
  { _id: 'def-8', nama: 'Borongan Semua Event', harga: 35000, kategori: 'Paket Event' }
];
