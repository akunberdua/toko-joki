import React, { useState, useEffect } from 'react';
import { API_BASE_URL, WHATSAPP_NUMBER, DEFAULT_SERVICES } from '../config';

export default function UserPage() {
  const [layanan, setLayanan] = useState(DEFAULT_SERVICES);
  const [selectedLayanan, setSelectedLayanan] = useState(DEFAULT_SERVICES[0]?.nama || '');
  const [metodeBayar, setMetodeBayar] = useState('Transfer Bank');
  const [namaUser, setNamaUser] = useState('');
  const [idGame, setIdGame] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNotice, setOrderNotice] = useState(null);

  // Ambil layanan dari Backend jika tersedia
  useEffect(() => {
    fetch(`${API_BASE_URL}/layanan`)
      .then((res) => {
        if (!res.ok) throw new Error('Status: ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLayanan(data);
          // Pastikan pilihan saat ini masih valid atau set default ke item pertama
          setSelectedLayanan((prev) => {
            if (data.some((item) => item.nama === prev)) return prev;
            return data[0]?.nama || '';
          });
        }
      })
      .catch((err) => {
        console.warn('Backend layanan offline, memakai katalog default:', err.message);
      });
  }, []);

  // Temukan item layanan terpilih
  const itemDipilih = layanan.find((l) => l.nama === selectedLayanan) || layanan[0];
  const hargaNumber = itemDipilih ? Number(itemDipilih.harga) : 0;
  const hargaFormatted = `Rp ${hargaNumber.toLocaleString('id-ID')}`;

  const handlePesan = async (e) => {
    e.preventDefault();

    if (!namaUser.trim()) {
      alert('Mohon masukkan Nama Anda!');
      return;
    }

    if (!selectedLayanan) {
      alert('Mohon pilih paket layanan joki!');
      return;
    }

    setIsSubmitting(true);
    setOrderNotice(null);

    const idUnik = 'USER-' + Math.floor(1000 + Math.random() * 9000);

    const dataPesanan = {
      idUser: idUnik,
      namaUser: namaUser.trim(),
      layanan: selectedLayanan,
      metode: metodeBayar,
      total: hargaFormatted,
      status: 'Menunggu'
    };

    // Susun pesan WhatsApp yang rapi
    const pesanWap =
      `Halo Admin Elite Boosting, saya ingin memesan jasa joki:\n\n` +
      `🆔 No. Pesanan: ${idUnik}\n` +
      `👤 Nama Pelanggan: ${namaUser.trim()}\n` +
      (idGame.trim() ? `🎮 ID/Nickname Game: ${idGame.trim()}\n` : '') +
      `📦 Paket Layanan: ${selectedLayanan}\n` +
      `💳 Metode Bayar: ${metodeBayar}\n` +
      `💰 Total: ${hargaFormatted}\n` +
      (catatan.trim() ? `📝 Catatan: ${catatan.trim()}\n` : '') +
      `\nMohon segera diproses dan dikonfirmasi nomor rekening / barcode pembayarannya ya min. Terima kasih!`;

    const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesanWap)}`;

    // Coba kirim data pesanan ke backend API
    try {
      await fetch(`${API_BASE_URL}/pesanan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPesanan)
      });
    } catch (err) {
      console.warn('Gagal mencatat pesanan ke backend (offline mode):', err);
    } finally {
      setIsSubmitting(false);

      // Buka tab WhatsApp
      const opened = window.open(urlWhatsApp, '_blank');

      // Tampilkan notifikasi konfirmasi di halaman
      setOrderNotice({
        id: idUnik,
        url: urlWhatsApp,
        openedDirectly: !!opened
      });

      // Reset form input
      setNamaUser('');
      setIdGame('');
      setCatatan('');
    }
  };

  // Ambil daftar kategori unik dari data layanan secara dinamis
  const categories = Array.from(new Set(layanan.map((item) => item.kategori || 'Lainnya')));

  const getCategoryMeta = (kategori) => {
    switch (kategori) {
      case 'Push Divisi':
        return { icon: '🏆', color: '#10b981', badge: 'Harga per divisi' };
      case 'Bundling Hemat':
        return { icon: '⚡', color: '#f59e0b', badge: 'Paket Promo Hemat' };
      case 'Paket Event':
        return { icon: '🎯', color: '#3b82f6', badge: 'Event & Misi' };
      default:
        return { icon: '⭐', color: '#a855f7', badge: 'Paket Spesial' };
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Banner Notifikasi Pesanan Berhasil */}
      {orderNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>
              ✅ Pesanan {orderNotice.id} Berhasil Dibuat!
            </span>
            <button
              onClick={() => setOrderNotice(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
            Detail pesanan Anda telah disiapkan untuk WhatsApp admin. Jika tab WhatsApp tidak terbuka otomatis, klik tombol di bawah:
          </p>
          <div>
            <a
              href={orderNotice.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '6px',
                background: '#10b981',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              📲 Buka WhatsApp Sekarang
            </a>
          </div>
        </div>
      )}

      {/* Header Form */}
      <div style={{
        background: '#0e1424',
        padding: '28px 24px',
        borderRadius: '16px',
        border: '1px solid #1e2638',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{
              color: '#10b981',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              [ELITE BOOSTING • PRO SERVICE]
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 4px 0', color: '#fff' }}>
              Proses Pembelian Joki
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
              Pilih kriteria divisi atau paket yang diinginkan, lalu isi data pemesan.
            </p>
          </div>
        </div>

        <form onSubmit={handlePesan} style={{ marginTop: '24px' }}>
          {/* Loop Kategori Layanan Dinamis */}
          {categories.map((kategori) => {
            const items = layanan.filter((item) => (item.kategori || 'Lainnya') === kategori);
            if (items.length === 0) return null;
            const meta = getCategoryMeta(kategori);

            return (
              <div key={kategori} style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', color: meta.color, fontWeight: 700, letterSpacing: '0.5px' }}>
                    {meta.icon} {kategori.toUpperCase()}
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{meta.badge}</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '10px'
                }}>
                  {items.map((item) => {
                    const isSelected = selectedLayanan === item.nama;
                    return (
                      <div
                        key={item._id || item.nama}
                        onClick={() => setSelectedLayanan(item.nama)}
                        style={{
                          background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#07090e',
                          border: isSelected ? '2px solid #10b981' : '1px solid #1e2638',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 0 12px rgba(16,185,129,0.2)' : 'none'
                        }}
                      >
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: isSelected ? '#fff' : '#e2e8f0', marginBottom: '6px' }}>
                          {item.nama}
                        </div>
                        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>
                          Rp {Number(item.harga).toLocaleString('id-ID')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Metode Pembayaran */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              💳 Metode Pembayaran
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['Transfer Bank', 'E-Wallet', 'QRIS'].map((metode) => {
                const isSelected = metodeBayar === metode;
                return (
                  <button
                    type="button"
                    key={metode}
                    onClick={() => setMetodeBayar(metode)}
                    style={{
                      padding: '12px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : '#07090e',
                      border: isSelected ? '1px solid #10b981' : '1px solid #1e2638',
                      color: isSelected ? '#10b981' : '#cbd5e1',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {metode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Data Pelanggan */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              👤 Nama Pembeli <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nama Pembeli"
              value={namaUser}
              onChange={(e) => setNamaUser(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#07090e',
                border: '1px solid #1e2638',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                🎮 ID / Akun Game (Opsional)
              </label>
              <input
                type="text"
                placeholder="Id akun"
                value={idGame}
                onChange={(e) => setIdGame(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#07090e',
                  border: '1px solid #1e2638',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                📝 Catatan Khusus (Opsional)
              </label>
              <input
                type="text"
                placeholder="Catatan Khusus"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#07090e',
                  border: '1px solid #1e2638',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Ringkasan Biaya */}
          <div style={{
            background: '#07090e',
            border: '1px solid #1e2638',
            padding: '16px 20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Paket Dipilih</span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#f1f5f9' }}>{selectedLayanan || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Metode Bayar</span>
              <span style={{ fontSize: '13.5px', color: '#cbd5e1' }}>{metodeBayar}</span>
            </div>
            <div style={{ height: '1px', background: '#1e2638', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Total Biaya</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{hargaFormatted}</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting ? '#059669' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#000',
              border: 'none',
              padding: '15px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '15px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.1s ease'
            }}
          >
            {isSubmitting ? (
              <span>⏳ Menghubungkan ke WhatsApp...</span>
            ) : (
              <span>💬 Lanjutkan Pembayaran via WhatsApp</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
