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
  ShieldAlert,
  ListChecks,
  CheckCheck
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

  // Tab state: 'bill' (Chi phí & QR) | 'players' (Danh sách đóng tiền)
  const [activeTab, setActiveTab] = useState('bill');
  const [playerFilter, setPlayerFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'

  // Form states (allow string for seamless typing/deleting without leading 0)
  const [pitchCost, setPitchCost] = useState(() => existingBill?.pitchCost != null ? String(existingBill.pitchCost) : '350000');
  const [drinkCost, setDrinkCost] = useState(() => existingBill?.drinkCost != null ? String(existingBill.drinkCost) : '70000');
  const [otherCost, setOtherCost] = useState(() => existingBill?.otherCost ? String(existingBill.otherCost) : '');
  const [otherCostNote, setOtherCostNote] = useState(existingBill?.otherCostNote || '');
  const [rounding, setRounding] = useState(existingBill?.rounding || '1k'); // 'none', '1k', '5k'

  // Input change handler preventing leading zero trap (e.g. 01 -> 1) and allowing empty string
  const handleNumericInput = (setter) => (e) => {
    let val = e.target.value.trim();
    if (val === '') {
      setter('');
      return;
    }
    val = val.replace(/\D/g, '');
    val = val.replace(/^0+(?=\d)/, '');
    setter(val);
  };

  const handleOtherCostInput = (e) => {
    let val = e.target.value.trim();
    if (val === '' || val === '-') {
      setOtherCost(val);
      return;
    }
    const isNeg = val.startsWith('-');
    let digits = val.replace(/[^\d]/g, '');
    digits = digits.replace(/^0+(?=\d)/, '');
    setOtherCost(isNeg ? (digits ? '-' + digits : '-') : digits);
  };

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
  const [zoomQR, setZoomQR] = useState(false);

  // Auto-sync when player list changes if payingPlayerIds is empty
  useEffect(() => {
    if (payingPlayerIds.size === 0 && players.length > 0) {
      setPayingPlayerIds(new Set(players.map(p => p.id)));
    }
  }, [players]);

  // Calculations
  const numericPitch = pitchCost === '' ? 0 : (Number(pitchCost) || 0);
  const numericDrink = drinkCost === '' ? 0 : (Number(drinkCost) || 0);
  const numericOther = (otherCost === '' || otherCost === '-') ? 0 : (Number(otherCost) || 0);
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

  // VietQR URL generation (không thêm addInfo để app ngân hàng không tự điền nội dung cố định)
  const qrUrl = (cleanAccNo && selectedBankObj)
    ? `https://img.vietqr.io/image/${selectedBankObj.code}-${cleanAccNo}-compact2.png?amount=${perPlayer}&accountName=${encodeURIComponent(accountName.trim())}`
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

  const handleMarkAllPaid = (paid) => {
    if (!isAdmin) return;
    if (paid) {
      setPaidPlayerIds(new Set(payingPlayerIds));
    } else {
      setPaidPlayerIds(new Set());
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
          transferContent: ''
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
        transferContent: ''
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
  const unpaidCount = Math.max(0, payingCount - paidCount);
  const progressPercent = payingCount > 0 ? Math.round((paidCount / payingCount) * 100) : 0;

  // Filtered players for Tab 2
  const filteredPlayers = players.filter(p => {
    const isPaying = payingPlayerIds.has(p.id);
    const isPaid = paidPlayerIds.has(p.id);
    if (playerFilter === 'unpaid') return isPaying && !isPaid;
    if (playerFilter === 'paid') return isPaying && isPaid;
    return true;
  });

  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: 'min(92vh, 740px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '18px 16px',
            borderRadius: '20px',
            background: 'linear-gradient(175deg, #101B2C 0%, #080E17 100%)',
            border: '1px solid rgba(255, 184, 0, 0.25)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 184, 0, 0.1)',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            marginBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.25) 0%, rgba(255, 138, 0, 0.15) 100%)',
                border: '1px solid rgba(255, 184, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFB800'
              }}>
                <Receipt size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                  Thanh Toán & Chia Tiền Sân
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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

          {/* 2-TAB SWITCHER (Styled exactly like Đội Hình / Điểm Danh) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setActiveTab('bill')}
              className={activeTab === 'bill' ? 'btn-primary' : 'btn-secondary'}
              style={{
                flex: 1,
                padding: '10px 8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              <Receipt size={16} />
              <span>Chi Phí & QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('players')}
              className={activeTab === 'players' ? 'btn-primary' : 'btn-secondary'}
              style={{
                flex: 1,
                padding: '10px 8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              <Users size={16} />
              <span>Thu Tiền ({paidCount}/{payingCount})</span>
            </button>
          </div>

          {/* TAB CONTENT (Scrollable area) */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            paddingRight: '2px',
            marginBottom: '10px'
          }}>
            {activeTab === 'bill' ? (
              /* TAB 1: CHI PHÍ & TÀI KHOẢN QR */
              <div>
                {/* MAIN HIGHLIGHT: Per Player Amount Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.14) 0%, rgba(0, 242, 152, 0.08) 100%)',
                  border: '1px solid rgba(255, 184, 0, 0.35)',
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '14px',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}>
                  <div style={{ fontSize: '0.76rem', color: '#FFB800', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    💵 MỖI CẦU THỦ ĐÓNG
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.15,
                    marginTop: '4px',
                    fontFamily: 'Outfit, var(--font-family)',
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 20px rgba(255, 184, 0, 0.3)'
                  }}>
                    {formatVND(perPlayer)} <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFB800' }}>đ</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '0.74rem',
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
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
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

                {/* SECTION 1: COSTS INPUT */}
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
                          <strong style={{ color: '#00F298' }}>{formatVND(numericPitch)} đ</strong>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pitchCost}
                          onChange={handleNumericInput(setPitchCost)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
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
                              onClick={() => setPitchCost(String(amt))}
                              style={{
                                padding: '3px 7px',
                                fontSize: '0.68rem',
                                borderRadius: '6px',
                                border: numericPitch === amt ? '1px solid #00F298' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: numericPitch === amt ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                color: numericPitch === amt ? '#00F298' : 'var(--text-muted)',
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
                          <strong style={{ color: '#38BDF8' }}>{formatVND(numericDrink)} đ</strong>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={drinkCost}
                          onChange={handleNumericInput(setDrinkCost)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
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
                        {/* Quick pills for drink */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {[0, 30000, 50000, 70000, 100000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setDrinkCost(String(amt))}
                              style={{
                                padding: '3px 7px',
                                fontSize: '0.68rem',
                                borderRadius: '6px',
                                border: numericDrink === amt ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: numericDrink === amt ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                color: numericDrink === amt ? '#38BDF8' : 'var(--text-muted)',
                                cursor: 'pointer'
                              }}
                            >
                              {amt === 0 ? '0đ' : `${amt / 1000}k`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Phụ phí / Giảm giá khác */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>➕ Phụ phí / Giảm trừ (VNĐ):</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {numericOther < 0 ? 'Giảm trừ' : 'Cộng thêm'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={otherCost}
                            onChange={handleOtherCostInput}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            style={{
                              width: '130px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#fff',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              boxSizing: 'border-box'
                            }}
                          />
                          <input
                            type="text"
                            value={otherCostNote}
                            onChange={(e) => setOtherCostNote(e.target.value)}
                            placeholder="Ghi chú (ví dụ: nước thêm, voucher...)"
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#fff',
                              fontSize: '0.8rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* Làm tròn tiền */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Làm tròn tiền:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[
                            { id: '1k', label: '1.000đ' },
                            { id: '5k', label: '5.000đ' },
                            { id: 'none', label: 'Chuẩn' }
                          ].map(r => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setRounding(r.id)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                borderRadius: '6px',
                                border: rounding === r.id ? '1px solid #FFB800' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: rounding === r.id ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                color: rounding === r.id ? '#FFB800' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Guest View */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tiền sân:</span>
                        <strong style={{ color: '#fff' }}>{formatVND(numericPitch)} đ</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tiền nước:</span>
                        <strong style={{ color: '#fff' }}>{formatVND(numericDrink)} đ</strong>
                      </div>
                      {numericOther !== 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{otherCostNote || 'Khoản khác'}:</span>
                          <strong style={{ color: numericOther > 0 ? '#FFA502' : '#00F298' }}>
                            {numericOther > 0 ? `+${formatVND(numericOther)}` : formatVND(numericOther)} đ
                          </strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', fontWeight: 800 }}>
                        <span style={{ color: '#fff' }}>Tổng chi phí:</span>
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
                  padding: '14px'
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

                      <div style={{ fontSize: '0.74rem', color: '#00F298', fontStyle: 'italic', background: 'rgba(0, 242, 152, 0.08)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(0, 242, 152, 0.2)' }}>
                        💡 Mã QR sẽ không khóa nội dung cố định để anh em tự nhập Tên của mình khi chuyển khoản (giúp Admin dễ đối soát bill).
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
                            gap: '4px'
                          }}
                        >
                          {copiedAcc ? <Check size={12} color="#00F298" /> : <Copy size={12} />}
                          <span>{copiedAcc ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>

                      {/* VietQR Image Card */}
                      {qrUrl && (
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          borderRadius: '14px',
                          border: '1px solid rgba(0, 242, 152, 0.25)',
                          padding: '10px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <div 
                            onClick={() => setZoomQR(true)}
                            style={{
                              background: '#FFFFFF',
                              padding: '10px 6px',
                              borderRadius: '12px',
                              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              boxSizing: 'border-box',
                              cursor: 'pointer'
                            }}
                            title="Chạm để phóng to mã QR toàn màn hình"
                          >
                            <img
                              src={qrUrl}
                              alt="VietQR Code"
                              style={{
                                width: '100%',
                                maxWidth: '380px',
                                height: 'auto',
                                display: 'block',
                                margin: '0 auto'
                              }}
                              loading="lazy"
                            />
                          </div>

                          <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '0.84rem', color: '#00F298', fontWeight: 800 }}>
                              Quét QR tự điền số tiền: {formatVND(perPlayer)}đ
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#FFB800', marginTop: '3px', fontWeight: 600 }}>
                              📝 Nhớ ghi kèm Tên của mình khi chuyển khoản nhé!
                            </div>
                            <button
                              type="button"
                              onClick={() => setZoomQR(true)}
                              style={{
                                marginTop: '6px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '6px',
                                color: '#38BDF8',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <QrCode size={13} />
                              <span>Chạm phóng to toàn màn hình</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontStyle: 'italic',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px'
                    }}>
                      {isAdmin ? 'Chưa nhập số tài khoản ngân hàng. Hãy bấm "Đổi tài khoản" để nhập STK nhận tiền!' : 'Admin chưa cấu hình số tài khoản chuyển khoản.'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TAB 2: DANH SÁCH THU TIỀN CẦU THỦ */
              <div>
                {/* Mini Summary Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.12) 0%, rgba(0, 242, 152, 0.08) 100%)',
                  border: '1px solid rgba(255, 184, 0, 0.25)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mỗi người đóng:</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFB800' }}>
                        {formatVND(perPlayer)} <span style={{ fontSize: '0.85rem' }}>đ</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Đã thu được:</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: progressPercent === 100 ? '#00F298' : '#38BDF8' }}>
                        {formatVND(paidCount * perPlayer)} đ ({paidCount}/{payingCount})
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
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

                {/* Filter and Quick Actions Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setPlayerFilter('all')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        border: playerFilter === 'all' ? '1px solid var(--emerald)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: playerFilter === 'all' ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: playerFilter === 'all' ? 'var(--emerald)' : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Tất cả ({players.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerFilter('unpaid')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        border: playerFilter === 'unpaid' ? '1px solid #FFB800' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: playerFilter === 'unpaid' ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: playerFilter === 'unpaid' ? '#FFB800' : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Chưa đóng ({unpaidCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerFilter('paid')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        border: playerFilter === 'paid' ? '1px solid #00F298' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: playerFilter === 'paid' ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: playerFilter === 'paid' ? '#00F298' : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Đã đóng ({paidCount})
                    </button>
                  </div>

                  {/* Batch Admin Actions */}
                  {isAdmin && players.length > 0 && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        type="button"
                        onClick={() => handleMarkAllPaid(true)}
                        style={{
                          background: 'rgba(0, 242, 152, 0.1)',
                          border: '1px solid rgba(0, 242, 152, 0.25)',
                          color: '#00F298',
                          fontSize: '0.68rem',
                          padding: '3px 7px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        title="Đánh dấu tất cả người tham gia đều đã đóng tiền"
                      >
                        Đã đóng hết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkAllPaid(false)}
                        style={{
                          background: 'rgba(255, 184, 0, 0.1)',
                          border: '1px solid rgba(255, 184, 0, 0.25)',
                          color: '#FFB800',
                          fontSize: '0.68rem',
                          padding: '3px 7px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        title="Đánh dấu tất cả người tham gia đều chưa đóng"
                      >
                        Chưa đóng hết
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtitle helper for Admin */}
                {isAdmin && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    marginBottom: '8px',
                    padding: '0 4px'
                  }}>
                    <span>Chạm tên để bật/tắt miễn đóng • Bấm nút để đổi Đã đóng</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span 
                        onClick={() => handleSelectAllPaying(true)}
                        style={{ color: '#00F298', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Chia hết
                      </span>
                      <span>•</span>
                      <span 
                        onClick={() => handleSelectAllPaying(false)}
                        style={{ color: '#FF6B81', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Bỏ hết
                      </span>
                    </div>
                  </div>
                )}

                {/* Players List */}
                {players.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Chưa có cầu thủ nào điểm danh trong trận này.
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#00F298', fontSize: '0.82rem', fontWeight: 600 }}>
                    {playerFilter === 'unpaid' 
                      ? '🎉 Tuyệt vời! Tất cả anh em đã hoàn tất đóng tiền 100%!' 
                      : 'Chưa có cầu thủ nào trong danh sách lọc này.'}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {filteredPlayers.map((player) => {
                      const origIndex = players.findIndex(p => p.id === player.id);
                      const isPaying = payingPlayerIds.has(player.id);
                      const isPaid = paidPlayerIds.has(player.id);

                      return (
                        <div
                          key={player.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: isPaid 
                              ? 'linear-gradient(90deg, rgba(0, 242, 152, 0.09) 0%, rgba(0, 242, 152, 0.03) 100%)' 
                              : isPaying 
                                ? 'rgba(255, 255, 255, 0.04)' 
                                : 'rgba(0, 0, 0, 0.25)',
                            border: isPaid 
                              ? '1px solid rgba(0, 242, 152, 0.28)' 
                              : isPaying 
                                ? '1px solid rgba(255, 255, 255, 0.08)' 
                                : '1px solid rgba(255, 255, 255, 0.04)',
                            opacity: isPaying ? 1 : 0.45,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Left: Player Info & Paying toggle */}
                          <div 
                            onClick={() => togglePaying(player.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '9px',
                              cursor: isAdmin ? 'pointer' : 'default',
                              flex: 1,
                              minWidth: 0
                            }}
                            title={isAdmin ? (isPaying ? "Bấm để miễn chia tiền cho cầu thủ này" : "Bấm để tính tiền cho cầu thủ này") : ""}
                          >
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                              width: '24px'
                            }}>
                              #{origIndex + 1}
                            </span>
                            <span style={{
                              fontSize: '0.86rem',
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
                              <span style={{ fontSize: '0.64rem', color: '#FF6B81', fontStyle: 'italic', background: 'rgba(255, 107, 129, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                                Miễn đóng
                              </span>
                            )}
                          </div>

                          {/* Right: Paid toggle */}
                          {isPaying ? (
                            <button
                              type="button"
                              onClick={() => togglePaid(player.id)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '12px',
                                border: isPaid ? '1px solid #00F298' : '1px solid rgba(255, 184, 0, 0.45)',
                                background: isPaid ? 'rgba(0, 242, 152, 0.18)' : 'rgba(255, 184, 0, 0.12)',
                                color: isPaid ? '#00F298' : '#FFB800',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: isAdmin ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                              }}
                              title={isAdmin ? "Bấm để đổi trạng thái đóng tiền" : ""}
                            >
                              {isPaid ? <CheckCircle2 size={13} strokeWidth={2.4} /> : <Clock size={13} strokeWidth={2.4} />}
                              <span>{isPaid ? 'Đã đóng' : 'Chưa đóng'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>0đ</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (Always fixed at bottom of modal) */}
          <div style={{
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0
          }}>
            {isAdmin ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {/* Copy Zalo Bill (Admin only) */}
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
                    gap: '6px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  {copiedZalo ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedZalo ? 'Đã Copy!' : 'Copy Bill Zalo'}</span>
                </button>

                {/* Save Bill (Admin only) */}
                <button
                  type="button"
                  onClick={handleSaveBill}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #00F298 0%, #00D084 100%)',
                    color: '#080E17',
                    border: 'none',
                    padding: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Đang lưu...' : 'Lưu Quyết Toán'}</span>
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    borderRadius: '10px'
                  }}
                >
                  Đóng
                </button>
              </div>
            )}

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
                  padding: '4px',
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

      {/* Fullscreen QR Zoom Modal for easy scanning */}
      {zoomQR && qrUrl && (
        <div 
          onClick={() => setZoomQR(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.94)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              padding: '16px 12px',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '90vh',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxSizing: 'border-box'
            }}
          >
            <img
              src={qrUrl}
              alt="VietQR Code Phóng To"
              style={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.92rem', color: '#080E17', fontWeight: 800 }}>
                Quét QR tự điền số tiền: {formatVND(perPlayer)}đ
              </div>
              <div style={{ fontSize: '0.76rem', color: '#D97706', marginTop: '3px', fontWeight: 700 }}>
                📝 Nhớ ghi kèm Tên của mình khi chuyển khoản nhé!
              </div>
            </div>

            <button
              type="button"
              onClick={() => setZoomQR(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.86rem',
                fontWeight: 800,
                borderRadius: '10px'
              }}
            >
              Đóng Phóng To
            </button>
          </div>
        </div>
      )}
    </Portal>
  );
}
