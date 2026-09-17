'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Read from localStorage on mount
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link href="/" className="logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">AccRent Pro</span>
        </Link>
        
        <div className="nav-links">
          <Link href="/" className="active">Bảng điều khiển</Link>
          <Link href="#">Lịch sử mượn</Link>
          {user && user.email === 'admin@admin.com' && (
            <Link href="/admin" style={{ color: '#f59e0b' }}>Admin Dashboard</Link>
          )}
        </div>
        
        <div className="user-profile">
          {user ? (
            <>
              <div className="avatar">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
              <span>{user.email || user.username}</span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Đăng nhập / Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
