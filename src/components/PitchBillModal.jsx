import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  X, 
  Copy, 
  Check, 
  Users, 
  QrCode, 
  DollarSign, 
  Coffee, 
  Sparkles, 
  Save, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import Portal from './Portal';
import { formatPitchBillForZalo } from '../utils/zaloFormatter';

// Popular Vietnamese Banks for VietQR
export const VIET_BANKS = [
  { code: 'MB', name: 'MBBank (Quân Đội)', bin: '970422' },
  { code: 'VCB', name: 'Vietcombank', bin: '970436' },
  { code: 'TCB', name: 'Techcombank', bin: '970407' },
  { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
  { code: 'VPB', name: 'VPBank', bin: '970432' },
  { code: 'TPB', name: 'TPBank', bin: '970423' },
  { code: 'BIDV', name: 'BIDV', bin: '970418' },
  { code: 'CTG', name: 'VietinBank', bin: '970415' },
  { code: 'STB', name: 'Sacombank', bin: '970403' },
  { code: 'VIB', name: 'VIB', bin: '970441' },
  { code: 'HDB', name: 'HDBank', bin: '970437' },
  { code: 'SHB', name: 'SHB', bin: '970443' },
  { code: 'MSB', name: 'MSB', bin: '970426' },
  { code: 'OCB', name: 'OCB', bin: '970448' },
  { code: 'LPB', name: 'LPBank', bin: '970449' },
  { code: 'TIMO', name: 'Timo', bin: '963388' },
  { code: 'CAKE', name: 'Cake by VPBank', bin: '546034' }
];

export default function PitchBillModal({
  isOpen,
  onClose,
  match,
  isAdmin = false,
  onSaveBill,
  showToast
}) {
  if (!isOpen) return null;

  const players = match?.players || [];
  const existingBill = match?.pitchBill || null;

  // Retrieve saved bank info from localStorage for convenience
  const getSavedBankInfo = () => {
    try {
      const saved = localStorage.getItem('football_admin_bank_info');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      bankCode: 'MB',
      bankName: 'MBBank (Quân Đội)',
      accountNo: '',
      accountName: '',
      transferContent: 'Tien san bóng'
    };
  };

  const defaultBank = existingBill?.bank || getSavedBankInfo();

  // Form states
  const [pitchCost, setPitchCost] = useState(existingBill?.pitchCost ?? 350000);
  const [drinkCost, setDrinkCost] = useState(existingBill?.drinkCost ?? 70000);
  const [otherCost, setOtherCost] = useState(existingBill?.otherCost ?? 0);
  const [otherCostNote, setOtherCostNote] = useState(existingBill?.otherCostNote || '');
  const [rounding, setRounding] = useState(existingBill?.rounding || '1k'); // 'none', '1k', '5k'

  // Bank states
  const [bankCode, setBankCode] = useState(defaultBank.bankCode || 'MB');
  const [accountNo, setAccountNo] = useState(defaultBank.accountNo || '');
  const [accountName, setAccountName] = useState(defaultBank.accountName || '');
  const [customContent, setCustomContent] = useState(defaultBank.transferContent || 'Tien san');

  // Player payment selection:
  // payingPlayerIds: Set of player IDs participating in splitting the bill
  // paidPlayerIds: Set of player IDs who have already paid
  const [payingPlayerIds, setPayingPlayerIds] = useState(() => {
    if (existingBill?.payingPlayerIds && Array.isArray(existingBill.payingPlayerIds)) {
      return new Set(existingBill.payingPlayerIds);
    }
    return new Set(players.map(p => p.id));
  });

  const [paidPlayerIds, setPaidPlayerIds] = useState(() => {
    if (existingBill?.paidPlayerIds && Array.isArray(existingBill.paidPlayerIds)) {
      return new Set(existingBill.paidPlayerIds);
    }
    return new Set();
  });

  const [showBankSettings, setShowBankSettings] = useState(!defaultBank.accountNo);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-sync when player list changes if payingPlayerIds is empty
  useEffect(() => {
    if (payingPlayerIds.size === 0 && players.length > 0) {
      setPayingPlayerIds(new Set(players.map(p => p.id)));
    }
  }, [players]);

  // Calculations
  const numericPitch = Number(pitchCost) || 0;
  const numericDrink = Number(drinkCost) || 0;
  const numericOther = Number(otherCost) || 0;
  const totalAmount = Math.max(0, numericPitch + numericDrink + numericOther);

  const payingCount = payingPlayerIds.size;
  const rawPerPlayer = payingCount > 0 ? totalAmount / payingCount : 0;

  let perPlayer = rawPerPlayer;
  if (rounding === '1k') {
    perPlayer = Math.ceil(rawPerPlayer / 1000) * 1000;
  } else if (rounding === '5k') {
    perPlayer = Math.ceil(rawPerPlayer / 5000) * 5000;
  } else {
    perPlayer = Math.round(rawPerPlayer);
  }

  const selectedBankObj = VIET_BANKS.find(b => b.code === bankCode) || VIET_BANKS[0];
  const cleanAccNo = accountNo.trim();
  const transferMsg = customContent.trim() || `Tien san ${match?.matchDate || ''}`;

  // VietQR URL generation
  const qrUrl = (cleanAccNo && selectedBankObj)
    ? `https://img.vietqr.io/image/${selectedBankObj.code}-${cleanAccNo}-compact2.png?amount=${perPlayer}&addInfo=${encodeURIComponent(transferMsg)}&accountName=${encodeURIComponent(accountName.trim())}`
    : '';

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(Math.round(num || 0));

  const togglePaying = (id) => {
    if (!isAdmin) return;
    const next = new Set(payingPlayerIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setPayingPlayerIds(next);
  };

  const togglePaid = (id) => {
    if (!isAdmin) return;
    const next = new Set(paidPlayerIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setPaidPlayerIds(next);
  };

  const handleSelectAllPaying = (select) => {
    if (!isAdmin) return;
    if (select) {
      setPayingPlayerIds(new Set(players.map(p => p.id)));
    } else {
      setPayingPlayerIds(new Set());
    }
  };

  const handleSaveBill = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      const billPayload = {
        pitchCost: numericPitch,
        drinkCost: numericDrink,
        otherCost: numericOther,
        otherCostNote: otherCostNote.trim(),
        totalAmount,
        payingCount,
        perPlayer,
        rounding,
        payingPlayerIds: Array.from(payingPlayerIds),
        paidPlayerIds: Array.from(paidPlayerIds),
        bank: {
          bankCode: selectedBankObj.code,
          bankName: selectedBankObj.name,
          accountNo: cleanAccNo,
          accountName: accountName.trim(),
          transferContent: transferMsg
        },
        qrUrl,
        updatedAt: new Date().toISOString()
      };

      // Save bank info to localStorage
      try {
        localStorage.setItem('football_admin_bank_info', JSON.stringify(billPayload.bank));
      } catch {}

      if (onSaveBill) {
        await onSaveBill(billPayload);
      }

      showToast?.('✅ Đã lưu quyết toán tiền sân thành công!');
    } catch (err) {
      showToast?.('❌ Lỗi khi lưu quyết toán: ' + (err.message || 'Thử lại sau.'));
    } finally {
      setSaving(false);
    }
  };

  const handleClearBill = async () => {
    if (!isAdmin) return;
    if (!window.confirm('Bạn có chắc muốn xóa bảng quyết toán tiền sân của trận này?')) return;
    try {
      if (onSaveBill) {
        await onSaveBill(null);
      }
      showToast?.('🗑️ Đã xóa bảng quyết toán.');
      onClose();
    } catch {}
  };

  const handleCopyZalo = () => {
    const billData = {
      pitchCost: numericPitch,
      drinkCost: numericDrink,
      otherCost: numericOther,
      totalAmount,
      payingCount,
      perPlayer,
      bank: {
        bankCode: selectedBankObj.code,
        bankName: selectedBankObj.name,
        accountNo: cleanAccNo,
        accountName: accountName.trim(),
        transferContent: transferMsg
      },
      qrUrl
    };

    const text = formatPitchBillForZalo(match, billData);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedZalo(true);
      showToast?.('📋 Đã sao chép Bill Zalo vào bộ nhớ tạm!');
      setTimeout(() => setCopiedZalo(false), 2500);
    }
  };

  const handleCopyAccountNo = () => {
    if (!cleanAccNo) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanAccNo);
      setCopiedAcc(true);
      showToast?.('📋 Đã sao chép số tài khoản: ' + cleanAccNo);
      setTimeout(() => setCopiedAcc(false), 2000);
    }
  };

  const paidCount = Array.from(paidPlayerIds).filter(id => payingPlayerIds.has(id)).length;
  const progressPercent = payingCount > 0 ? Math.round((paidCount / payingCount) * 100) : 0;

  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: 'calc(100dvh - 30px)',
            overflowY: 'auto',
            padding: '20px 18px',
            borderRadius: '20px',
            background: 'linear-gradient(175deg, #101B2C 0%, #080E17 100%)',
            border: '1px solid rgba(255, 184, 0, 0.25)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 184, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.25) 0%, rgba(255, 138, 0, 0.15) 100%)',
                border: '1px solid rgba(255, 184, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFB800'
              }}>
                <Receipt size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  Thanh Toán & Chia Tiền Sân
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? 'Quyết toán tiền sân, tiền nước & chia đều' : 'Bảng quyết toán tiền sân và thông tin chuyển khoản'}
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '6px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* MAIN HIGHLIGHT: Per Player Amount Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.14) 0%, rgba(0, 242, 152, 0.08) 100%)',
            border: '1px solid rgba(255, 184, 0, 0.35)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#FFB800', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💵 MỖI CẦU THỦ ĐÓNG
            </div>
            <div style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              marginTop: '4px',
              fontFamily: 'Outfit, var(--font-family)',
              letterSpacing: '-0.02em',
              textShadow: '0 0 20px rgba(255, 184, 0, 0.3)'
            }}>
              {formatVND(perPlayer)} <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFB800' }}>đ</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.76rem',
              color: 'rgba(255, 255, 255, 0.75)',
              marginTop: '8px',
              flexWrap: 'wrap'
            }}>
              <span>Tổng: <strong style={{ color: '#fff' }}>{formatVND(totalAmount)}đ</strong></span>
              <span>•</span>
              <span>Chia cho: <strong style={{ color: '#00F298' }}>{payingCount} cầu thủ</strong></span>
              {rounding !== 'none' && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    (Làm tròn {rounding})
                  </span>
                </>
              )}
            </div>

            {/* Collection Progress */}
            {payingCount > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tiến độ thu tiền:</span>
                  <strong style={{ color: progressPercent === 100 ? '#00F298' : '#FFB800' }}>
                    {paidCount}/{payingCount} người ({progressPercent}%)
                  </strong>
                </div>
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: progressPercent === 100 
                      ? 'linear-gradient(90deg, #00F298, #00D084)' 
                      : 'linear-gradient(90deg, #FFB800, #FF8A00)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 1: COSTS INPUT (Admin can edit, guest views summary) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <DollarSign size={14} color="#00F298" />
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                Chi Phí Trận Đấu
              </span>
              {!isAdmin && (
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  (Admin thiết lập)
                </span>
              )}
            </div>

            {isAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Tiền sân */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>⚽ Tiền thuê sân (VNĐ):</span>
                    <strong style={{ color: '#00F298' }}>{formatVND(pitchCost)} đ</strong>
                  </div>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    value={pitchCost}
                    onChange={(e) => setPitchCost(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="350000"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* Quick pills */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
                    {[250000, 300000, 350000, 400000, 450000, 500000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPitchCost(amt)}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                          border: pitchCost === amt ? '1px solid #00F298' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: pitchCost === amt ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          color: pitchCost === amt ? '#00F298' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tiền nước */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>🥤 Tiền nước / revive (VNĐ):</span>
                    <strong style={{ color: '#38BDF8' }}>{formatVND(drinkCost)} đ</strong>
                  </div>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={drinkCost}
                    onChange={(e) => setDrinkCost(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="70000"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* Quick pills */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
                    {[0, 30000, 50000, 70000, 100000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDrinkCost(amt)}
                        style={{
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          borderRadius: '6px',
                          border: drinkCost === amt ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: drinkCost === amt ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          color: drinkCost === amt ? '#38BDF8' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {amt === 0 ? '0đ' : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Làm tròn số tiền */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Làm tròn tiền:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: '1k', label: '1.000đ' },
                      { id: '5k', label: '5.000đ' },
                      { id: 'none', label: 'Chuẩn' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRounding(opt.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          fontWeight: rounding === opt.id ? 700 : 500,
                          borderRadius: '6px',
                          border: rounding === opt.id ? '1px solid #FFB800' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: rounding === opt.id ? 'rgba(255, 184, 0, 0.15)' : 'transparent',
                          color: rounding === opt.id ? '#FFB800' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Guest Summary */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>⚽ Tiền thuê sân:</span>
                  <strong style={{ color: '#fff' }}>{formatVND(pitchCost)} đ</strong>
                </div>
                {drinkCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>🥤 Tiền nước uống:</span>
                    <strong style={{ color: '#fff' }}>{formatVND(drinkCost)} đ</strong>
                  </div>
                )}
                {otherCost !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>➕ Phụ phí / Khác:</span>
                    <strong style={{ color: '#fff' }}>{formatVND(otherCost)} đ</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', fontWeight: 800 }}>
                  <span style={{ color: '#FFB800' }}>TỔNG CỘNG:</span>
                  <span style={{ color: '#FFB800' }}>{formatVND(totalAmount)} đ</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: BANK & VIETQR INFO */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} color="#FFB800" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                  Tài Khoản & Quét Mã QR
                </span>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowBankSettings(!showBankSettings)}
                  style={{
                    fontSize: '0.72rem',
                    color: '#38BDF8',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span>{showBankSettings ? 'Thu gọn' : 'Đổi tài khoản'}</span>
                  <ChevronDown size={12} style={{ transform: showBankSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
            </div>

            {/* Bank Form (When editing or no info yet) */}
            {isAdmin && showBankSettings && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Ngân hàng nhận tiền:
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {VIET_BANKS.map(b => (
                      <option key={b.code} value={b.code} style={{ background: '#111B2C' }}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Số tài khoản:
                    </label>
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      placeholder="0987654321..."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Tên chủ tài khoản:
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="NGUYEN VAN A"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.82rem',
                        textTransform: 'uppercase',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Nội dung chuyển khoản gợi ý:
                  </label>
                  <input
                    type="text"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Tien san..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Account Details & QR Display */}
            {cleanAccNo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {selectedBankObj.name}
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em', marginTop: '2px' }}>
                      {cleanAccNo}
                    </div>
                    {accountName && (
                      <div style={{ fontSize: '0.74rem', color: '#00F298', fontWeight: 600, textTransform: 'uppercase' }}>
                        {accountName.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccountNo}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: copiedAcc ? '#00F298' : '#fff'
                    }}
                  >
                    {copiedAcc ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedAcc ? 'Đã copy' : 'Copy STK'}</span>
                  </button>
                </div>

                {/* QR Code Preview */}
                {qrUrl && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                  }}>
                    <img 
                      src={qrUrl} 
                      alt="VietQR Tiền Sân" 
                      style={{
                        width: '180px',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '8px'
                      }}
                      loading="lazy"
                    />
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#070C15',
                      textAlign: 'center'
                    }}>
                      Quét mã tự điền {formatVND(perPlayer)}đ & nội dung
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '14px 10px',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontStyle: 'italic'
              }}>
                {isAdmin ? 'Chưa nhập số tài khoản ngân hàng. Hãy bấm "Đổi tài khoản" để nhập STK nhận tiền!' : 'Admin chưa cấu hình số tài khoản chuyển khoản.'}
              </div>
            )}
          </div>

          {/* SECTION 3: PLAYER LIST & PAYMENT STATUS */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} color="#00F298" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                  Danh Sách Cầu Thủ ({players.length})
                </span>
              </div>

              {isAdmin && players.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectAllPaying(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#00F298',
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Chọn hết
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllPaying(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FF6B81',
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Bỏ hết
                  </button>
                </div>
              )}
            </div>

            {players.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                Chưa có cầu thủ nào điểm danh trong trận.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflowY: 'auto' }}>
                {players.map((player, idx) => {
                  const isPaying = payingPlayerIds.has(player.id);
                  const isPaid = paidPlayerIds.has(player.id);

                  return (
                    <div
                      key={player.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: isPaid ? 'rgba(0, 242, 152, 0.08)' : isPaying ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                        border: isPaid ? '1px solid rgba(0, 242, 152, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                        opacity: isPaying ? 1 : 0.5
                      }}
                    >
                      {/* Left: Player Info & Paying toggle */}
                      <div 
                        onClick={() => togglePaying(player.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: isAdmin ? 'pointer' : 'default',
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          width: '24px'
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: isPaying ? '#fff' : 'var(--text-dim)',
                          textDecoration: isPaying ? 'none' : 'line-through',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {player.name}
                        </span>
                        {!isPaying && (
                          <span style={{ fontSize: '0.64rem', color: '#FF6B81', fontStyle: 'italic' }}>
                            (Miễn đóng)
                          </span>
                        )}
                      </div>

                      {/* Right: Paid toggle */}
                      {isPaying && (
                        <button
                          type="button"
                          onClick={() => togglePaid(player.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            border: isPaid ? '1px solid #00F298' : '1px solid rgba(255, 184, 0, 0.4)',
                            background: isPaid ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 184, 0, 0.1)',
                            color: isPaid ? '#00F298' : '#FFB800',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: isAdmin ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                          title={isAdmin ? "Bấm để đổi trạng thái đóng tiền" : ""}
                        >
                          {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          <span>{isPaid ? 'Đã đóng' : 'Chưa đóng'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* Copy Zalo Bill */}
              <button
                type="button"
                onClick={handleCopyZalo}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copiedZalo ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedZalo ? 'Đã Copy!' : 'Copy Bill Zalo'}</span>
              </button>

              {/* Save Bill (Admin only) */}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleSaveBill}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #00F298 0%, #00C27A 100%)',
                    color: '#070C15',
                    border: 'none',
                    padding: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Đang lưu...' : 'Lưu Quyết Toán'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '10px', fontSize: '0.82rem' }}
                >
                  Đóng
                </button>
              )}
            </div>

            {isAdmin && existingBill && (
              <button
                type="button"
                onClick={handleClearBill}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FF6B81',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  opacity: 0.8
                }}
              >
                <Trash2 size={12} />
                <span>Xóa quyết toán trận này</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
