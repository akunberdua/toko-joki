import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' }}>
        <Routes>
          {/* URL Halaman Pelanggan (Contoh: http://localhost:5173/) */}
          <Route path="/" element={<UserPage />} />

          {/* URL Panel Admin (Contoh: http://localhost:5173/admin) */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}