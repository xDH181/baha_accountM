'use client';

import { useEffect, useState } from 'react';
import AccountCard from '@/components/AccountCard';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [user, setUser] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      window.location.href = '/login';
      return;
    }
    setUser(JSON.parse(savedUser));

    fetchAccounts();
    // In a real app, we might use SSE or Websockets here to listen for status changes
    const interval = setInterval(fetchAccounts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Đang chuyển hướng đến trang đăng nhập...</div>;
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Quản Lý Tài Khoản</h1>
        <p>Hệ thống cho thuê tài khoản an toàn & bảo mật</p>
      </header>

      <div className="controls-container" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm tài khoản..." 
          className="form-input" 
          style={{ flex: 1, minWidth: '200px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="form-input" 
          style={{ width: 'auto', paddingRight: '2rem' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại tài khoản</option>
          <option value="netflix">Netflix</option>
          <option value="spotify">Spotify</option>
          <option value="chatgpt">ChatGPT</option>
          <option value="youtube">YouTube Premium</option>
          <option value="canva">Canva</option>
          <option value="adobe">Adobe</option>
          <option value="nordvpn">NordVPN</option>
          <option value="github">GitHub Copilot</option>
          <option value="midjourney">Midjourney</option>
          <option value="figma">Figma</option>
          <option value="grammarly">Grammarly</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b' }}>Đang tải danh sách...</div>
      ) : (
        <div className="grid">
          {accounts
            .filter(account => {
              const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesFilter = filterType === 'all' || account.name.toLowerCase().includes(filterType.toLowerCase());
              return matchesSearch && matchesFilter;
            })
            .map(account => (
            <AccountCard 
              key={account.id} 
              account={account} 
              user={user}
              onUpdate={fetchAccounts} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
