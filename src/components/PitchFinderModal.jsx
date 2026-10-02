import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Search, 
  Navigation, 
  Check, 
  X, 
  ExternalLink,
  Copy,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { DANANG_PITCHES } from '../data/daNangPitches';

export default function PitchFinderModal({ 
  match, 
  isAdmin, 
  onSelectStadium, 
  onClose, 
  showToast 
}) {
  const hasStadium = Boolean(match?.stadium && match.stadium.trim());
  const [showAllPitches, setShowAllPitches] = useState(!hasStadium);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);

  // Find currently selected pitch object from curated list
  const selectedPitchObj = DANANG_PITCHES.find((p) => 
    match?.stadium && (
      match.stadium.toLowerCase().trim() === p.shortName.toLowerCase().trim() ||
      match.stadium.toLowerCase().trim() === p.name.toLowerCase().trim() ||
      p.shortName.toLowerCase().includes(match.stadium.toLowerCase().trim()) ||
      match.stadium.toLowerCase().trim().includes(p.shortName.toLowerCase().trim()) ||
      p.name.toLowerCase().includes(match.stadium.toLowerCase().trim())
    )
  );

  // Quick filter categories for full search
  const filterCategories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'TDTT', label: 'Gần ĐH TDTT' },
    { id: 'TK', label: 'Q. Thanh Khê' },
    { id: 'LC', label: 'Q. Liên Chiểu' }
  ];

  // Filter Pitches by Search & Category Tag
  const filteredPitches = DANANG_PITCHES.filter((pitch) => {
    if (selectedTag === 'TDTT') {
      const isTdtt = pitch.id === 'upes-pitch' || 
        pitch.name.toLowerCase().includes('tdtt') || 
        pitch.address.toLowerCase().includes('dũng sĩ thanh khê');
      if (!isTdtt) return false;
    } else if (selectedTag === 'TK') {
      if (!pitch.address.toLowerCase().includes('thanh khê')) return false;
    } else if (selectedTag === 'LC') {
      if (!pitch.address.toLowerCase().includes('liên chiểu')) return false;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      pitch.name.toLowerCase().includes(query) || 
      pitch.shortName.toLowerCase().includes(query) || 
      pitch.address.toLowerCase().includes(query) ||
      pitch.phone.includes(query)
    );
  });

  // Copy phone number
  const handleCopyPhone = (pitch) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pitch.phone.replace(/\s+/g, ''));
      setCopiedPhoneId(pitch.id || 'single');
      showToast?.(`📞 Đã chép số điện thoại: ${pitch.phone}`);
      setTimeout(() => setCopiedPhoneId(null), 2500);
    }
  };

  // Select this stadium for current match (Admin only)
  const handleSelectPitch = async (pitch) => {
    if (!isAdmin) {
      showToast?.('💡 Bạn có thể gửi thông tin sân này cho Quản trị viên để cập nhật.');
      return;
    }
    if (onSelectStadium) {
      await onSelectStadium({
        stadium: pitch.shortName,
        location: pitch.address
      });
      showToast?.(`🎉 Đã chọn ${pitch.shortName} làm sân thi đấu!`);
      setShowAllPitches(false);
    }
  };

  // Clear/Unselect stadium (leave empty)
  const handleUnselectStadium = async () => {
    if (!isAdmin) {
      showToast?.('💡 Bạn có thể gửi yêu cầu cho Quản trị viên để cập nhật.');
      return;
    }
    if (onSelectStadium) {
      await onSelectStadium({
        stadium: '',
        location: ''
      });
      showToast?.('↩️ Đã bỏ chọn sân bóng (để trống).');
      setShowAllPitches(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '620px', 
          width: '100%', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '18px 16px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, #131E2E 0%, #0B131F 100%)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 152, 0.12)',
              border: '1px solid rgba(0, 242, 152, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald)'
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                {hasStadium && !showAllPitches ? 'Sân Thi Đấu Của Trận' : 'Tìm Sân Bóng Đà Nẵng'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '1px' }}>
                {hasStadium && !showAllPitches 
                  ? 'Thông tin liên hệ & chỉ đường đến sân' 
                  : 'Danh bạ sân cỏ mini & hotline đặt sân nhanh'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. VIEW GỌN: KHI ĐÃ CÓ SÂN BÓNG -> KHÔNG SỔ DANH SÁCH RA NỮA */}
        {hasStadium && !showAllPitches ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '12px' }}>
            {/* Thẻ sân đã chọn nổi bật */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(0, 242, 152, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1.5px solid var(--emerald)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 0 20px rgba(0, 242, 152, 0.12)'
            }}>
              {/* Badge Trạng thái & Nút Bỏ sân cho Admin */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    background: 'var(--emerald)',
                    color: '#03140C',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Check size={11} strokeWidth={3} /> Sân Đã Chọn Cho Trận Đấu
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleUnselectStadium}
                      className="btn btn-secondary"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: '#FF6B81',
                        borderColor: 'rgba(255, 107, 129, 0.35)',
                        background: 'rgba(255, 107, 129, 0.08)',
                        cursor: 'pointer',
                        borderRadius: '6px'
                      }}
                      title="Bỏ chọn sân, để trống"
                    >
                      ✕ Bỏ chọn
                    </button>
                  )}
                </div>

                {/* Tên sân */}
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.35 }}>
                  {selectedPitchObj?.name || match.stadium}
                </h3>

                {/* Địa chỉ */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '6px', 
                  marginTop: '6px', 
                  fontSize: '0.82rem', 
                  color: '#94A3B8',
                  lineHeight: 1.4
                }}>
                  <Navigation size={14} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{selectedPitchObj?.address || match.location || 'Địa chỉ đang cập nhật'}</span>
                </div>

                {/* Giá tham khảo */}
                {selectedPitchObj?.price && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      color: '#FBBF24',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      💰 {selectedPitchObj.price}
                    </span>
                  </div>
                )}
              </div>

              {/* Khung Hotline đặt sân */}
              {selectedPitchObj?.phone ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  background: 'rgba(11, 18, 30, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(0, 242, 152, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--emerald)',
                      flexShrink: 0
                    }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        Hotline đặt sân
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                        {selectedPitchObj.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                    <a
                      href={`tel:${selectedPitchObj.phone.replace(/\s+/g, '')}`}
                      className="btn"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#fff',
                        padding: '7px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      title="Bấm để gọi đặt sân ngay"
                    >
                      <Phone size={13} />
                      <span>Gọi</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyPhone(selectedPitchObj)}
                      className="btn btn-secondary"
                      style={{
                        padding: '7px 12px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: '8px'
                      }}
                      title="Chép số điện thoại"
                    >
                      {copiedPhoneId === selectedPitchObj.id ? (
                        <>
                          <Check size={13} color="var(--emerald)" />
                          <span style={{ color: 'var(--emerald)' }}>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Chỉ đường Google Maps */}
              {selectedPitchObj?.googleMapsUrl && (
                <a
                  href={selectedPitchObj.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    color: '#38BDF8',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    background: 'rgba(56, 189, 248, 0.08)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '8px'
                  }}
                  title="Xem chỉ đường trên Google Maps"
                >
                  <ExternalLink size={13} />
                  <span>Mở Bản Đồ Chỉ Đường (Google Maps)</span>
                </a>
              )}
            </div>

            {/* Nút chuyển đổi: Đổi sang sân khác / Xem các sân khác */}
            <div style={{ textAlign: 'center', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowAllPitches(true)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>🔍</span>
                <span>{isAdmin ? 'Đổi sang sân bóng khác tại Đà Nẵng' : 'Xem danh sách các sân bóng khác tại Đà Nẵng'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 2. VIEW TÌM KIẾM ĐẦY ĐỦ: KHI CHƯA CÓ SÂN HOẶC BẤM NÚT ĐỔI SÂN */
          <>
            {/* Thanh quay lại nếu đang có sân đã chọn */}
            {hasStadium && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginTop: '10px'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0' }}>
                  Sân hiện tại: <strong style={{ color: '#38BDF8' }}>{match.stadium}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllPitches(false)}
                  className="btn btn-secondary"
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    color: '#38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={12} />
                  <span>Quay lại</span>
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div style={{ paddingTop: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} 
                />
                <input
                  type="text"
                  className="clean-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên sân, đường (Trần Cao Vân, Dũng Sĩ...)"
                  style={{ 
                    paddingLeft: '38px', 
                    paddingRight: searchQuery ? '36px' : '12px',
                    fontSize: '0.85rem',
                    height: '40px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Badges */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 0 10px 0', 
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}>
              {filterCategories.map((cat) => {
                const isActive = selectedTag === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedTag(cat.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: '20px',
                      border: isActive ? '1px solid var(--emerald)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isActive ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: isActive ? 'var(--emerald)' : '#94A3B8',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
              <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                {filteredPitches.length} sân
              </span>
            </div>

            {/* Scrollable Pitch List */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              paddingRight: '2px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px' 
            }}>
              {filteredPitches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
                  <div>Không tìm thấy sân bóng nào phù hợp.</div>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedTag('ALL'); }}
                    className="btn btn-secondary"
                    style={{ marginTop: '10px', fontSize: '0.78rem', padding: '6px 14px' }}
                  >
                    Xem tất cả sân
                  </button>
                </div>
              ) : (
                filteredPitches.map((pitch) => {
                  const isSelected = match?.stadium && (
                    match.stadium.toLowerCase().includes(pitch.shortName.toLowerCase()) || 
                    pitch.name.toLowerCase().includes(match.stadium.toLowerCase())
                  );

                  return (
                    <div 
                      key={pitch.id}
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(180deg, rgba(0, 242, 152, 0.07) 0%, rgba(15, 23, 42, 0.85) 100%)' 
                          : 'rgba(15, 23, 42, 0.65)',
                        border: isSelected 
                          ? '1px solid rgba(0, 242, 152, 0.6)' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: isSelected ? '0 0 16px rgba(0, 242, 152, 0.1)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Card Header: Tên sân & Badge Sân đang chọn */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <h3 style={{ 
                            fontSize: '0.96rem', 
                            fontWeight: 700, 
                            color: '#F8FAFC', 
                            margin: 0,
                            lineHeight: 1.35
                          }}>
                            {pitch.name}
                          </h3>
                          {isSelected && (
                            <span style={{
                              background: 'var(--emerald)',
                              color: '#03140C',
                              borderRadius: '999px',
                              padding: '2px 8px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              flexShrink: 0
                            }}>
                              <Check size={10} strokeWidth={3} /> Đang chọn
                            </span>
                          )}
                        </div>

                        {/* Address with MapPin Icon */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '6px', 
                          marginTop: '6px', 
                          fontSize: '0.78rem', 
                          color: '#94A3B8',
                          lineHeight: 1.4
                        }}>
                          <Navigation size={13} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{pitch.address}</span>
                        </div>

                        {/* Giá tiền tham khảo */}
                        {pitch.price && (
                          <div style={{ marginTop: '6px' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(251, 191, 36, 0.1)',
                              border: '1px solid rgba(251, 191, 36, 0.25)',
                              color: '#FBBF24',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              display: 'inline-block'
                            }}>
                              💰 {pitch.price}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hotline Box: Rõ ràng, dễ đọc & nút bấm trực tiếp */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        background: 'rgba(11, 18, 30, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        flexWrap: 'wrap'
                      }}>
                        {/* Hotline Number Display */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: 'rgba(0, 242, 152, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--emerald)',
                            flexShrink: 0
                          }}>
                            <Phone size={14} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Hotline đặt sân
                            </div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                              {pitch.phone}
                            </div>
                          </div>
                        </div>

                        {/* Quick Call & Copy Phone Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                          <a
                            href={`tel:${pitch.phone.replace(/\s+/g, '')}`}
                            className="btn"
                            style={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: '#fff',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '6px',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                            }}
                            title="Bấm để gọi đặt sân ngay"
                          >
                            <Phone size={12} />
                            <span>Gọi</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopyPhone(pitch)}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.76rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '6px'
                            }}
                            title="Chép số điện thoại"
                          >
                            {copiedPhoneId === pitch.id ? (
                              <>
                                <Check size={12} color="var(--emerald)" />
                                <span style={{ color: 'var(--emerald)' }}>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bottom Action Row: Chỉ đường & Chọn Sân (Dành riêng cho Admin) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        paddingTop: '2px'
                      }}>
                        <a
                          href={pitch.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            color: '#38BDF8',
                            borderColor: 'rgba(56, 189, 248, 0.25)',
                            background: 'rgba(56, 189, 248, 0.05)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            borderRadius: '6px'
                          }}
                          title="Xem vị trí & chỉ đường trên Google Maps"
                        >
                          <ExternalLink size={12} />
                          <span>Chỉ đường Bản đồ</span>
                        </a>

                        {/* Admin Action: Chọn / Bỏ chọn sân thi đấu */}
                        {isAdmin && (
                          isSelected ? (
                            <button
                              type="button"
                              onClick={handleUnselectStadium}
                              className="btn btn-secondary"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                background: 'rgba(255, 107, 129, 0.12)',
                                borderColor: 'rgba(255, 107, 129, 0.35)',
                                color: '#FF6B81',
                                borderRadius: '6px'
                              }}
                              title="Bỏ chọn sân này (để trống)"
                            >
                              ✕ Bỏ chọn sân
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectPitch(pitch)}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                background: 'rgba(0, 242, 152, 0.12)',
                                border: '1px solid rgba(0, 242, 152, 0.4)',
                                color: 'var(--emerald)',
                                borderRadius: '6px'
                              }}
                              title="Chọn làm sân thi đấu chính thức"
                            >
                              ✓ Chọn sân này
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
