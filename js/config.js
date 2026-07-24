/* =============================================================================
   CẤU HÌNH THIỆP MỜI TỐT NGHIỆP
   -----------------------------------------------------------------------------
   CHỦ NHÂN CHỈ CẦN SỬA CÁC GIÁ TRỊ TRONG FILE NÀY.
   Các dòng có ghi "SỬA:" là chỗ bạn cần điền thông tin thật.

   Lưu ý kỹ thuật: đây là site tĩnh (mở trực tiếp bằng file:// hoặc qua
   "npx serve"), nên KHÔNG dùng ES module (export). Ta gán config vào biến
   toàn cục window.CONFIG để invitation.js và generator.js đều đọc được,
   tránh lỗi CORS / module khi mở bằng file://.
   ========================================================================== */
window.CONFIG = {
  // SỬA: tên của bạn (người tốt nghiệp / chủ nhân thiệp mời)
  tenChuNhan: "Bùi Vương Trưởng",

  // Bằng cấp — mặc định "Cử nhân". SỬA nếu khác (VD "Kỹ sư").
  bangCap: "Cử nhân",

  // SỬA: ngành học của bạn (VD "Công nghệ Thông tin")
  nganh: "Công nghệ Thông tin",

  // SỬA: tên trường đại học (VD "Đại học Bách Khoa")
  truong: "Trường Công nghệ Thông tin - Đại học Phenikaa",

  // SỬA: ngày lễ tốt nghiệp, định dạng dd/mm/yyyy (VD "20/07/2026")
  ngayLe: "26/07/2026",

  // SỬA: giờ bắt đầu buổi lễ (VD "08:00")
  gioLe: "08:30",

  // SỬA: địa điểm tổ chức lễ (tên hội trường / địa chỉ)
  diaDiem: "Đại học Phenikaa",

  // SỬA: địa chỉ chi tiết để mở Google Maps (VD "Số 1 Đại Cồ Việt, Hà Nội")
  diaChiMaps: "Đại học Phenikaa, đường Nguyễn Trác, phường Yên Nghĩa, quận Hà Đông, Hà Nội",

  // Lời nhắn hiển thị trên thiệp — SỬA theo ý bạn.
  loiNhan:
    "Trân trọng kính mời bạn đến chung vui cùng mình trong ngày trọng đại này.",

  // (Tùy chọn) thời lượng buổi lễ tính bằng giờ — dùng để tạo sự kiện lịch.
  thoiLuongGio: 2,
};
