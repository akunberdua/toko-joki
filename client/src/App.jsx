import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import logoImg from './assets/logo.jpg';

function NavigationBar() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="app-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src={logoImg}
            alt="Elite Boosting Logo"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
            ELITE <span style={{ color: '#38bdf8' }}>BOOSTING</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isAdminPath && (
          <Link
            to="/"
            style={{
              padding: '6px 12px',
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
        <main className="app-main">
          <Routes>
            <Route path="/" element={<UserPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <footer style={{
          textAlign: 'center',
          padding: '18px 14px',
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
