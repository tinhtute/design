# Kiểm chứng P0 — tìm, thử và cài

Đối chiếu [kế hoạch cải thiện](improvement-plan.md) và [lần audit Kumo trước](plans/active/kumo-alignment.md#progress). Kết quả ở đây chỉ áp dụng cho các bề mặt đã kiểm, không phải chứng nhận accessibility toàn registry.

## Bàn phím, cảm ứng và dữ liệu biên

| Luồng                                 | Bàn phím / desktop                                                                                                                                        | Cảm ứng / mobile                                                             | Trạng thái và giới hạn                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tìm, thử, cài                         | Tab đầu đến nội dung mà không đổi hash demo; Back/Forward khôi phục Demo; Enter tìm từ hash sai, Escape trả focus; mở Code, sao chép lệnh và đến cấu hình | Mục lục docs mở và nhảy đến heading ở 320/390 px                             | Axe ngoài và trong palette, với truy vấn rỗng kết quả; kiểm HTTP 404 và đường về; thử lệnh cài vào consumer sạch bằng endpoint public |
| Dialog, LayerDialog                   | Enter mở, Tab / Shift+Tab giữ focus, Escape đóng và trả focus                                                                                             | Mở và lưu LayerDialog ở 320 px không cần swipe; axe cả hai modal ở 390 px    | Kiểm cả tên dialog và chế độ sáng/tối                                                                                                 |
| DatePicker                            | Giữ assertion #20: tên ngày, Enter chọn, bỏ focus vẫn thấy trạng thái chọn                                                                                | Chạm chọn ngày ở 320 px; vẫn tới được nút chuyển tháng                       | Lịch visual dùng ngày cố định; fixture không thay đồng hồ của demo thật                                                               |
| Field, Input, Checkbox, Radio, Select | Tên và mô tả giúp/lỗi; chuỗi email dài và chữ 200%; Space đổi Checkbox, phím mũi tên đổi Radio, gõ để chọn Select                                         | Chạm mở và chọn Select ở 320 px; axe menu đang mở ở 390 px                   | Có lỗi validation nhìn thấy, Checkbox disabled và Select chưa chọn; không giả lập tải mạng cho input local                            |
| Link, Tooltip, Toasty                 | Enter theo link thật; Tab mở Tooltip, nội dung là mô tả của nút, Escape đóng                                                                              | Chạm chạy Undo trên Toasty ở 320 px; axe Tooltip focus và toast lỗi ở 390 px | Kiểm DOM/accessible tree, chưa xác minh lời đọc thực tế                                                                               |

Các spec mới được chạy cùng suite `app/visual`, không thay assertion của #20. Axe quét WCAG A/AA trên các demo/docs ở desktop sáng/tối và thêm trạng thái tương tác ở 390 px. Viewport cảm ứng là mô phỏng Chromium, không phải điện thoại thật. Chưa có VoiceOver/Safari hoặc NVDA/Firefox trong môi trường Linux, nên chưa xác nhận thứ tự đọc, cách đọc lỗi/thay đổi dynamic hay thông báo Toasty trên AT thật. Khi review, ưu tiên thử Tab → skip link, tìm từ hash sai → Escape, mở Dialog → đọc tên/mô tả → đóng và Toasty → nghe báo lỗi.

## Đối chiếu 15 quy tắc Kumo

Giữ các ngoại lệ của [audit Kumo](plans/active/kumo-alignment.md#decisions); không thay token hoặc mở lại audit toàn bộ API.

| Quy tắc                                                                 | Đối chiếu phần thay đổi                                                                                                                      |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `content-text-size`, `inline-monospace-size`                            | Nhãn thao tác mới và link docs ở footer dùng `text-sm` (14 px mặc định); số thứ tự, dấu chỉ mục, gợi ý phím tắt và bản quyền vẫn là chữ phụ. |
| `heading-case`, `font-tracking`, `font-weight`                          | Heading phục hồi dùng sentence case; không thêm tracking tùy chỉnh hoặc `font-bold`.                                                         |
| `related-text-spacing`, `text-spacing`, `icon-alignment`                | Heading, mô tả và hành động phục hồi đi liền nhau; icon Search vẫn nằm cùng dòng nhãn.                                                       |
| `hover-color-transitions`, `shadow-borders`, `concentric-border-radius` | Không thêm transition màu khi hover hoặc viền vào phần có shadow; Tooltip giữ style và thay quan hệ mô tả.                                   |
| `sticky-borders`, `collapse-content-size`                               | Giữ đường phân cách của thanh sticky; mục lục mobile dùng `details` native, không animate kích thước nội dung.                               |
| `layer-card-nesting`, `dialog-rendering`                                | Không thêm LayerCard lồng nhau; palette nằm ngoài nhánh hash hợp lệ / không hợp lệ và vẫn được điều khiển bằng `open`.                       |

## Baseline visual

- Đo lại `main` tại `af560a8`: **119 thất bại, 7 đạt**, cùng tên ca lỗi với CI [#20](https://github.com/tinhtute/design/pull/20) và [#21](https://github.com/tinhtute/design/pull/21). Với image Playwright `v1.65.1-noble`, 117/119 PNG actual giống byte-for-byte với artifact CI; hai ngoại lệ là SVG Loader có pha chuyển động khác nhau. Vì vậy không quy lỗi cho máy local hoặc khác biệt font giữa Docker và CI.
- So ảnh baseline cũ với actual trên `main`: sai khác lặp lại ở chrome, độ rộng và xuống dòng của chữ/nút, ngoài ra có thay đổi cụ thể ở các demo đã qua audit #20. Baseline gần nhất xuất phát từ `30800fc`; từ đó đã có đổi giao diện và nâng dependency (#19). Chưa cô lập riêng mức đóng góp của Chromium/font pipeline và dependency UI ở baseline cũ.
- Dùng lại image trên để cập nhật ảnh sau khi đối chiếu, giữ nguyên dung sai và số ca chụp. Cố định ngày cho hai lịch và pha SVG cho Loader trong bài chụp ảnh, không sửa hành vi sản phẩm. Thay đổi P0 thấy trên ảnh desktop gồm nhãn tab Demo/Code/Props, link docs ở footer, nội dung Getting started và mục lục hiển thị đủ tiêu đề dài. Skip link, mục lục mobile và 404 có bằng chứng riêng.
