# Kiến trúc & giải thích animation

## Tổng quan

Đây là một **site tĩnh** thuần HTML/CSS/JS, không có backend, không cần bước build.
Có thể mở trực tiếp bằng trình duyệt hoặc host lên GitHub Pages/Netlify.

```
Trình duyệt
   │
   ├── index.html ──► css/style.css
   │                └► GSAP (CDN) + js/config.js + js/invitation.js
   │
   └── tao-link.html ► css/style.css
                     └► GSAP (CDN) + js/config.js + js/generator.js
```

## Vì sao dùng biến toàn cục `window.CONFIG`?

Site có thể được mở bằng `file://`. Ở chế độ đó, trình duyệt chặn `import`/`export`
(ES module) vì lý do CORS. Do đó `js/config.js` gán dữ liệu vào `window.CONFIG`
và được nạp bằng thẻ `<script>` thường, để cả `invitation.js` lẫn `generator.js`
đều đọc được mà không cần module.

## Cá nhân hóa qua query param

`invitation.js` đọc tham số `ten` trên URL bằng `URLSearchParams`:

```js
var params = new URLSearchParams(window.location.search);
var ten = (params.get("ten") || "").trim() || "bạn";
```

`generator.js` làm điều ngược lại — ghép link từ tên khách:

```js
baseInviteUrl() + "?ten=" + encodeURIComponent(name);
```

`encodeURIComponent` bảo đảm tên có dấu tiếng Việt và khoảng trắng vẫn an toàn trên URL.

## Các animation GSAP (theo pattern gsap-skills)

Nguyên tắc chung áp dụng: dùng `gsap.timeline` để sắp xếp trình tự, `autoAlpha`
(gộp opacity + visibility), `ease: "power2/power3"`, và bọc trong `gsap.context()`
để dễ dọn dẹp. Plugin được đăng ký một lần bằng `gsap.registerPlugin(...)`.

### 1. Mở phong bì

Timeline `tlOpen`: nắp phong bì lật xuống bằng `rotationX` (transform 3D quanh cạnh
trên), phong bì trượt lên và mờ dần, sau đó gọi `revealContent()`.

### 2. Tách chữ tên khách — SplitText

`SplitText` chia tên khách thành từng ký tự, rồi `stagger` cho từng chữ bay lên và
xoay nhẹ (`rotateX`). Nếu SplitText không nạp được, fallback về hiệu ứng mờ dần đơn giản.

### 3. Reveal thông tin — timeline nối tiếp

Lời mời, khối thông tin chủ nhân... hiện lần lượt bằng cách nối các bước timeline với
vị trí tương đối (`"-=0.2"`) để chồng lấn mượt mà.

### 4. Chi tiết sự kiện — ScrollTrigger

Các ô Ngày/Giờ/Địa điểm (`[data-reveal]`) hiện dần khi cuộn tới nhờ `ScrollTrigger`
với `start: "top 88%"`. Tiêu đề và phần ăn mừng cũng gắn trigger riêng.

### 5. Mũ cử nhân bay — MotionPathPlugin

`#flyingCap` bay theo một đường cong định nghĩa bằng các điểm toạ độ, `autoRotate: true`
để mũ tự xoay theo hướng bay. Fallback: bay chéo tuyến tính nếu plugin thiếu.

### 6. Pháo giấy & hạt lấp lánh (confetti)

- `buildParticles()` rải các đốm sáng nhấp nháy nền bằng `repeat: -1, yoyo: true`.
- `burstConfetti()` sinh ~60 mảnh giấy rơi xuống với `stagger { from: "random" }`,
  chạy khi cuộn tới phần ăn mừng, và tự xoá DOM khi xong.

### 7. Tôn trọng `prefers-reduced-motion`

Nếu người dùng bật giảm chuyển động, nội dung hiển thị tĩnh (bỏ qua confetti và
đường bay) để bảo đảm khả năng tiếp cận.

## Nâng cấp GSAP 3.13 (các plugin đã miễn phí sau Webflow)

Các plugin dưới đây nạp từ jsdelivr (`gsap@3.13.0/dist/...`) trong `index.html`,
**sau** gsap core và **trước** `js/config.js`. Mỗi plugin đều được feature-detect
bằng `typeof` và fallback êm nếu CDN thiếu (404) hoặc trình duyệt không hỗ trợ.

### A. CustomEase — đường cong chữ ký "paper"

Đăng ký `CustomEase` và tạo một ease riêng: `CustomEase.create("paper", "M0,0 C0.2,0.9 0.3,1 1,1")`.
Ease này dùng chung cho việc lật nắp phong bì và cú morph Flip, để chuyển động
cảm giác đồng bộ. Thiếu plugin → lui về `power3.out`.

### B. DrawSVGPlugin — đường phân cách & chữ ký viết tay

- `.divider` được thay bằng SVG stroke (đường + mũ cử nhân), vẽ dần từ `"0%"` → `"100%"`.
- `.signature` chuyển thành các `path` nét tay trong `.signature-svg`, tự vẽ khi
  cuộn tới nhờ `ScrollTrigger`.
- Dự phòng: nếu thiếu DrawSVG, ẩn SVG và hiện text thường ("Với tất cả sự trân trọng")
  để vẫn giữ chữ ký cho khả năng tiếp cận.

### C. Observer + Draggable + InertiaPlugin — mở phong bì đa cách

