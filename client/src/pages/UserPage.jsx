import React, { useState, useEffect } from 'react';
import { API_BASE_URL, WHATSAPP_NUMBER, DEFAULT_SERVICES, EWALLET_CONFIG } from '../config';
import qrisImg from '../assets/qris.jpg';
import qrisLogo from '../assets/qris-logo.png';
import danaLogo from '../assets/dana.jpg';
import gopayLogo from '../assets/gopay.jpg';
import shopeepayLogo from '../assets/shopeepay.png';

const EWALLET_LOGOS = {
  DANA: danaLogo,
  ShopeePay: shopeepayLogo,
  GoPay: gopayLogo
};

export default function UserPage() {
  const [layanan, setLayanan] = useState(DEFAULT_SERVICES);
  const [selectedLayanan, setSelectedLayanan] = useState(DEFAULT_SERVICES[0]?.nama || '');
  
  // Metode pembayaran: 'QRIS' atau 'E-Wallet' (Pembayaran bank dihilangkan)
  const [metodeKategori, setMetodeKategori] = useState('QRIS');
  const [selectedEwallet, setSelectedEwallet] = useState('DANA'); // 'DANA' | 'ShopeePay' | 'GoPay'

  const [namaUser, setNamaUser] = useState('');
  const [idGame, setIdGame] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNotice, setOrderNotice] = useState(null);

  // Modal untuk scan QRIS / Konfirmasi Pembayaran ("halaman pada gambar")
  const [modalData, setModalData] = useState(null); // { id, url, total, metode, isQris, ewalletType }
  const [copyFeedback, setCopyFeedback] = useState('');

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

  // Nilai teks metode bayar yang disimpan ke database & WA
  const namaMetodeBayar = metodeKategori === 'QRIS' ? 'QRIS' : `E-Wallet (${selectedEwallet})`;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(''), 2500);
  };

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
      metode: namaMetodeBayar,
      total: hargaFormatted,
      status: 'Menunggu'
    };

    // Susun pesan WhatsApp yang rapi sesuai metode pembayaran
    let pesanWap =
      `Halo Admin Elite Boosting, saya ingin memesan jasa joki:\n\n` +
      `🆔 No. Pesanan: ${idUnik}\n` +
      `👤 Nama Pelanggan: ${namaUser.trim()}\n` +
      (idGame.trim() ? `🎮 ID/Nickname Game: ${idGame.trim()}\n` : '') +
      `📦 Paket Layanan: ${selectedLayanan}\n` +
      `💳 Metode Bayar: ${namaMetodeBayar}\n` +
      `💰 Total Tagihan: ${hargaFormatted}\n` +
      (catatan.trim() ? `📝 Catatan: ${catatan.trim()}\n` : '');

    if (metodeKategori === 'QRIS') {
      pesanWap += `\nSaya melakukan pembayaran via scan QRIS Elite Boosting sebesar ${hargaFormatted}. Berikut saya kirimkan foto/screenshot bukti transfernya ya min. Mohon segera diproses!`;
    } else {
      pesanWap += `\nSaya melakukan pembayaran via ${selectedEwallet} ke nomor ${EWALLET_CONFIG.number} sebesar ${hargaFormatted}. Berikut saya kirimkan bukti transfernya ya min. Mohon segera diproses!`;
    }

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

      // PENTING: JANGAN langsung buka WhatsApp!
      // Tampilkan terlebih dahulu halaman pembayaran pada gambar (QRIS / E-Wallet) agar user bisa scan & bayar.
      // User baru akan diarahkan ke WhatsApp saat mengklik tombol "Lanjut ke WhatsApp" di halaman tersebut.
      const orderInfo = {
        id: idUnik,
        url: urlWhatsApp,
        total: hargaFormatted,
        metode: namaMetodeBayar,
        isQris: metodeKategori === 'QRIS',
        ewalletType: selectedEwallet
      };

      setOrderNotice(orderInfo);
      setModalData(orderInfo);

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
      {/* Banner Notifikasi Pesanan Terakhir */}
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
              ✅ Pesanan {orderNotice.id} Siap Dibayar! ({orderNotice.total})
            </span>
            <button
              onClick={() => setOrderNotice(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
            {orderNotice.isQris
              ? 'Silakan scan foto QRIS untuk pembayaran, lalu setelah selesai klik tombol Lanjut ke WhatsApp untuk mengirimkan bukti transfer.'
              : `Silakan transfer via ${orderNotice.metode} ke nomor ${EWALLET_CONFIG.number}, lalu kirimkan bukti transfer ke WhatsApp.`}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setModalData(orderNotice)}
              style={{
                background: '#10b981',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {orderNotice.isQris ? '📸 Buka Halaman QRIS & Bayar' : '👛 Buka Info E-Wallet'}
            </button>
            <a
              href={orderNotice.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#162033',
                color: '#38bdf8',
                border: '1px solid #1e2638',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              📲 Langsung ke WhatsApp
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
              Pilih paket yang diinginkan, tentukan metode e-wallet / QRIS, lalu isi data pemesan.
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

          {/* Metode Pembayaran (Bank dihapus, hanya QRIS & E-Wallet dengan Logo Resmi) */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                💳 Pilih Metode Pembayaran
              </label>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                ⚡ Scan QRIS & E-Wallet Tersedia
              </span>
            </div>

            {/* Tombol Kategori Utama: QRIS vs E-Wallet dengan Logo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {/* Pilihan QRIS */}
              <button
                type="button"
                onClick={() => setMetodeKategori('QRIS')}
                style={{
                  padding: '12px 14px',
                  background: metodeKategori === 'QRIS' ? 'rgba(16, 185, 129, 0.12)' : '#07090e',
                  border: metodeKategori === 'QRIS' ? '2px solid #10b981' : '1px solid #1e2638',
                  color: metodeKategori === 'QRIS' ? '#10b981' : '#cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}>
                  <img
                    src={qrisLogo}
                    alt="Logo QRIS"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ color: metodeKategori === 'QRIS' ? '#fff' : '#e2e8f0', fontWeight: 700 }}>
                    QRIS (Rekomendasi)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Scan Semua E-Wallet & Bank
                  </div>
                </div>
              </button>

              {/* Pilihan E-Wallet */}
              <button
                type="button"
                onClick={() => setMetodeKategori('E-Wallet')}
                style={{
                  padding: '12px 14px',
                  background: metodeKategori === 'E-Wallet' ? 'rgba(56, 189, 248, 0.12)' : '#07090e',
                  border: metodeKategori === 'E-Wallet' ? '2px solid #38bdf8' : '1px solid #1e2638',
                  color: metodeKategori === 'E-Wallet' ? '#38bdf8' : '#cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0
                }}>
                  <img
                    src={danaLogo}
                    alt="DANA"
                    style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <img
                    src={shopeepayLogo}
                    alt="ShopeePay"
                    style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'contain', background: '#fff' }}
                  />
                  <img
                    src={gopayLogo}
                    alt="GoPay"
                    style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ color: metodeKategori === 'E-Wallet' ? '#fff' : '#e2e8f0', fontWeight: 700 }}>
                    E-Wallet
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    DANA, ShopeePay, GoPay
                  </div>
                </div>
              </button>
            </div>

            {/* Panel Khusus QRIS dengan LOGO QRIS */}
            {metodeKategori === 'QRIS' && (
              <div style={{
                background: '#07090e',
                border: '1px solid #1e2638',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #38bdf8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  flexShrink: 0
                }}>
                  <img
                    src={qrisLogo}
                    alt="Logo QRIS"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>
                    QRIS (ELITE BOOSTING - GAME)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    NMID: ID1026637981352 • Satu QRIS untuk Semua
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                    ✔ Mendukung DANA, GoPay, OVO, ShopeePay & M-Banking
                  </div>
                </div>
              </div>
            )}

            {/* Panel Khusus E-Wallet dengan LOGO DANA, SHOPEEPAY, GOPAY */}
            {metodeKategori === 'E-Wallet' && (
              <div style={{
                background: '#07090e',
                border: '1px solid #1e2638',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
                  Pilih Layanan E-Wallet:
                </div>
                {/* Pilihan DANA, ShopeePay, GoPay dengan LOGO ASLI */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {EWALLET_CONFIG.options.map((ew) => {
                    const isSelected = selectedEwallet === ew.id;
                    const logoSrc = EWALLET_LOGOS[ew.id];
                    return (
                      <button
                        type="button"
                        key={ew.id}
                        onClick={() => setSelectedEwallet(ew.id)}
                        style={{
                          padding: '10px 8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0e1424',
                          border: isSelected ? `2px solid ${ew.color}` : '1px solid #1e2638',
                          borderRadius: '8px',
                          color: isSelected ? '#fff' : '#cbd5e1',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img
                          src={logoSrc}
                          alt={ew.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            objectFit: 'contain',
                            background: ew.id === 'ShopeePay' ? '#fff' : 'transparent'
                          }}
                        />
                        <span>{ew.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Data Pelanggan */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              👤 Nama Pengguna <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nama Pengguna"
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
                placeholder="ID / Nama Akun"
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
                placeholder="Catatan tambahan untuk joki"
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
              <span style={{ fontSize: '13.5px', color: '#cbd5e1', fontWeight: 600 }}>
                {namaMetodeBayar}
              </span>
            </div>
            <div style={{ height: '1px', background: '#1e2638', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Total Biaya</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{hargaFormatted}</span>
            </div>
          </div>

          {/* Tombol Aksi: Masuk ke halaman pembayaran terlebih dahulu */}
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
              <span>⏳ Menyiapkan Halaman Pembayaran...</span>
            ) : metodeKategori === 'QRIS' ? (
              <span>💳 Lanjutkan ke Pembayaran QRIS ➔</span>
            ) : (
              <span>💳 Lanjutkan ke Pembayaran ({selectedEwallet}) ➔</span>
            )}
          </button>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
            ℹ️ Anda akan melihat barcode QRIS / info pembayaran terlebih dahulu untuk di-scan, sebelum lanjut ke WhatsApp.
          </div>
        </form>
      </div>

      {/* HALAMAN / MODAL PEMBAYARAN PADA GAMBAR (SCAN QRIS & TOMBOL LANJUT KE WA) */}
      {modalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '12px'
        }}>
          <div style={{
            background: '#0e1424',
            border: '1px solid #1e2638',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '20px 18px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            color: '#f1f5f9',
            textAlign: 'center'
          }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                Pesanan: {modalData.id}
              </span>
              <button
                onClick={() => setModalData(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '22px',
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '4px 0 2px 0' }}>
              {modalData.isQris ? (
                <img src={qrisLogo} alt="QRIS" style={{ height: '22px', background: '#fff', borderRadius: '4px', padding: '2px 6px' }} />
              ) : (
                <img
                  src={EWALLET_LOGOS[modalData.ewalletType || selectedEwallet]}
                  alt="E-Wallet"
                  style={{
                    height: '24px',
                    width: '24px',
                    borderRadius: '4px',
                    background: (modalData.ewalletType || selectedEwallet) === 'ShopeePay' ? '#fff' : 'transparent',
                    objectFit: 'contain'
                  }}
                />
              )}
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: '#fff' }}>
                {modalData.isQris ? 'Scan Barcode QRIS' : `Bayar via ${modalData.metode}`}
              </h2>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 12px 0' }}>
              {modalData.isQris
                ? 'Scan QRIS di bawah ini dengan E-Wallet atau M-Banking Anda terlebih dahulu, lalu klik tombol hijau untuk mengirim bukti ke WhatsApp.'
                : 'Transfer sesuai nominal tagihan, lalu klik tombol hijau di bawah untuk mengirim bukti transfer ke WhatsApp.'}
            </p>

            {/* Total Tagihan */}
            <div style={{
              background: '#07090e',
              border: '1px solid #1e2638',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total Tagihan:</span>
              <span style={{ fontSize: '19px', fontWeight: 800, color: '#10b981' }}>
                {modalData.total}
              </span>
            </div>

            {/* Konten Khusus QRIS */}
            {modalData.isQris ? (
              <div>
                <div style={{
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  margin: '0 auto 10px auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                  <img
                    src={qrisImg}
                    alt="Barcode QRIS Elite Boosting"
                    style={{
                      maxWidth: '230px',
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                {/* Tombol Utama: Lanjut ke WA dan Unduh QRIS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <a
                    href={modalData.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#000',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '14.5px',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 15px rgba(16,185,129,0.35)'
                    }}
                  >
                    <span>📲 Lanjut ke WhatsApp (Kirim Bukti)</span>
                  </a>

                  <a
                    href={qrisImg}
                    download="QRIS-ELITE-BOOSTING.jpg"
                    style={{
                      display: 'block',
                      width: '100%',
                      background: '#162033',
                      border: '1px solid #1e2638',
                      color: '#38bdf8',
                      padding: '9px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    📥 Unduh Foto QRIS (Simpan ke Galeri)
                  </a>
                </div>

                {/* Panduan Ringkas */}
                <div style={{
                  background: '#07090e',
                  border: '1px solid #1e2638',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: '#cbd5e1'
                }}>
                  <strong style={{ color: '#10b981' }}>📌 Langkah Pembayaran:</strong>
                  <ol style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                    <li>Scan foto barcode QRIS di atas dengan <strong>DANA, GoPay, ShopeePay, OVO,</strong> atau M-Banking.</li>
                    <li>Selesaikan pembayaran <strong>{modalData.total}</strong> & simpan screenshot bukti.</li>
                    <li>Klik tombol hijau <strong>"Lanjut ke WhatsApp (Kirim Bukti)"</strong> di atas untuk konfirmasi ke Admin.</li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Konten Khusus E-Wallet (DANA/ShopeePay/GoPay) */
              <div>
                <div style={{
                  background: '#07090e',
                  border: '1px dashed #38bdf8',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '12px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <img
                      src={EWALLET_LOGOS[modalData.ewalletType || selectedEwallet]}
                      alt="Logo E-Wallet"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        objectFit: 'contain',
                        background: (modalData.ewalletType || selectedEwallet) === 'ShopeePay' ? '#fff' : 'transparent',
                        border: '1px solid #1e2638'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Nomor Tujuan {modalData.metode}:</div>
                      <div style={{ fontSize: '19px', fontWeight: 800, color: '#38bdf8' }}>
                        {EWALLET_CONFIG.number}
                      </div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                        Atas Nama: <strong style={{ color: '#fff' }}>{EWALLET_CONFIG.holderName}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(EWALLET_CONFIG.number, 'modal-nomor')}
                    style={{
                      marginTop: '6px',
                      width: '100%',
                      background: copyFeedback === 'modal-nomor' ? '#10b981' : '#162033',
                      color: copyFeedback === 'modal-nomor' ? '#000' : '#38bdf8',
                      border: '1px solid #1e2638',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copyFeedback === 'modal-nomor' ? '✅ Nomor Berhasil Disalin!' : '📋 Salin Nomor E-Wallet'}
                  </button>
                </div>

                {/* Tombol Utama Kirim Bukti WhatsApp */}
                <a
                  href={modalData.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#000',
                    padding: '13px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.35)',
                    marginBottom: '10px'
                  }}
                >
                  📲 Lanjut ke WhatsApp (Kirim Bukti)
                </a>

                <div style={{
                  background: '#07090e',
                  border: '1px solid #1e2638',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: '#cbd5e1'
                }}>
                  <strong style={{ color: '#38bdf8' }}>📌 Langkah Pembayaran:</strong>
                  <ol style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                    <li>Transfer senilai <strong>{modalData.total}</strong> ke nomor di atas.</li>
                    <li>Screenshot bukti transfer berhasil.</li>
                    <li>Klik tombol hijau di atas untuk lanjut ke chat WhatsApp admin.</li>
                  </ol>
                </div>
              </div>
            )}

            <button
              onClick={() => setModalData(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12.5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Tutup Jendela Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
