# Frontend Client - Elite Boosting (Toko Joki)

Aplikasi frontend berbasis **React 19 + Vite** untuk layanan joki game **Elite Boosting**.

## 🚀 Cara Menjalankan

1. Masuk ke folder client:
   ```bash
   cd kik/toko-joki/client
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

3. Build untuk produksi:
   ```bash
   npm run build
   ```

4. Cek linting:
   ```bash
   npm run lint
   ```

## 🌟 Fitur Utama

- **Halaman Pemesanan Pelanggan (`/`)**:
  - Pilihan paket layanan joki (Push Divisi, Bundling Hemat, Paket Event) secara dinamis.
  - Tetap berfungsi lancar (Fallback Offline Catalog) meskipun backend belum menyala.
  - Pilihan metode bayar (Transfer Bank, E-Wallet, QRIS).
  - Form input nama pembeli, akun game, dan catatan khusus.
  - Checkout otomatis ke WhatsApp Admin (`6285895783342`) dengan pesan terformat rapi.
  - Sinkronisasi pesanan ke backend API MongoDB secara otomatis.

- **Panel Administrator (`/admin`)**:
  - Keamanan login sandi (Default: `admin123`, tersimpan di sesi browser).
  - Kartu ringkasan statistik (Total pesanan, antrean menunggu, pesanan diproses, estimasi omset).
  - Daftar tabel pesanan masuk dengan pencarian dan filter status.
  - Pengubahan status pesanan (Menunggu, Verifikasi, Diproses, Selesai, Tolak).
  - Kelola paket & harga layanan (Tambah layanan baru, hapus, muat paket bawaan).

- **Navigasi Global & Status Server**:
  - Header navigasi cepat antara Halaman Pelanggan dan Panel Admin.
  - Indikator status koneksi server backend real-time.