- `Observer.create` trên `#envelopeScene` với `onUp` → vuốt lên để mở (mobile).
- `#waxSeal` thành đối tượng `Draggable` (x,y): kéo/peel đủ xa thì mở thiệp; thả
  giữa chừng thì bật con dấu về chỗ cũ (mượt hơn nếu có InertiaPlugin + snap).
- Cờ `justDragged` chống xung đột giữa thao tác kéo và click; tap trên `#openBtn`
  và `#waxSeal` vẫn hoạt động như cũ.

### D. ScrollSmoother — cuộn mượt + parallax `data-speed`

- Nội dung cuộn bọc trong `#smooth-wrapper > #smooth-content` (bắt buộc với ScrollSmoother).
- Tạo smoother với `smooth: 1.2, effects: true`; các `data-speed` trên vệt sáng nền
  và tiêu đề tạo chiều sâu parallax.
- Chỉ bật ở desktop qua `gsap.matchMedia("(min-width: 768px)")`, và bỏ qua khi
  `prefers-reduced-motion` (mobile dùng cuộn thường).
- Các overlay cố định (`#envelopeScene`, `#flyingCap`, `#fxLayer`) đặt NGOÀI
  `#smooth-wrapper` nên không bị ảnh hưởng bởi transform cuộn mượt.

### E. Flip — morph phong bì → thiệp

Khi mở: `Flip.getState()` con dấu sáp, hiện `#invite`, rồi `Flip.from(state, {absolute:true})`
để con dấu "biến hình" thành con dấu ở đầu thiệp (`.invite__crest`) thay vì cross-fade
phẳng. Sau khi morph xong mới chạy tiếp timeline reveal như cũ. Thiếu Flip → lui về
cách mở cũ (lật nắp + trượt phong bì + mờ dần).

## Trang tạo link (`generator.js`)

- Live preview link khi gõ tên.
- Copy dùng `navigator.clipboard` (có fallback `execCommand`).
- Chia sẻ Facebook: `facebook.com/sharer/sharer.php?u=`; Zalo: `sp.zalo.me/plugins/share?url=`.
- Chế độ hàng loạt: tách danh sách theo dòng/dấu phẩy, dựng bảng, mỗi dòng một nút copy,
  và animate bảng xuất hiện bằng `gsap.from(..., { stagger })`.

## Lớp "điện ảnh" (`css/cinematic.css` + `js/cinematic.js` + Lottie)

Lớp này nâng thiệp thành trải nghiệm kiểu phim hoạt hình, chạy **độc lập** với
`invitation.js` (chỉ lắng nghe `#invite` mở ra qua `MutationObserver`), có fallback
đầy đủ khi thiếu GSAP/lottie/ScrollTrigger và tôn trọng `prefers-reduced-motion`.

### Nạp thư viện
- `lottie-web@5.12.2` (jsdelivr) để phát hoạt hình Lottie.
- Hoạt hình Lottie lưu cục bộ trong `assets/lottie/` (tải sẵn, không phụ thuộc host
  ngoài lúc chạy, deploy GitHub Pages chạy ngay).

### 1. Intro điện ảnh (tự chạy)
Overlay `#cinemaIntro` gồm 2 tấm màn nhung (`.curtain`), title card "Lễ Tốt Nghiệp",
và một Lottie confetti nền. Timeline: title card hiện ra → giữ khung → màn nhung kéo
lên/xuống → mờ overlay, rồi 2 thanh `.letterbox` lướt vào/thu lại như chuyển cảnh phim.
Có nút "Bỏ qua" (`#skipIntro`). Reduced-motion / thiếu GSAP → bỏ qua intro hoàn toàn.

### 2. Nhân vật cử nhân (mascot)
Mascot là **SVG nội tuyến** (không phải Lottie) để khớp đúng tông navy/gold và script
được từng bộ phận. Khi `#invite` mở ra: mascot trượt vào, vẫy tay (`.mascot__arm`),
nhún nhẹ vô hạn, dây tua (`.mascot__tassel`) đung đưa. Khi tới phần ăn mừng thì
`capToss()` tung mặt mũ (`.mascot__board`) lên rồi rơi kiểu `bounce.out`.

Lưu ý: dự định ban đầu dùng nhân vật Lottie, nhưng CDN LottieFiles chặn tải trực tiếp
theo URL đoán (403) và không thể xem trước để đảm bảo hợp tông màu, nên mascot được
dựng bằng SVG. Có thể thay bằng Lottie nhân vật cụ thể sau này.

### 3. Lottie theo scene
- **Cúp danh dự** (`celebrate-trophy.json`) "dựng dần" theo cuộn: dùng
  `ScrollTrigger { scrub }` + `anim.goToAndStop(progress * totalFrames)`.
- **Pháo giấy** (`confetti-cannon.json`) phát khi `ScrollTrigger` `onEnter` phần ăn mừng.
- Thiếu ScrollTrigger → Lottie tự play/loop; thiếu lottie-web → ẩn khung, site vẫn đủ.

### Nguồn hoạt hình Lottie (credit)
Các file trong `assets/lottie/` lấy từ thư viện miễn phí LottieFiles
(giấy phép Lottie Simple License): `celebrate-trophy.json` (Trophy),
`confetti.json` (Confetti), `confetti-cannon.json` (party cannon).

## Lưu ý về mã hóa file

Toàn bộ file văn bản được lưu ở **UTF-8** để tiếng Việt hiển thị đúng trên trình duyệt.
Trên máy Windows này, công cụ soạn thảo có thể lưu nhầm UTF-16; sau khi sửa cần chạy
lại pass chuyển mã UTF-8 (no BOM) và kiểm tra không còn null byte.
