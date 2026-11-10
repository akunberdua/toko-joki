import React, { useState, useEffect } from 'react';

export default function UserPage() {
  const [layanan, setLayanan] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState('');
  const [metodeBayar, setMetodeBayar] = useState('Transfer Bank');
  const [namaUser, setNamaUser] = useState('');

  // Ganti dengan Nomor WhatsApp Anda (contoh: 6281234567890)
  const nomorWhatsApp = '6283848381283';

  useEffect(() => {
    fetch('http://localhost:5000/api/layanan')
      .then((res) => res.json())
      .then((data) => {
        setLayanan(data);
        if (data.length > 0) setSelectedLayanan(data[0].nama);
      })
      .catch((err) => console.error('Gagal memuat layanan:', err));
  }, []);

  const handlePesan = (e) => {
    e.preventDefault();
    if (!selectedLayanan || !namaUser) {
      alert('Mohon pilih layanan dan isi nama user!');
      return;
    }

    const itemDipilih = layanan.find((l) => l.nama === selectedLayanan);
    const hargaTotal = itemDipilih ? `Rp ${itemDipilih.harga.toLocaleString()}` : 'Rp 0';
    const idUnik = 'USER-' + Math.floor(100 + Math.random() * 900);

    const dataPesanan = {
      idUser: idUnik,
      namaUser: namaUser,
      layanan: selectedLayanan,
      metode: metodeBayar,
      total: hargaTotal,
      status: 'Menunggu'
    };

    // Simpan ke database MongoDB via Backend
    fetch('http://localhost:5000/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataPesanan)
    })
      .then((res) => res.json())
      .then(() => {
        const pesanWap = `Halo Admin Elite Boosting, saya ingin memesan layanan joki:\n\n` +
          `🆔 ID User: ${idUnik}\n` +
          `👤 Nama User: ${namaUser}\n` +
          `🎮 Layanan: ${selectedLayanan}\n` +
          `💳 Metode Pembayaran: ${metodeBayar}\n` +
          `💰 Total: ${hargaTotal}\n\n` +
          `Mohon segera diproses ya kak. Terima kasih!`;

        const urlWhatsApp = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(pesanWap)}`;
        window.open(urlWhatsApp, '_blank');
        setNamaUser('');
      })
      .catch((err) => {
        console.error('Gagal menyimpan pesanan:', err);
        alert('Terjadi kesalahan saat memproses pesanan.');
      });
  };

  const renderKategoriBlock = (title, categoryName, color = '#10b981') => {
    const filtered = layanan.filter((item) => item.kategori === categoryName);
    if (filtered.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', color: color, fontWeight: 'bold' }}>{title}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
          {filtered.map((item) => (
            <div 
              key={item._id}
              onClick={() => setSelectedLayanan(item.nama)}
              style={{ 
                background: selectedLayanan === item.nama ? '#0b0f19' : '#1a2234', 
                border: selectedLayanan === item.nama ? '2px solid #10b981' : '1px solid #2a3447',
                padding: '12px 15px', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '4px' }}>{item.nama}</div>
              <div style={{ fontWeight: 'bold', color: '#10b981' }}>Rp {item.harga.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: '#131b2e', padding: '30px', borderRadius: '12px', border: '1px solid #1f293d', color: '#fff' }}>
      <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>[ELITE BOOSTING]</span>
      <h2 style={{ margin: '10px 0 5px 0' }}>Proses Pembelian</h2>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '25px' }}>Pilih kriteria divisi yang ingin dijoki dan isi data pembelian.</p>

      <form onSubmit={handlePesan}>
        {renderKategoriBlock('🏆 PUSH DIVISI (harga per divisi)', 'Push Divisi', '#10b981')}
        {renderKategoriBlock('⚡ BUNDLING HEMAT!', 'Bundling Hemat', '#f59e0b')}
        {renderKategoriBlock('⚽ PAKET EVENT', 'Paket Event', '#3b82f6')}

        <label style={{ fontSize: '14px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Metode Pembelian</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['Transfer Bank', 'E-Wallet', 'QRIS'].map((metode) => (
            <button
              type="button"
              key={metode}
              onClick={() => setMetodeBayar(metode)}
              style={{
                flex: 1, padding: '10px', background: metodeBayar === metode ? '#131b2e' : '#0b0f19',
                border: metodeBayar === metode ? '1px solid #10b981' : '1px solid #2a3447',
                color: '#fff', borderRadius: '6px', cursor: 'pointer'
              }}
            >
              {metode}
            </button>
          ))}
        </div>

        <label style={{ fontSize: '14px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Nama User</label>
        <input 
          type="text" 
          placeholder="Masukkan nama user" 
          value={namaUser}
          onChange={(e) => setNamaUser(e.target.value)}
          style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #2a3447', borderRadius: '6px', color: '#fff', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        <div style={{ background: '#0b0f19', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Layanan</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedLayanan || '-'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Total</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
              {selectedLayanan ? `Rp ${layanan.find(l => l.nama === selectedLayanan)?.harga.toLocaleString()}` : 'Rp 0'}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          style={{ width: '100%', background: '#10b981', color: '#000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          Lanjutkan Pembayaran via WhatsApp
        </button>
      </form>
    </div>
  );
}