'use client';

import { useState } from 'react';

export default function AccountCard({ account, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const isAvailable = account.status === 'available';
  const isMine = account.currentUser === user?.email;
  const isOthers = !isAvailable && !isMine;

  const activeToken = sessionToken || (isMine ? account.sessionToken : null);
  const accessUrl = typeof window !== 'undefined' && activeToken 
    ? `${window.location.origin}/access?token=${activeToken}` 
    : (activeToken ? `/access?token=${activeToken}` : '');

  const handleCopyLink = () => {
    if (!accessUrl) return;
    navigator.clipboard.writeText(accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
              <span className="info-label">Người mượn:</span>
              <span className="info-value">{account.currentUser}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Thiết bị:</span>
              <span className="info-value">{account.currentMachine}</span>
            </div>
          </>
        )}

        {/* Hộp liên kết chia sẻ mượn tài khoản */}
        {activeToken && isMine && (
          <div className="token-box" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🔗</span> Link truy cập tài khoản:
            </div>
            <p style={{ margin: '0.4rem 0 0.8rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              Gửi liên kết này cho người mượn để họ tự đăng nhập hoặc mở trực tiếp:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ flex: 1, minWidth: '120px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                onClick={handleCopyLink}
              >
                {copied ? '✓ Đã chép link!' : '📋 Sao chép link'}
              </button>

              <a 
                href={accessUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, minWidth: '120px', padding: '0.45rem 0.75rem', fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none' }}
              >
                Mở link ↗
              </a>
            </div>
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
            {loading ? 'Đang xử lý...' : 'Mượn Tài khoản'}
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
