import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import logoImg from './assets/logo.jpg';

function NavigationBar() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: '#0a0e1a',
      borderBottom: '1px solid #1e2638',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img
            src={logoImg}
            alt="Elite Boosting Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}
          />
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
            ELITE <span style={{ color: '#38bdf8' }}>BOOSTING</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isAdminPath && (
          <Link
            to="/"
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: '#162033',
              color: '#cbd5e1',
              border: '1px solid #1e2638',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🌐 Ke Web Pelanggan
          </Link>
        )}
      </div>
    </nav>
  );
}

const currentYear = new Date().getFullYear();

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#07090e' }}>
        <NavigationBar />
        <main style={{ flex: 1, padding: '24px 16px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<UserPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <footer style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #1e2638',
          fontSize: '12px',
          color: '#64748b'
        }}>
          © {currentYear} Elite Boosting. Platform Jasa Joki Game Aman & Cepat.
        </footer>
      </div>
    </BrowserRouter>
  );
}
