'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [returning, setReturning] = useState(false);
  const [isReturned, setIsReturned] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Thiếu mã phiên truy cập (token) trong liên kết.');
      setLoading(false);
      return;
    }

    const fetchAccess = async () => {
      try {
        const res = await fetch(`/api/access?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Phiên truy cập không hợp lệ.');
        }

        setAccount(data.account);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [token]);

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (!account?.rentExpiresAt) return;

    const timer = setInterval(() => {
      const diff = new Date(account.rentExpiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('Đã hết hạn');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [account]);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleEarlyReturn = async () => {
    if (!confirm('Bạn có chắc chắn muốn kết thúc và trả tài khoản này sớm không?')) return;
    setReturning(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi trả tài khoản');
      setIsReturned(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setReturning(false);
    }
  };

  // Xác định đường dẫn dịch vụ tương ứng
  const getServiceUrl = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('chatgpt') || n.includes('openai')) return 'https://chatgpt.com';
    if (n.includes('netflix')) return 'https://netflix.com';
    if (n.includes('spotify')) return 'https://spotify.com';
    if (n.includes('canva')) return 'https://canva.com';
    if (n.includes('youtube')) return 'https://youtube.com';
    if (n.includes('adobe')) return 'https://adobe.com';
    if (n.includes('figma')) return 'https://figma.com';
    if (n.includes('midjourney')) return 'https://midjourney.com';
    return 'https://google.com';
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s infinite linear' }}>⏳</div>
        <h2>Đang kiểm tra quyền truy cập...</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (isReturned) {
    return (
      <div className="container" style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
          <h2>Đã hoàn trả tài khoản</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem' }}>
            Cảm ơn bạn đã sử dụng dịch vụ. Phiên mượn này đã được đóng lại an toàn.
          </p>
          <Link href="/" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#f87171' }}>Liên kết không hợp lệ</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem' }}>{error}</p>
          <Link href="/" className="btn btn-secondary" style={{ display: 'inline-block' }}>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const serviceUrl = getServiceUrl(account.name);

  return (
    <div className="container" style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Banner trạng thái */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--card-border)',
          paddingBottom: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <div>
            <span style={{ 
              fontSize: '0.8rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              color: 'var(--accent-color)', 
              fontWeight: 700 
            }}>
              CỔNG TRUY CẬP TÀI KHOẢN
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>{account.name}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge in-use" style={{ fontSize: '0.85rem' }}>ĐANG TRONG PHIÊN</span>
            {timeLeft && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>
                ⏳ Còn lại: {timeLeft}
              </div>
            )}
          </div>
        </div>

        {/* Thông tin đăng nhập */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Thông tin đăng nhập của bạn:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Email */}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              padding: '0.85rem 1.25rem', 
              borderRadius: '8px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              border: '1px solid var(--card-border)' 
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>TÀI KHOẢN / EMAIL</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f8fafc' }}>
                  {account.accountEmail || 'Chưa cập nhật'}
                </div>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => handleCopy(account.accountEmail, 'email')}
              >
                {copiedField === 'email' ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>

            {/* Password */}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.3)', 
              padding: '0.85rem 1.25rem', 
              borderRadius: '8px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              border: '1px solid var(--card-border)' 
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MẬT KHẨU</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
                  {account.accountPassword || '••••••••'}
                </div>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => handleCopy(account.accountPassword, 'pass')}
              >
                {copiedField === 'pass' ? '✓ Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>
        </div>

        {/* Nút thao tác chính */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a
            href={serviceUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{
              padding: '0.85rem',
              textAlign: 'center',
              fontSize: '1.05rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Mở dịch vụ {account.name} ngay</span> ↗
          </a>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem' }}
              onClick={() => handleCopy(window.location.href, 'link')}
            >
              {copiedField === 'link' ? '✓ Đã chép link mượn!' : '🔗 Sao chép link phiên này'}
            </button>
            <button
              className="btn btn-secondary"
              style={{ 
                flex: 1, 
                padding: '0.65rem', 
                fontSize: '0.9rem', 
                color: '#f87171', 
                borderColor: 'rgba(239, 68, 68, 0.3)' 
              }}
              onClick={handleEarlyReturn}
              disabled={returning}
            >
              {returning ? 'Đang xử lý...' : 'Trả tài khoản sớm'}
            </button>
          </div>
        </div>

        {/* Ghi chú an toàn */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'rgba(99, 102, 241, 0.06)', 
          borderRadius: '8px', 
          borderLeft: '3px solid var(--accent-color)',
          fontSize: '0.85rem',
          color: '#cbd5e1',
          lineHeight: '1.5'
        }}>
          💡 <strong>Mẹo:</strong> Bạn có thể chia sẻ đường link trang này cho bạn bè hoặc mở trên các trình duyệt khác mà không cần phải đăng nhập lại vào hệ thống quản lý.
        </div>

      </div>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem', color: '#94a3b8' }}>
        Đang tải...
      </div>
    }>
      <AccessContent />
    </Suspense>
  );
}
