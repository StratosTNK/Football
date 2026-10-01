import React, { useState } from 'react';
import { Lock, KeyRound, X, Check, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onChangePassword,
  showToast 
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Vui lòng nhập mật khẩu quản trị!');
      return;
    }

    setLoading(true);
    try {
      const res = await onLogin(password);
      if (res && res.success) {
        showToast('🔓 Đăng nhập quyền Quản trị viên thành công!');
        onClose();
      } else {
        setError(res?.message || 'Mật khẩu không đúng!');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.2), rgba(255, 51, 102, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FCD34D'
            }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Đăng Nhập Quản Trị Viên</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Chỉ dành cho chủ sân / trưởng nhóm đá</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#F87171',
            fontSize: '0.85rem',
            marginBottom: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Mật khẩu Admin:
            </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="clean-input"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '10px' }}
              disabled={loading}
            >
              <KeyRound size={16} />
              {loading ? 'Đang kiểm tra...' : 'Xác Nhận Đăng Nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
