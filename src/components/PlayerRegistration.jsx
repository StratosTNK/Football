import React, { useState } from 'react';

export default function PlayerRegistration({ 
  status, 
  onJoin, 
  showToast 
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên cầu thủ!');
      return;
    }

    setLoading(true);
    try {
      const res = await onJoin(name.trim());
      if (res && res.success && res.player) {
        try {
          const myIds = JSON.parse(localStorage.getItem('my_added_players') || '[]');
          myIds.push(res.player.id);
          localStorage.setItem('my_added_players', JSON.stringify(myIds));
        } catch {}

        setName('');
        showToast(`⚽ Đã thêm "${res.player.name}" vào danh sách!`);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi điểm danh!');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'LOCKED') {
    return (
      <div className="clean-card" style={{ textAlign: 'center', padding: '10px', color: '#FF6B81', fontSize: '0.85rem' }}>
        🔒 Kèo đã chốt sổ (khóa đăng ký).
      </div>
    );
  }

  return (
    <div className="clean-card" style={{ padding: '12px 14px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text"
            className="clean-input"
            placeholder="✍️ Nhập tên để điểm danh (thêm được nhiều người)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            required
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '10px 18px', fontSize: '0.92rem' }}
          >
            {loading ? '...' : 'Thêm Vào ⚽'}
          </button>
        </div>
      </form>
    </div>
  );
}
