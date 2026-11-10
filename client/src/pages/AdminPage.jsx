import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  // State untuk Keamanan Login Admin
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Password Rahasia Admin Anda (bisa diganti sesuai keinginan)
  const ADMIN_PASSWORD = 'admin123'; 

  const [adminSubMenu, setAdminSubMenu] = useState('pesanan');
  const [pesananList, setPesananList] = useState([]);
  const [layanan, setLayanan] = useState([]);

  // Form Tambah Layanan
  const [namaLayananBaru, setNamaLayananBaru] = useState('');
  const [hargaBaru, setHargaBaru] = useState('');
  const [kategoriBaru, setKategoriBaru] = useState('Push Divisi');

  useEffect(() => {
    if (isLoggedIn) {
      fetchPesanan();
      fetchLayanan();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert('Password Admin salah!');
      setPasswordInput('');
    }
  };

  const fetchPesanan = () => {
    fetch('http://localhost:5000/api/pesanan')
      .then((res) => res.json())
      .then((data) => setPesananList(data))
      .catch((err) => console.error('Gagal memuat pesanan:', err));
  };

  const fetchLayanan = () => {
    fetch('http://localhost:5000/api/layanan')
      .then((res) => res.json())
      .then((data) => setLayanan(data))
      .catch((err) => console.error('Gagal memuat layanan:', err));
  };

  const handleUpdateStatus = (id, statusBaru) => {
    fetch(`http://localhost:5000/api/pesanan/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusBaru })
    })
      .then((res) => res.json())
      .then(() => fetchPesanan());
  };

  const handleTambahLayanan = (e) => {
    e.preventDefault();
    if (!namaLayananBaru || !hargaBaru) return;

    fetch('http://localhost:5000/api/layanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama: namaLayananBaru,
        harga: Number(hargaBaru),
        kategori: kategoriBaru
      })
    })
      .then((res) => res.json())
      .then(() => {
        alert('Layanan berhasil ditambahkan!');
        setNamaLayananBaru('');
        setHargaBaru('');
        fetchLayanan();
      });
  };

  const handleHapusLayanan = (id) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    fetch(`http://localhost:5000/api/layanan/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => fetchLayanan());
  };

  // 1. JIKA BELUM LOGIN, TAMPILKAN FORM LOGIN KHUSUS ADMIN
  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', background: '#131b2e', padding: '30px', borderRadius: '12px', border: '1px solid #1f293d', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ color: '#10b981', marginBottom: '10px' }}>🔒 Area Khusus Admin</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>Masukkan password untuk mengakses panel admin Elite Boosting.</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Masukkan Password Admin" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #2a3447', borderRadius: '6px', color: '#fff', marginBottom: '15px', boxSizing: 'border-box' }}
          />
          <button 
            type="submit"
            style={{ width: '100%', background: '#10b981', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Masuk Panel Admin
          </button>
        </form>
        <div style={{ marginTop: '15px' }}>
          <a href="/" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none' }}>← Kembali ke Halaman Pelanggan</a>
        </div>
      </div>
    );
  }

  // 2. JIKA SUDAH LOGIN, TAMPILKAN PANEL ADMIN SEBENARNYA
  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', color: '#fff' }}>
      {/* Sidebar Admin */}
      <div style={{ background: '#131b2e', padding: '20px', borderRadius: '12px', border: '1px solid #1f293d', height: 'fit-content' }}>
        <h3 style={{ color: '#10b981', marginTop: 0 }}>ELITE BOOSTING</h3>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>Panel Admin</p>
        <hr style={{ borderColor: '#1f293d', margin: '15px 0' }} />
        
        <div 
          onClick={() => setAdminSubMenu('pesanan')}
          style={{ padding: '10px', borderRadius: '6px', background: adminSubMenu === 'pesanan' ? '#1f293d' : 'transparent', color: adminSubMenu === 'pesanan' ? '#10b981' : '#fff', cursor: 'pointer', marginBottom: '5px' }}
        >
          📋 Pesanan Masuk
        </div>
        <div 
          onClick={() => setAdminSubMenu('harga')}
          style={{ padding: '10px', borderRadius: '6px', background: adminSubMenu === 'harga' ? '#1f293d' : 'transparent', color: adminSubMenu === 'harga' ? '#10b981' : '#fff', cursor: 'pointer', marginBottom: '15px' }}
        >
          ⚙️ Kelola Harga
        </div>

        <button 
          onClick={() => setIsLoggedIn(false)}
          style={{ width: '100%', background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
        >
          🚪 Keluar Admin
        </button>
      </div>

      {/* Konten Utama Admin */}
      <div style={{ background: '#131b2e', padding: '25px', borderRadius: '12px', border: '1px solid #1f293d' }}>
        {adminSubMenu === 'pesanan' ? (
          <div>
            <h2>Verifikasi & Pesanan Masuk</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a3447', color: '#9ca3af', fontSize: '13px' }}>
                  <th style={{ padding: '10px' }}>ID User</th>
                  <th style={{ padding: '10px' }}>Nama</th>
                  <th style={{ padding: '10px' }}>Layanan</th>
                  <th style={{ padding: '10px' }}>Total</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesananList.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #1f293d', fontSize: '13px' }}>
                    <td style={{ padding: '10px' }}>{p.idUser}</td>
                    <td style={{ padding: '10px' }}>{p.namaUser}</td>
                    <td style={{ padding: '10px' }}>{p.layanan}</td>
                    <td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>{p.total}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        background: p.status === 'Verifikasi' ? '#065f46' : p.status === 'Tolak' ? '#7f1d1d' : '#1e293b', 
                        color: p.status === 'Verifikasi' ? '#34d399' : p.status === 'Tolak' ? '#fca5a5' : '#f59e0b', 
                        padding: '3px 8px', borderRadius: '10px', fontSize: '11px' 
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleUpdateStatus(p._id, 'Verifikasi')}
                        style={{ background: '#10b981', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        Verifikasi
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(p._id, 'Tolak')}
                        style={{ background: '#1f293d', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Tolak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <h2>Kelola Paket & Harga Layanan</h2>
            
            <form onSubmit={handleTambahLayanan} style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
              <select
                value={kategoriBaru}
                onChange={(e) => setKategoriBaru(e.target.value)}
                style={{ padding: '10px', background: '#0b0f19', border: '1px solid #2a3447', borderRadius: '6px', color: '#fff' }}
              >
                <option value="Push Divisi">Push Divisi</option>
                <option value="Bundling Hemat">Bundling Hemat</option>
                <option value="Paket Event">Paket Event</option>
              </select>
              <input 
                type="text" 
                placeholder="Nama Layanan" 
                value={namaLayananBaru}
                onChange={(e) => setNamaLayananBaru(e.target.value)}
                style={{ flex: 2, padding: '10px', background: '#0b0f19', border: '1px solid #2a3447', borderRadius: '6px', color: '#fff' }}
              />
              <input 
                type="number" 
                placeholder="Harga (Rp)" 
                value={hargaBaru}
                onChange={(e) => setHargaBaru(e.target.value)}
                style={{ flex: 1, padding: '10px', background: '#0b0f19', border: '1px solid #2a3447', borderRadius: '6px', color: '#fff' }}
              />
              <button type="submit" style={{ background: '#10b981', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                + Tambah
              </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a3447', color: '#9ca3af', fontSize: '13px' }}>
                  <th style={{ padding: '10px' }}>Kategori</th>
                  <th style={{ padding: '10px' }}>Nama Paket</th>
                  <th style={{ padding: '10px' }}>Harga</th>
                  <th style={{ padding: '10px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {layanan.map((l) => (
                  <tr key={l._id} style={{ borderBottom: '1px solid #1f293d', fontSize: '13px' }}>
                    <td style={{ padding: '10px', color: '#9ca3af' }}>{l.kategori}</td>
                    <td style={{ padding: '10px' }}>{l.nama}</td>
                    <td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>Rp {l.harga.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={() => handleHapusLayanan(l._id)}
                        style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}