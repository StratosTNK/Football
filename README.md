# ⚽ DSU-Thanh Khê Club (Football Squad Balancer)

Ứng dụng web điểm danh và chia đội bóng đá trực tuyến theo thời gian thực (Realtime), được tối ưu hóa cho màn hình điện thoại (mobile-first) để gửi link qua các nhóm Zalo/Facebook.

---

## 🌟 Tính Năng Đã Triển Khai

### 1. Dành Cho Toàn Bộ Thành Viên (Cầu Thủ - Public View)
* **Truy cập không cần đăng nhập**: Mở link trực tiếp trên trình duyệt điện thoại (Safari, Chrome, Zalo In-App Browser).
* **Nắm bắt thông tin trận đấu**:
  * Tiêu đề trận, địa điểm sân bóng (kèm link định vị Google Maps).
  * **Thời gian đá dự kiến**: Ngày đá, khung giờ đá, đồng hồ đếm ngược đến giờ bóng lăn.
  * **Xác định sĩ số**: Thanh tiến độ trực quan hiển thị số người hiện tại (VD: `11 / 14 Cầu thủ`).
* **Điểm danh tức thì**:
  * Chỉ cần nhập **Họ tên** và **Ghi chú tùy chọn** (VD: *đến trễ 10p, mang 2 quả bóng*).
  * Nút tự hủy điểm danh nếu có việc đột xuất.
* **Đồng bộ thời gian thực (Realtime Socket.io)**:
  * Khi bất kỳ ai vừa điền tên, màn hình của tất cả mọi người đang mở web sẽ tự động nhảy số tức thì mà không cần tải lại trang (F5).
* **Xem kết quả chia đội**:
  * Khi Admin bấm chia đội, giao diện tự động cập nhật bảng đội hình thi đấu:
    * 🔴 **ĐỘI ĐỎ** (Áo Đỏ)
    * 🔵 **ĐỘI XANH** (Áo Xanh)
    * 🟡 **ĐỘI VÀNG** (Áo Vàng - nếu chọn chế độ 3 đội)
  * Số áo đấu được đánh số thứ tự rõ ràng.
* **1-Click Copy Zalo**:
  * Nút sao chép nội dung định dạng sẵn cực đẹp kèm emoji bóng đá để dán ngay vào nhóm chat Zalo/Facebook.

---

### 2. Dành Cho Quản Trị Viên (Admin Duy Nhất)
* **Đăng nhập bảo mật**:
  * Bấm nút **Admin** ở góc trên màn hình.
  * Mật khẩu quản trị mặc định: `admin123` (có thể đổi trực tiếp trong phần cài đặt).
* **Setup thông tin & thời gian đá dự kiến**:
  * Đổi tiêu đề trận đấu, tên sân, địa chỉ.
  * Chọn ngày đá (Date picker) và giờ đá dự kiến (Time picker).
  * Cài đặt giới hạn số lượng cầu thủ tối đa (hoặc để trống nếu không giới hạn).
  * Bật/tắt trạng thái đăng ký (`Mở tự do`, `Khóa đăng ký`).
* **Bốc thăm chia đội ngẫu nhiên (Random Matchmaking)**:
  * Tùy chọn chia thành: **2 Đội** hoặc **3 Đội xoay vòng**.
  * Thuật toán xáo trộn ngẫu nhiên công bằng và chia đều số lượng cầu thủ.
  * Hiệu ứng pháo hoa mừng (Confetti celebration) khi bấm chia đội.
* **Sửa đội (Điều chỉnh thủ công sau khi random)**:
  * Nút chuyển đội 1-click trực tiếp trên từng cầu thủ (chuyển qua Đội Đỏ, Đội Xanh, Đội Vàng).
* **Sửa thông tin cầu thủ & Quản lý**:
  * Sửa tên hoặc ghi chú của bất kỳ ai ngay tại danh sách điểm danh.
  * Xóa cầu thủ (khi bấm nhầm hoặc bùng kèo).
  * Thêm nhanh cầu thủ ngoại tuyến (admin add hộ bạn bè).
* **Chia lại & Làm mới**:
  * Nút **"Chia lại"** (Re-shuffle).
  * Nút **"Hủy chia đội"** (quay lại trạng thái điểm danh).
  * Nút **"Xóa sạch danh sách"** (để chuẩn bị cho kèo tuần tiếp theo).

---

## 🚀 Hướng Dẫn Khởi Động & Truy Cập

### 1. Chạy trên máy tính
```bash
npm run dev
```
* **Giao diện Web**: [http://localhost:5173](http://localhost:5173)
* **API & Socket Backend**: [http://localhost:3001](http://localhost:3001)

### 2. Mở trên điện thoại di động (Cùng mạng Wi-Fi)
Khi chạy `npm run dev`, Vite sẽ hiển thị địa chỉ IP nội bộ, ví dụ:
* `http://192.168.1.24:5173` (hoặc IP máy của bạn)
* Bạn chỉ cần mở trình duyệt trên điện thoại hoặc quét mã QR/nhập link trên để kiểm tra trực tiếp trải nghiệm như một cầu thủ thực thụ.

### 3. Tài Khoản Quản Trị Mặc Định
* **Mật khẩu Admin**: `admin123`
