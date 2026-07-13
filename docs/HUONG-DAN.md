# Hướng dẫn tạo & chia sẻ link mời

Tài liệu này hướng dẫn bạn cách tạo link thiệp mời riêng cho từng người bạn và
gửi cho họ.

## 1. Điền thông tin của bạn

Trước tiên, mở file `js/config.js` và sửa các dòng có ghi `SỬA:`:

- Tên bạn, ngành, trường
- Ngày giờ buổi lễ
- Địa điểm và địa chỉ Google Maps
- Lời mời

Lưu file lại. Toàn bộ thiệp sẽ tự cập nhật theo thông tin này.

## 2. Mở trang tạo link

Mở file `tao-link.html` trên trình duyệt (khi chạy local thì vào
`http://localhost:3000/tao-link.html`, hoặc khi đã đưa lên GitHub Pages thì vào
`https://<tài-khoản>.github.io/<repo>/tao-link.html`).

## 3. Mời một người

1. Gõ tên người bạn muốn mời vào ô **Tên người bạn muốn mời**.
2. Ô **Link thiệp cá nhân hóa** sẽ hiện link tương ứng ngay lập tức.
3. Bấm:
   - **Copy link** để sao chép rồi dán vào Messenger/Zalo/SMS.
   - **Mở thử** để xem trước thiệp của người đó.
   - **Chia sẻ Facebook** hoặc **Chia sẻ Zalo** để mở cửa sổ chia sẻ nhanh.

Ví dụ link tạo ra:

```
https://tài-khoản.github.io/repo/index.html?ten=Minh%20Anh
```

Khi bạn của bạn mở link này, thiệp sẽ hiện dòng chào dành riêng cho "Minh Anh".

## 4. Tạo nhiều link cùng lúc

1. Ở mục **Tạo nhiều link cùng lúc**, dán danh sách tên — mỗi dòng một tên
   (hoặc ngăn cách bằng dấu phẩy):
   ```
   Minh Anh
   Bảo Nam
   Thu Hà
   ```
2. Bấm **Tạo danh sách link**.
3. Bảng kết quả hiện ra với link của từng người. Bấm **Copy** ở mỗi dòng để sao chép.

## 5. Mẹo

- Tên có dấu tiếng Việt và khoảng trắng đều dùng được — hệ thống tự mã hóa link.
- Không gõ tên thì thiệp sẽ hiển thị "Thân mời **bạn**" (link không có `?ten=`).
- Link không lưu trữ dữ liệu gì cả, chỉ chứa tên trên đường dẫn nên rất nhẹ và riêng tư.
