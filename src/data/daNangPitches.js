/**
 * Danh sách các sân bóng đá mini & phong trào tại Đà Nẵng
 * Bao gồm: Tên sân, Địa chỉ, Số điện thoại đặt sân, Loại sân, Giá tham khảo và Link bản đồ
 */

export const DANANG_PITCHES = [
  {
    id: 'upes-pitch',
    name: 'Sân bóng đá Trường Đại học TDTT Đà Nẵng',
    shortName: 'Sân ĐH TDTT Đà Nẵng',
    address: '44 Dũng Sĩ Thanh Khê, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng',
    phone: '0905 884 539',
    secondaryPhone: '0236 3742 222',
    price: '180.000đ - 300.000đ/h',
    type: 'Cụm 3 sân 5 & 1 sân 7 cỏ nhân tạo',
    rating: 4.8,
    reviews: 142,
    googleMapsUrl: 'https://maps.google.com/?q=Trường+Đại+học+Thể+dục+Thể+thao+Đà+Nẵng+44+Dũng+Sĩ+Thanh+Khê',
    features: ['Đèn cao áp sáng chuẩn thi đấu', 'Khán đài có mái che', 'Gửi xe & Căng tin', 'Cho thuê giày & áo bib']
  },
  {
    id: 'hong-phuc-pitch',
    name: 'Sân bóng đá mini Hồng Phúc',
    shortName: 'Sân Hồng Phúc',
    address: 'K814b/17 Trần Cao Vân, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng',
    phone: '0236 3990 836',
    secondaryPhone: '0905 329 119',
    price: '160.000đ - 260.000đ/h',
    type: 'Cụm 4 sân cỏ nhân tạo 5 người',
    rating: 4.6,
    reviews: 95,
    googleMapsUrl: 'https://maps.google.com/?q=814+Trần+Cao+Vân+Thanh+Khê+Đà+Nẵng',
    features: ['Mặt cỏ êm thoát nước tốt', 'Lưới chắn bóng cao', 'Bình nước miễn phí', 'Chỗ để xe an ninh']
  },
  {
    id: 'trung-nghia-pitch',
    name: 'Sân bóng đá Trung Nghĩa (Hoàng Thị Loan)',
    shortName: 'Sân Trung Nghĩa',
    address: 'Giao lộ Hoàng Thị Loan & Nam Trân, Q. Liên Chiểu, Đà Nẵng',
    phone: '0911 313 035',
    secondaryPhone: '0905 558 789',
    price: '200.000đ - 350.000đ/h',
    type: 'Cụm 6 sân 5 & 2 sân 7 hiện đại',
    rating: 4.7,
    reviews: 168,
    googleMapsUrl: 'https://maps.google.com/?q=Hoàng+Thị+Loan+Nam+Trân+Đà+Nẵng',
    features: ['Cụm sân quy mô lớn', 'Mặt cỏ thế hệ mới', 'Hệ thống đèn LED', 'Bãi đỗ ô tô xe máy rộng rãi']
  },
  {
    id: 'thanh-khe-stadium',
    name: 'Sân bóng đá Quận Thanh Khê (Sân Đinh Núp / Hồ Phần Lăng)',
    shortName: 'Sân Đinh Núp (Hồ Phần Lăng)',
    address: 'Đường Đinh Núp, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng',
    phone: '0236 3789 575',
    secondaryPhone: '0905 150 456',
    price: '150.000đ - 250.000đ/h',
    type: 'Cụm sân cỏ mini thuộc TTTT Quận Thanh Khê',
    rating: 4.5,
    reviews: 84,
    googleMapsUrl: 'https://maps.google.com/?q=Đinh+Núp+Thanh+Khê+Đà+Nẵng',
    features: ['Không gian ven hồ mát mẻ', 'Khán đài rộng', 'Bãi giữ xe quy củ', 'Nước giải khát']
  },
  {
    id: 'be-van-dan-pitch',
    name: 'Sân bóng đá Bế Văn Đàn',
    shortName: 'Sân Bế Văn Đàn',
    address: '243 Bế Văn Đàn, P. Chính Gián, Q. Thanh Khê, Đà Nẵng',
    phone: '0905 121 680',
    secondaryPhone: '',
    price: '160.000đ - 250.000đ/h',
    type: '3 sân mini 5 người',
    rating: 4.4,
    reviews: 70,
    googleMapsUrl: 'https://maps.google.com/?q=243+Bế+Văn+Đàn+Thanh+Khê+Đà+Nẵng',
    features: ['Khu vực dân cư yên tĩnh', 'Chủ sân thân thiện', 'Cho thuê áo bib bóng đá', 'Nước giải khát']
  },
  {
    id: 'nam-cao-pitch',
    name: 'Sân bóng đá Nam Cao',
    shortName: 'Sân Nam Cao',
    address: '169 Nam Cao, P. Hòa Khánh Nam, Q. Liên Chiểu, Đà Nẵng',
    phone: '0934 719 456',
    secondaryPhone: '',
    price: '180.000đ - 280.000đ/h',
    type: '4 sân cỏ nhân tạo hiện đại',
    rating: 4.5,
    reviews: 98,
    googleMapsUrl: 'https://maps.google.com/?q=169+Nam+Cao+Liên+Chiểu+Đà+Nẵng',
    features: ['Mặt sân thoát nước tốt', 'Đèn LED cao cấp', 'Khu vực ngồi chờ rộng rãi', 'Căng tin phục vụ chu đáo']
  }
];
