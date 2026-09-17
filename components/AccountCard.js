'use client';

import { useState } from 'react';

export default function AccountCard({ account, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);

  const handleRent = async () => {
    setLoading(true);
    try {
      const targetUser = user?.email || 'Unknown';
      const fakeMachine = 'PC-' + Math.floor(Math.random() * 100);

      const res = await fetch('/api/accounts/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: account.id, user: targetUser, machine: fakeMachine })
      });
      
      if (!res.ok) throw new Error('Failed to rent');
      
      const data = await res.json();
      setSessionToken(data.sessionToken);
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: account.id, user: user?.email })
      });
      
      if (!res.ok) throw new Error('Failed to return');
      
      setSessionToken(null);
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAvailable = account.status === 'available';
  const isMine = account.currentUser === user?.email;
  const isOthers = !isAvailable && !isMine;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{account.name}</h3>
        <span className={`badge ${account.status}`}>
          {isAvailable ? 'Sẵn sàng' : 'Đang dùng'}
        </span>
      </div>
      
      <div className="card-body">
        <div className="info-row">
          <span className="info-label">ID:</span>
          <span className="info-value">#{account.id}</span>
        </div>
        
        {!isAvailable && (
          <>
            <div className="info-row">
              <span className="info-label">User:</span>
              <span className="info-value">{account.currentUser}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Machine:</span>
              <span className="info-value">{account.currentMachine}</span>
            </div>
          </>
        )}

        {sessionToken && (
          <div className="token-box">
            <strong>Phiên cấp quyền thành công!</strong>
            <p style={{ margin: '0.5rem 0' }}>Bạn có thể sử dụng tài khoản này ngay bây giờ.</p>
            <a 
              href={`https://app-redirect.mock/login?token=${sessionToken}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ padding: '0.5rem', fontSize: '0.9rem', display: 'inline-flex', marginTop: '0.5rem', textDecoration: 'none' }}
            >
              Truy cập ngay ↗
            </a>
          </div>
        )}
      </div>

      <div className="card-actions">
        {isAvailable ? (
          <button 
            className="btn btn-primary" 
            onClick={handleRent}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Sử dụng Tài khoản'}
          </button>
        ) : isMine ? (
          <button 
            className="btn btn-secondary" 
            onClick={handleReturn}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Trả Tài khoản'}
          </button>
        ) : (
          <button 
            className="btn btn-secondary" 
            disabled={true}
            style={{ opacity: 0.5 }}
          >
            Đang có người dùng
          </button>
        )}
      </div>
    </div>
  );
}
