/**
 * Danh sách toàn diện các sân bóng đá mini cỏ nhân tạo tại Đà Nẵng
 * Bao gồm các quận: Thanh Khê, Hải Châu, Liên Chiểu, Cẩm Lệ, Sơn Trà, Ngũ Hành Sơn
 */

export const DANANG_PITCHES = [
  // --- QUẬN THANH KHÊ ---
  {
    id: 'upes-pitch',
    name: 'Sân bóng đá Trường Đại học TDTT Đà Nẵng',
    shortName: 'Sân ĐH TDTT Đà Nẵng',
    district: 'Thanh Khê',
    address: '44 Dũng Sĩ Thanh Khê, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng',
    phone: '0905 884 539',
    secondaryPhone: '0236 3742 222',
    price: '180.000đ - 300.000đ/h',
    type: 'Cụm 3 sân 5 & 1 sân 7 cỏ nhân tạo',
    rating: 4.8,
    reviews: 156,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+Th%E1%BB%83+d%E1%BB%A5c+Th%E1%BB%83+thao+%C4%90%C3%A0+N%E1%BA%B5ng+44+D%C5%A9ng+S%C4%A9+Thanh+Kh%C3%AA',
    features: ['Đèn cao áp sáng chuẩn thi đấu', 'Khán đài có mái che', 'Gửi xe & Căng tin', 'Cho thuê giày & áo bib']
  },
  {
    id: 'hong-phuc-pitch',
    name: 'Sân bóng đá mini Hồng Phúc',
    shortName: 'Sân Hồng Phúc',
    district: 'Thanh Khê',
    address: 'K814b/17 Trần Cao Vân, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng',
    phone: '0236 3990 836',
    secondaryPhone: '0905 329 119',
    price: '160.000đ - 260.000đ/h',
    type: 'Cụm 4 sân cỏ nhân tạo 5 người',
    rating: 4.6,
    reviews: 102,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+H%E1%BB%93ng+Ph%C3%BAc+814+Tr%E1%BA%A7n+Cao+V%C3%A2n+Thanh+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Mặt cỏ êm thoát nước tốt', 'Lưới chắn bóng cao', 'Bình nước miễn phí', 'Chỗ để xe an ninh']
  },
  {
    id: 'be-van-dan-pitch',
    name: 'Sân bóng đá Bế Văn Đàn',
    shortName: 'Sân Bế Văn Đàn',
    district: 'Thanh Khê',
    address: '243 Bế Văn Đàn, P. Chính Gián, Q. Thanh Khê, Đà Nẵng',
    phone: '0905 121 680',
    secondaryPhone: '',
    price: '160.000đ - 250.000đ/h',
    type: '3 sân mini 5 người',
    rating: 4.5,
    reviews: 78,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+B%E1%BA%BF+V%C4%83n+%C4%90%C3%A0n+243+B%E1%BA%BF+V%C4%83n+%C4%90%C3%A0n+Thanh+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Khu vực dân cư yên tĩnh', 'Chủ sân thân thiện', 'Cho thuê áo bib bóng đá', 'Nước giải khát']
  },
  {
    id: 'thanh-khe-stadium',
    name: 'Sân bóng đá Quận Thanh Khê (Sân Đinh Núp / Hồ Phần Lăng)',
    shortName: 'Sân Đinh Núp (Hồ Phần Lăng)',
    district: 'Thanh Khê',
    address: 'Đường Đinh Núp, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng',
    phone: '0236 3789 575',
    secondaryPhone: '0905 150 456',
    price: '150.000đ - 250.000đ/h',
    type: 'Cụm sân cỏ mini thuộc TTTT Quận Thanh Khê',
    rating: 4.5,
    reviews: 89,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+%C4%90inh+N%C3%BAp+H%E1%BB%93+Ph%E1%BA%A7n+L%C4%83ng+Thanh+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Không gian ven hồ thoáng mát', 'Khán đài rộng', 'Bãi giữ xe quy củ', 'Nước giải khát']
  },
  {
    id: 'tan-trao-pitch',
    name: 'Sân bóng đá Tân Trào (Thanh Khê Tây)',
    shortName: 'Sân Tân Trào',
    district: 'Thanh Khê',
    address: 'Đường Nguyễn Đức Trung, P. Thanh Khê Tây, Q. Thanh Khê, Đà Nẵng',
    phone: '0905 443 219',
    secondaryPhone: '',
    price: '160.000đ - 260.000đ/h',
    type: '2 sân 5 người cỏ nhân tạo',
    rating: 4.4,
    reviews: 63,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+T%C3%A2n+Tr%C3%A0o+Nguy%E1%BB%85n+%C4%90%E1%BB%A9c+Trung+Thanh+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Gần ngã 3 Huế', 'Chỗ để xe rộng', 'Mặt cỏ mới nâng cấp']
  },

  // --- QUẬN HẢI CHÂU ---
  {
    id: 'tuyen-son-pitch',
    name: 'Làng thể thao Tuyên Sơn (Cụm sân bóng đá 2/9)',
    shortName: 'Sân Tuyên Sơn',
    district: 'Hải Châu',
    address: 'Số 22 Đường 2 Tháng 9, P. Hòa Cường Bắc, Q. Hải Châu, Đà Nẵng',
    phone: '0236 3630 222',
    secondaryPhone: '0905 111 888',
    price: '220.000đ - 400.000đ/h',
    type: 'Tổ hợp 10 sân cỏ nhân tạo (sân 5 và sân 7)',
    rating: 4.8,
    reviews: 320,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=L%C3%A0ng+th%E1%BB%83+thao+Tuy%C3%AAn+S%C6%A1n+22+%C4%90%C6%B0%E1%BB%9Dng+2+Th%C3%A1ng+9+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Cụm sân thể thao lớn nhất Đà Nẵng', 'Hệ thống đèn LED hiện đại', 'Căng tin chuyên nghiệp', 'Bãi đỗ ô tô xe máy cực rộng']
  },
  {
    id: 'chuyen-viet-tieu-la',
    name: 'Sân bóng đá Chuyên Việt (Tiểu La)',
    shortName: 'Sân Chuyên Việt Tiểu La',
    district: 'Hải Châu',
    address: '98 Tiểu La, P. Hòa Cường Bắc, Q. Hải Châu, Đà Nẵng',
    phone: '0236 3638 555',
    secondaryPhone: '0905 560 833',
    price: '200.000đ - 350.000đ/h',
    type: 'Cụm 6 sân 5 & 2 sân 7 tiêu chuẩn',
    rating: 4.7,
    reviews: 215,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Chuy%C3%AAn+Vi%E1%BB%87t+98+Ti%E1%BB%83u+La+H%E1%BA%A3i+Ch%C3%A2u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Mặt cỏ chất lượng cao', 'Khuôn viên có quán cà phê ngắm sân', 'Hệ thống tắm nóng lạnh', 'Bảo vệ giữ xe chuyên nghiệp']
  },
  {
    id: 'duy-tan-quan-khu-5',
    name: 'Sân bóng đá Duy Tân (Trung tâm TDTT Quân Khu 5)',
    shortName: 'Sân Duy Tân (QK5)',
    district: 'Hải Châu',
    address: 'Số 07 Duy Tân, P. Hòa Cường Bắc, Q. Hải Châu, Đà Nẵng',
    phone: '0236 6555 197',
    secondaryPhone: '0905 214 789',
    price: '200.000đ - 320.000đ/h',
    type: 'Cụm 5 sân cỏ nhân tạo',
    rating: 4.6,
    reviews: 180,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Duy+T%C3%A2n+S%E1%BB%91+7+Duy+T%C3%A2n+Qu%C3%A2n+Khu+5+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Thuộc trung tâm thể thao Quân đội', 'An ninh tuyệt đối', 'Không gian cây xanh mát mẻ', 'Đèn chiếu sáng mạnh']
  },
  {
    id: 'trang-hoang-pitch',
    name: 'Sân bóng đá Trang Hoàng',
    shortName: 'Sân Trang Hoàng',
    district: 'Hải Châu',
    address: '86 Duy Tân, P. Hòa Cường Bắc, Q. Hải Châu, Đà Nẵng',
    phone: '0236 6558 787',
    secondaryPhone: '0905 328 888',
    price: '180.000đ - 300.000đ/h',
    type: '4 sân cỏ mini 5 người',
    rating: 4.5,
    reviews: 130,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Trang+Ho%C3%A0ng+86+Duy+T%C3%A2n+H%E1%BA%A3i+Ch%C3%A2u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Gần sân bay Đà Nẵng', 'Dễ tìm', 'Dịch vụ nước và thuê áo bib chu đáo']
  },
  {
    id: 'trung-vuong-pitch',
    name: 'Sân bóng đá Trưng Vương (Trưng Nữ Vương)',
    shortName: 'Sân Trưng Vương',
    district: 'Hải Châu',
    address: '560 Trưng Nữ Vương, P. Hòa Thuận Nam, Q. Hải Châu, Đà Nẵng',
    phone: '0905 123 456',
    secondaryPhone: '',
    price: '180.000đ - 280.000đ/h',
    type: '3 sân mini 5 người',
    rating: 4.4,
    reviews: 95,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Tr%C6%B0ng+V%C6%B0%C6%A1ng+560+Tr%C6%B0ng+N%E1%BB%AF+V%C6%B0%C6%A1ng+H%E1%BA%A3i+Ch%C3%A2u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Trung tâm thành phố', 'Gần Cầu Rồng', 'Thuận tiện di chuyển']
  },

  // --- QUẬN LIÊN CHIỂU ---
  {
    id: 'trung-nghia-pitch',
    name: 'Sân bóng đá Trung Nghĩa (Hoàng Thị Loan)',
    shortName: 'Sân Trung Nghĩa',
    district: 'Liên Chiểu',
    address: 'Giao lộ Hoàng Thị Loan & Nam Trân, P. Hòa Minh, Q. Liên Chiểu, Đà Nẵng',
    phone: '0911 313 035',
    secondaryPhone: '0905 558 789',
    price: '200.000đ - 350.000đ/h',
    type: 'Cụm 6 sân 5 & 2 sân 7 hiện đại',
    rating: 4.7,
    reviews: 190,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Trung+Ngh%C4%A9a+Ho%C3%A0ng+Th%E1%BB%8B+Loan+Nam+Tr%C3%A2n+Li%C3%AAn+Chi%E1%BB%83u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Cụm sân quy mô lớn', 'Mặt cỏ thế hệ mới', 'Hệ thống đèn LED', 'Bãi đỗ ô tô xe máy rộng rãi']
  },
  {
    id: 'nam-cao-pitch',
    name: 'Sân bóng đá Nam Cao',
    shortName: 'Sân Nam Cao',
    district: 'Liên Chiểu',
    address: '169 Nam Cao, P. Hòa Khánh Nam, Q. Liên Chiểu, Đà Nẵng',
    phone: '0934 719 456',
    secondaryPhone: '',
    price: '180.000đ - 280.000đ/h',
    type: '4 sân cỏ nhân tạo hiện đại',
    rating: 4.5,
    reviews: 110,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Nam+Cao+169+Nam+Cao+Li%C3%AAn+Chi%E1%BB%83u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Mặt sân thoát nước tốt', 'Đèn LED cao cấp', 'Khu vực ngồi chờ rộng rãi', 'Căng tin phục vụ chu đáo']
  },
  {
    id: 'chuyen-viet-au-co',
    name: 'Sân bóng đá Chuyên Việt 2 (Âu Cơ)',
    shortName: 'Sân Chuyên Việt Âu Cơ',
    district: 'Liên Chiểu',
    address: '151 Âu Cơ, P. Hòa Khánh Bắc, Q. Liên Chiểu, Đà Nẵng',
    phone: '0793 560 833',
    secondaryPhone: '',
    price: '170.000đ - 280.000đ/h',
    type: '4 sân cỏ 5 người',
    rating: 4.6,
    reviews: 88,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Chuy%C3%AAn+Vi%E1%BB%87t+151+%C3%82u+C%C6%A1+H%C3%B2a+Kh%C3%A1nh+B%E1%BA%AFc+Li%C3%AAn+Chi%E1%BB%83u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Gần trường ĐH Bách Khoa', 'Sân mới, cỏ êm', 'Giá sinh viên và người đi làm']
  },
  {
    id: 'ngoc-thach-pitch',
    name: 'Sân bóng đá Ngọc Thạch',
    shortName: 'Sân Ngọc Thạch',
    district: 'Liên Chiểu',
    address: 'Đường số 2, KCN Hòa Khánh, Q. Liên Chiểu, Đà Nẵng',
    phone: '0905 617 899',
    secondaryPhone: '',
    price: '160.000đ - 250.000đ/h',
    type: '3 sân cỏ mini',
    rating: 4.3,
    reviews: 52,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Ng%E1%BB%8Dc+Th%E1%BA%A1ch+%C4%90%C6%B0%E1%BB%9Dng+s%E1%BB%91+2+KCN+H%C3%B2a+Kh%C3%A1nh+Li%C3%AAn+Chi%E1%BB%83u+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Gần khu công nghiệp', 'Bãi xe cực lớn', 'Thoáng đãng']
  },

  // --- QUẬN CẨM LỆ ---
  {
    id: 'globalinks-ton-dan',
    name: 'Sân bóng đá Globalinks (Tôn Đản)',
    shortName: 'Sân Globalinks Tôn Đản',
    district: 'Cẩm Lệ',
    address: '76 Tôn Đản, P. Hòa An, Q. Cẩm Lệ, Đà Nẵng',
    phone: '0935 080 811',
    secondaryPhone: '',
    price: '180.000đ - 300.000đ/h',
    type: 'Cụm 4 sân 5 người hiện đại',
    rating: 4.6,
    reviews: 125,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Globalinks+76+T%C3%B4n+%C4%90%E1%BA%A3n+C%E1%BA%A9m+L%E1%BB%87+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Hệ thống chiếu sáng LED thế hệ mới', 'Cỏ nhân tạo đạt chuẩn FIFA', 'Khu nghỉ ngơi quạt mát', 'Căng tin đồ uống phong phú']
  },
  {
    id: 'my-nhat-quang-pitch',
    name: 'Sân bóng đá Mỹ Nhật Quang',
    shortName: 'Sân Mỹ Nhật Quang',
    district: 'Cẩm Lệ',
    address: '498 Nguyễn Hữu Thọ, P. Khuê Trung, Q. Cẩm Lệ, Đà Nẵng',
    phone: '0905 214 789',
    secondaryPhone: '',
    price: '190.000đ - 320.000đ/h',
    type: 'Cụm 4 sân 5 và 1 sân 7',
    rating: 4.6,
    reviews: 140,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+M%E1%BB%B9+Nh%E1%BA%ADt+Quang+498+Nguy%E1%BB%85n+H%E1%BB%AFu+Th%E1%BB%8D+C%E1%BA%A9m+L%E1%BB%87+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Mặt tiền đường Nguyễn Hữu Thọ', 'Đỗ xe ô tô thoải mái', 'Mặt sân êm, độ nảy tốt']
  },
  {
    id: 'quang-da-hoa-xuan',
    name: 'Sân bóng đá Quảng Đà (Hòa Xuân)',
    shortName: 'Sân Quảng Đà',
    district: 'Cẩm Lệ',
    address: 'Đường 29 Tháng 3, P. Hòa Xuân, Q. Cẩm Lệ, Đà Nẵng',
    phone: '0938 924 392',
    secondaryPhone: '',
    price: '180.000đ - 300.000đ/h',
    type: '5 sân cỏ nhân tạo 5 & 7 người',
    rating: 4.7,
    reviews: 115,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Qu%E1%BA%A3ng+%C4%90%C3%A0+%C4%90%C6%B0%E1%BB%9Dng+29+Th%C3%A1ng+3+H%C3%B2a+Xu%C3%A2n+C%E1%BA%A9m+L%E1%BB%87+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Không gian cực kỳ thoáng mát', 'Cụm sân mới xây dựng', 'Cỏ mềm đẹp', 'Bãi đỗ xe không giới hạn']
  },
  {
    id: 'hoa-xuan-stadium-pitch',
    name: 'Sân bóng đá Cụm SVĐ Hòa Xuân',
    shortName: 'Sân Phụ SVĐ Hòa Xuân',
    district: 'Cẩm Lệ',
    address: 'Đường Đô Đốc Tuyết (cạnh SVĐ Hòa Xuân), P. Hòa Xuân, Q. Cẩm Lệ, Đà Nẵng',
    phone: '0905 778 899',
    secondaryPhone: '',
    price: '200.000đ - 350.000đ/h',
    type: 'Sân cỏ nhân tạo 7 và 11 người',
    rating: 4.8,
    reviews: 160,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+%C4%90%C3%B4+%C4%90%E1%BB%91c+Tuy%E1%BA%BFt+S%C3%A2n+v%E1%BA%ADn+%C4%91%E1%BB%99ng+H%C3%B2a+Xu%C3%A2n+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Chuẩn sân thi đấu phong trào', 'Khán đài lớn', 'Hệ thống đèn cao áp chuyên nghiệp']
  },

  // --- QUẬN SƠN TRÀ & NGŨ HÀNH SƠN ---
  {
    id: 'harmony-son-tra',
    name: 'Sân bóng đá Harmony (Phạm Văn Đồng)',
    shortName: 'Sân Harmony',
    district: 'Sơn Trà',
    address: 'Đường Phạm Văn Đồng, P. An Hải Bắc, Q. Sơn Trà, Đà Nẵng',
    phone: '0905 522 789',
    secondaryPhone: '',
    price: '200.000đ - 350.000đ/h',
    type: '4 sân 5 & 1 sân 7 cỏ nhân tạo',
    rating: 4.7,
    reviews: 145,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Harmony+Ph%E1%BA%A1m+V%C4%83n+%C4%90%E1%BB%93ng+S%C6%A1n+Tr%C3%A0+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Gần bãi biển Phạm Văn Đồng', 'Gió biển mát mẻ', 'Đèn chiếu sáng rất tốt', 'Quán nước giải khát tiện nghi']
  },
  {
    id: 'thep-viet-ngu-hanh-son',
    name: 'Sân bóng đá Thép Việt',
    shortName: 'Sân Thép Việt',
    district: 'Ngũ Hành Sơn',
    address: 'Đường Nghiêm Xuân Yêm, P. Khuê Mỹ, Q. Ngũ Hành Sơn, Đà Nẵng',
    phone: '0236 6555 505',
    secondaryPhone: '0905 889 900',
    price: '180.000đ - 300.000đ/h',
    type: '4 sân mini 5 người',
    rating: 4.5,
    reviews: 90,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+Th%C3%A9p+Vi%E1%BB%87t+Nghi%C3%AAm+Xu%C3%A2n+Y%C3%AAm+Ng%C5%A9+H%C3%A0nh+S%C6%A1n+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Không gian rộng', 'Cỏ nhân tạo êm', 'Bãi đỗ xe an toàn']
  },
  {
    id: 'lang-dai-hoc-ngu-hanh-son',
    name: 'Sân bóng đá Khu Đô Thị Làng Đại Học',
    shortName: 'Sân Làng Đại Học',
    district: 'Ngũ Hành Sơn',
    address: 'Đường Nam Kỳ Khởi Nghĩa, P. Hòa Quý, Q. Ngũ Hành Sơn, Đà Nẵng',
    phone: '0914 432 100',
    secondaryPhone: '',
    price: '160.000đ - 260.000đ/h',
    type: 'Cụm sân 5 và sân 7 sinh viên & phong trào',
    rating: 4.6,
    reviews: 110,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=S%C3%A2n+b%C3%B3ng+%C4%91%C3%A1+L%C3%A0ng+%C4%90%E1%BA%A1i+H%E1%BB%8Dc+Nam+K%E1%BB%B3+Kh%E1%BB%9Fi+Ngh%C4%A9a+Ng%C5%A9+H%C3%A0nh+S%C6%A1n+%C4%90%C3%A0+N%E1%BA%B5ng',
    features: ['Khuôn viên làng đại học rộng lớn', 'Mặt sân chuẩn', 'Giá thuê rất hợp lý']
  }
];

/**
 * Tạo link tìm kiếm trực tiếp trên Google Maps với từ khóa bất kỳ
 */
export const getGoogleMapsSearchUrl = (query = 'sân bóng đá Đà Nẵng') => {
  const clean = query.trim() || 'sân bóng đá Đà Nẵng';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`;
};
