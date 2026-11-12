import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, ADMIN_DEFAULT_PASSWORD, DEFAULT_SERVICES } from '../config';

export default function AdminPage() {
  // Simpan status login di sessionStorage agar tidak logout otomatis saat refresh
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [adminSubMenu, setAdminSubMenu] = useState('pesanan');
  const [pesananList, setPesananList] = useState([]);
  const [layanan, setLayanan] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Form Tambah Layanan
  const [namaLayananBaru, setNamaLayananBaru] = useState('');
  const [hargaBaru, setHargaBaru] = useState('');
  const [kategoriBaru, setKategoriBaru] = useState('Push Divisi');
  const [isAddingLayanan, setIsAddingLayanan] = useState(false);

  // Ambil data pesanan manual
  const fetchPesanan = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/pesanan`);
      if (!res.ok) throw new Error('Status: ' + res.status);
      const data = await res.json();
      setPesananList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Gagal memuat pesanan:', err.message);
    }
  }, []);

  // Ambil data layanan manual
  const fetchLayanan = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/layanan`);
      if (!res.ok) throw new Error('Status: ' + res.status);
      const data = await res.json();
      setLayanan(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Gagal memuat layanan:', err.message);
    }
  }, []);

  // Sinkronisasi data saat pertama login
  useEffect(() => {
    if (!isLoggedIn) return;
    let isCancelled = false;

    fetch(`${API_BASE_URL}/pesanan`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && Array.isArray(data)) setPesananList(data);
      })
      .catch((err) => console.warn('Gagal memuat pesanan:', err.message));

    fetch(`${API_BASE_URL}/layanan`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && Array.isArray(data)) setLayanan(data);
      })
      .catch((err) => console.warn('Gagal memuat layanan:', err.message));

    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPesanan(), fetchLayanan()]);
    setIsRefreshing(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_DEFAULT_PASSWORD) {
      sessionStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('Password salah! Silakan coba lagi');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
  };

  const handleUpdateStatus = async (id, statusBaru) => {
    try {
      const res = await fetch(`${API_BASE_URL}/pesanan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusBaru })
      });
      if (!res.ok) throw new Error('Gagal update status');
      fetchPesanan();
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleHapusPesanan = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data pesanan ini?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/pesanan/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus pesanan');
      fetchPesanan();
    } catch (err) {
      alert('Error saat menghapus pesanan: ' + err.message);
    }
  };

  const handleTambahLayanan = async (e) => {
    e.preventDefault();
    if (!namaLayananBaru.trim() || !hargaBaru) {
      alert('Mohon isi nama layanan dan harga!');
      return;
    }

    setIsAddingLayanan(true);
    try {
      const res = await fetch(`${API_BASE_URL}/layanan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: namaLayananBaru.trim(),
          harga: Number(hargaBaru),
          kategori: kategoriBaru
        })
      });

      if (!res.ok) throw new Error('Gagal menambah layanan');
      alert('✅ Layanan berhasil ditambahkan!');
      setNamaLayananBaru('');
      setHargaBaru('');
      fetchLayanan();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsAddingLayanan(false);
    }
  };

  const handleHapusLayanan = async (id) => {
    if (!window.confirm('Yakin ingin menghapus paket layanan ini?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/layanan/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus layanan');
      fetchLayanan();
    } catch (err) {
      alert('Error saat menghapus layanan: ' + err.message);
    }
  };

  // Seed default data jika di database masih kosong
  const handleSeedDefaultLayanan = async () => {
    if (!window.confirm('Muat katalog paket default ke server?')) return;
    try {
      for (const item of DEFAULT_SERVICES) {
        await fetch(`${API_BASE_URL}/layanan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: item.nama,
            harga: item.harga,
            kategori: item.kategori
          })
        });
      }
      alert('Katalog default berhasil dimuat!');
      fetchLayanan();
    } catch (err) {
      alert('Gagal memuat katalog default: ' + err.message);
    }
  };

  // Kalkulasi statistik dari data pesanan
  const stats = useMemo(() => {
    const totalPesanan = pesananList.length;
    const menunggu = pesananList.filter((p) => p.status === 'Menunggu').length;
    const verifikasi = pesananList.filter((p) => p.status === 'Verifikasi' || p.status === 'Diproses').length;
    const selesai = pesananList.filter((p) => p.status === 'Selesai').length;

    // Hitung total omset dari string "Rp 10.000"
    const totalOmset = pesananList
      .filter((p) => p.status === 'Verifikasi' || p.status === 'Selesai' || p.status === 'Diproses')
      .reduce((acc, curr) => {
        const num = parseInt(String(curr.total || '').replace(/[^0-9]/g, ''), 10) || 0;
        return acc + num;
      }, 0);

    return { totalPesanan, menunggu, verifikasi, selesai, totalOmset };
  }, [pesananList]);

  // Filter pesanan berdasarkan pencarian & status
  const filteredPesanan = useMemo(() => {
    return pesananList.filter((p) => {
      const matchSearch =
        p.namaUser?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.idUser?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.layanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.metode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [pesananList, searchQuery, filterStatus]);

  // 1. TAMPILAN LOGIN ADMIN JIKA BELUM LOGIN
  if (!isLoggedIn) {
    return (
      <div style={{
        maxWidth: '420px',
        margin: '60px auto',
        background: '#0e1424',
        padding: '36px 28px',
        borderRadius: '16px',
        border: '1px solid #1e2638',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          margin: '0 auto 16px auto'
        }}>
          🔒
        </div>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
          Area Khusus Admin
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '22px' }}>
          Masukkan kode sandi administrator untuk mengelola pesanan & harga paket.
        </p>

        {loginError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12.5px',
            marginBottom: '16px'
          }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="password"
            autoFocus
            required
            placeholder="Masukkan Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#07090e',
              border: '1px solid #1e2638',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#000',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
            }}
          >
            Masuk ke Panel
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <Link to="/" style={{ color: '#94a3b8', fontSize: '12.5px', textDecoration: 'none' }}>
            ← Kembali ke Halaman Pelanggan
          </Link>
        </div>
      </div>
    );
  }

  // 2. PANEL ADMIN LENGKAP JIKA SUDAH LOGIN
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Grid Statistik Ringkasan */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ background: '#0e1424', padding: '16px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Total Pesanan</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{stats.totalPesanan}</div>
        </div>
        <div style={{ background: '#0e1424', padding: '16px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>Menunggu Konfirmasi</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{stats.menunggu}</div>
        </div>
        <div style={{ background: '#0e1424', padding: '16px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '4px' }}>Diproses / Terverifikasi</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>{stats.verifikasi}</div>
        </div>
        <div style={{ background: '#0e1424', padding: '16px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>Estimasi Omset Aktif</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
            Rp {stats.totalOmset.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Konten Utama Grid: Sidebar + Konten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Sidebar Menu Admin */}
        <div style={{
          background: '#0e1424',
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid #1e2638',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <h3 style={{ color: '#10b981', margin: 0, fontSize: '16px', fontWeight: 800 }}>PANEL ADMIN</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Elite Boosting v1.0</p>
          </div>

          <button
            type="button"
            onClick={() => setAdminSubMenu('pesanan')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              background: adminSubMenu === 'pesanan' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: adminSubMenu === 'pesanan' ? '#10b981' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>📋 Pesanan Masuk</span>
            <span style={{ fontSize: '11px', background: '#1e2638', padding: '2px 6px', borderRadius: '10px' }}>
              {pesananList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminSubMenu('harga')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              background: adminSubMenu === 'harga' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: adminSubMenu === 'harga' ? '#10b981' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>⚙️ Kelola Harga & Paket</span>
            <span style={{ fontSize: '11px', background: '#1e2638', padding: '2px 6px', borderRadius: '10px' }}>
              {layanan.length}
            </span>
          </button>

          <div style={{ height: '1px', background: '#1e2638', margin: '12px 0' }} />

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            🚪 Keluar Admin
          </button>
        </div>

        {/* Konten Tab Admin */}
        <div style={{
          background: '#0e1424',
          padding: '24px',
          borderRadius: '14px',
          border: '1px solid #1e2638',
          minHeight: '400px'
        }}>
          {adminSubMenu === 'pesanan' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Daftar Pesanan Masuk</h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Pantau dan konfirmasi status pengerjaan joki dari pelanggan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshAll}
                  disabled={isRefreshing}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: '#162033',
                    border: '1px solid #1e2638',
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔄 {isRefreshing ? 'Memuat...' : 'Segarkan Data'}
                </button>
              </div>

              {/* Baris Pencarian & Filter */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Cari ID, Nama Pelanggan, atau Layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '10px 14px',
                    background: '#07090e',
                    border: '1px solid #1e2638',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: '#07090e',
                    border: '1px solid #1e2638',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '13px'
                  }}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Verifikasi">Verifikasi</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Tolak">Tolak</option>
                </select>
              </div>

              {/* Tabel Pesanan */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e2638', color: '#94a3b8' }}>
                      <th style={{ padding: '10px 12px' }}>ID User</th>
                      <th style={{ padding: '10px 12px' }}>Nama</th>
                      <th style={{ padding: '10px 12px' }}>Layanan</th>
                      <th style={{ padding: '10px 12px' }}>Metode</th>
                      <th style={{ padding: '10px 12px' }}>Total</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Aksi Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPesanan.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                          Belum ada data pesanan yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredPesanan.map((p) => {
                        let statusBg = 'rgba(245, 158, 11, 0.15)';
                        let statusColor = '#f59e0b';
                        if (p.status === 'Verifikasi' || p.status === 'Diproses') {
                          statusBg = 'rgba(56, 189, 248, 0.15)';
                          statusColor = '#38bdf8';
                        } else if (p.status === 'Selesai') {
                          statusBg = 'rgba(16, 185, 129, 0.15)';
                          statusColor = '#34d399';
                        } else if (p.status === 'Tolak') {
                          statusBg = 'rgba(239, 68, 68, 0.15)';
                          statusColor = '#fca5a5';
                        }

                        return (
                          <tr key={p._id || p.idUser} style={{ borderBottom: '1px solid #162033' }}>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#cbd5e1' }}>{p.idUser}</td>
                            <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>{p.namaUser}</td>
                            <td style={{ padding: '12px' }}>{p.layanan}</td>
                            <td style={{ padding: '12px', color: '#94a3b8' }}>{p.metode || '-'}</td>
                            <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>{p.total}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                background: statusBg,
                                color: statusColor,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                {p.status || 'Menunggu'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <select
                                  value={p.status || 'Menunggu'}
                                  onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                                  style={{
                                    background: '#07090e',
                                    border: '1px solid #1e2638',
                                    color: '#fff',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Menunggu">Menunggu</option>
                                  <option value="Verifikasi">Verifikasi</option>
                                  <option value="Diproses">Diproses</option>
                                  <option value="Selesai">Selesai</option>
                                  <option value="Tolak">Tolak</option>
                                </select>
                                {p._id && (
                                  <button
                                    type="button"
                                    title="Hapus Pesanan"
                                    onClick={() => handleHapusPesanan(p._id)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      padding: '2px 4px'
                                    }}
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Kelola Paket & Harga Layanan</h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Tambah, perbarui, atau hapus item layanan yang tampil di katalog pelanggan.
                  </p>
                </div>

                {layanan.length === 0 && (
                  <button
                    type="button"
                    onClick={handleSeedDefaultLayanan}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      background: '#162033',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📦 Muat Paket Bawaan
                  </button>
                )}
              </div>

              {/* Form Tambah Layanan */}
              <form onSubmit={handleTambahLayanan} style={{
                background: '#07090e',
                border: '1px solid #1e2638',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 120px',
                gap: '10px',
                alignItems: 'end'
              }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Kategori</label>
                  <select
                    value={kategoriBaru}
                    onChange={(e) => setKategoriBaru(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0e1424', border: '1px solid #1e2638', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="Push Divisi">Push Divisi</option>
                    <option value="Bundling Hemat">Bundling Hemat</option>
                    <option value="Paket Event">Paket Event</option>
                    <option value="Spesial">Paket Spesial</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Nama Layanan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Divisi 1 → Juara"
                    value={namaLayananBaru}
                    onChange={(e) => setNamaLayananBaru(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0e1424', border: '1px solid #1e2638', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 50000"
                    value={hargaBaru}
                    onChange={(e) => setHargaBaru(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0e1424', border: '1px solid #1e2638', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingLayanan}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isAddingLayanan ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isAddingLayanan ? 'Menyimpan...' : '+ Tambah'}
                </button>
              </form>

              {/* Tabel Layanan */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e2638', color: '#94a3b8' }}>
                      <th style={{ padding: '10px 12px' }}>Kategori</th>
                      <th style={{ padding: '10px 12px' }}>Nama Layanan</th>
                      <th style={{ padding: '10px 12px' }}>Harga</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layanan.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                          Belum ada paket layanan di database. Klik tombol "Muat Paket Bawaan" di atas untuk mengisi katalog standar.
                        </td>
                      </tr>
                    ) : (
                      layanan.map((l) => (
                        <tr key={l._id || l.nama} style={{ borderBottom: '1px solid #162033' }}>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{l.kategori}</td>
                          <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>{l.nama}</td>
                          <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>
                            Rp {Number(l.harga || 0).toLocaleString('id-ID')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {l._id && (
                              <button
                                type="button"
                                onClick={() => handleHapusLayanan(l._id)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
