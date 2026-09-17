'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form states for new/edit account
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', accountEmail: '', accountPassword: '' });

  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.error) {
        console.error('Lỗi lấy stats:', statsData.error);
      } else {
        setStats(statsData.stats);
      }

      const accountsRes = await fetch('/api/admin/accounts');
      const accountsData = await accountsRes.json();
      if (accountsData.error) {
        console.error('Lỗi lấy danh sách tài khoản:', accountsData.error);
        setAccounts([]);
      } else {
        setAccounts(accountsData.accounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(savedUser);
    if (user.email !== 'admin@admin.com') {
      alert('Không có quyền truy cập');
      router.push('/');
      return;
    }
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetch('/api/admin/accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentId, ...formData })
        });
      } else {
        await fetch('/api/admin/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setFormData({ name: '', accountEmail: '', accountPassword: '' });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleEdit = (acc) => {
    setIsEditing(true);
    setCurrentId(acc.id);
    setFormData({ name: acc.name, accountEmail: acc.accountEmail, accountPassword: acc.accountPassword });
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return;
    try {
      await fetch(`/api/admin/accounts?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleForceLogout = async (id) => {
    if (!confirm('Buộc đăng xuất người dùng đang dùng tài khoản này?')) return;
    try {
      await fetch('/api/admin/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'forceLogout' })
      });
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Đang tải...</div>;

  return (
    <div className="container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <p>Quản lý hệ thống và thống kê</p>
      </header>

      {/* Stats Section */}
      {stats && (
        <div className="grid" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>{stats.totalAccounts}</h3>
            <p style={{ color: '#94a3b8' }}>Tổng tài khoản</p>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'var(--success-color)' }}>{stats.availableAccounts}</h3>
            <p style={{ color: '#94a3b8' }}>Đang rảnh</p>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'var(--warning-color)' }}>{stats.inUseAccounts}</h3>
            <p style={{ color: '#94a3b8' }}>Đang dùng</p>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: '#a855f7' }}>{stats.totalUsers}</h3>
            <p style={{ color: '#94a3b8' }}>Người dùng Active</p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Tên hiển thị</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Email tài khoản</label>
            <input type="text" name="accountEmail" className="form-input" value={formData.accountEmail} onChange={handleInputChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Mật khẩu tài khoản</label>
            <input type="text" name="accountPassword" className="form-input" value={formData.accountPassword} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
            {isEditing ? 'Cập nhật' : 'Thêm'}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" style={{ height: '45px' }} onClick={() => { setIsEditing(false); setFormData({ name: '', accountEmail: '', accountPassword: '' }) }}>
              Hủy
            </button>
          )}
        </form>
      </div>

      {/* Table Section */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Danh sách tài khoản</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Tên</th>
                <th style={{ padding: '1rem' }}>Email/Pass</th>
                <th style={{ padding: '1rem' }}>Trạng thái</th>
                <th style={{ padding: '1rem' }}>Người dùng</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>#{acc.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{acc.name}</td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {acc.accountEmail}<br/>
                    <span style={{ filter: 'blur(3px)' }}>{acc.accountPassword}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${acc.status}`} style={{ display: 'inline-flex' }}>
                      {acc.status === 'available' ? 'Sẵn sàng' : 'Đang dùng'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {acc.currentUser ? <span style={{ color: '#f59e0b' }}>{acc.currentUser}</span> : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {acc.status === 'in-use' && (
                      <button onClick={() => handleForceLogout(acc.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Đăng xuất user</button>
                    )}
                    <button onClick={() => handleEdit(acc)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Sửa</button>
                    <button onClick={() => handleDelete(acc.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger-color)' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
