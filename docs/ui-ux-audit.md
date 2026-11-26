# Audit UI/UX — mono design registry

Kiểm tra showroom, tài liệu và một số component đại diện bằng Chromium: desktop
1440 × 900, mobile 320 × 800 và 390 × 844, giao diện sáng/tối, điều hướng bằng bàn
phím và axe (WCAG 2.1 A/AA). Các kết quả dưới đây không phải chứng nhận WCAG
hay kiểm thử đầy đủ trên trình đọc màn hình. Không thay đổi dependencies, lockfile
hoặc token gốc. CommandPalette có thêm tùy chọn đích focus khi đóng; hành vi mặc
định cho các ứng dụng đã dùng registry không đổi.

## Phát hiện theo mức ưu tiên

| Mức | Phát hiện | Tác động và xử lý |
| --- | --- | --- |
| Cao | **Showroom bị tràn ngang ở 320 px.** Thanh đầu trang rộng 346 px; vùng Demo của Date range picker rộng 522 px. Nút Theme bị cắt và mô tả tràn theo lịch đôi. Nguồn: `app/components/site-frame.tsx`, `app/components/playground.tsx`. | **Đã sửa:** dùng nút có biểu tượng và tên truy cập được trên mobile, bỏ chỉ mục trùng lặp ở đầu trang, giới hạn cuộn ngang trong khung Demo thay vì cả trang. Không đổi lịch đôi đã deprecated. |
| Cao | **Tìm kiếm chưa truy cập tốt bằng bàn phím và trình đọc màn hình.** Axe đo 3,95–3,98:1 cho nhãn nhóm ở chế độ sáng, thấp hơn 4,5:1. Hộp thoại không có tên; ô tìm kiếm dựa vào placeholder. Escape đóng hộp thoại nhưng chuyển focus về `body`. Nguồn: `app/components/component-search.tsx`, `packages/registry/src/components/ui/command-palette.tsx`. | **Đã sửa:** dùng token chữ mặc định, tăng nhãn nhóm từ 12 px lên 14 px (`content-text-size`), đặt tên cho hộp thoại và ô tìm kiếm; trả focus về nút Search khi đóng. Giữ thao tác Ctrl/Cmd+K và trạng thái không có kết quả. |
| Trung bình | **Menu mobile báo sai trạng thái và che bản xem thử sau khi chọn.** Ở 390 px, nút có `aria-expanded="true"` ngay khi menu đang đóng. Chọn Date range picker thay nội dung nhưng menu vẫn mở. Nguồn: `app/components/playground.tsx`, `app/components/ui/sidebar.tsx`. | **Đã sửa tại showroom:** đồng bộ trạng thái nút với menu, đánh dấu mục hiện tại, đóng menu sau khi chọn và chuyển focus đến tiêu đề bản xem thử. Bản desktop của thanh bên không chiếm chỗ trong lần hiển thị đầu tiên trên mobile. |
| Trung bình | **Chế độ tối bị mất sau khi tải lại.** Nút lưu `theme=dark` nhưng trang mới không đọc lại; nút không thông báo đang bật hay tắt. Nguồn: `app/app/layout.tsx`, `app/components/theme-toggle.tsx`. | **Đã sửa:** khôi phục chế độ đã chọn cho cả showroom và docs, thể hiện trạng thái bằng `aria-pressed`. Mặc định sáng nếu chưa chọn, như trước. |
| Trung bình | **Điều hướng bàn phím tới Demo mất nhiều thao tác trên desktop.** Tab đầu tiên vào nút Button trong danh sách dài; không có liên kết bỏ qua danh sách. Nguồn: `app/components/playground.tsx`. | **Đề xuất:** bổ sung liên kết “Skip to demo” và kiểm tra thứ tự Tab/focus với trình đọc màn hình. Áp dụng quy tắc tương tự cho docs nếu bổ sung mục điều hướng. |
| Trung bình | **Liên kết sâu sai không cho biết lỗi.** `/#no-such-component` vẫn mở Demo Button; `/docs/does-not-exist` trả 404 nhưng trang mặc định không có lối về showroom. Nguồn: `app/components/playground.tsx`, `app/app/docs/[slug]/page.tsx`. | **Đề xuất:** thông báo khi không tìm thấy component và cung cấp nút mở tìm kiếm; thêm đường dẫn về Docs/Showroom trên trang 404. Không đổi hành vi liên kết sâu trong bản sửa nhỏ này. |
| Thấp | **Hướng dẫn cài đặt chưa nối liền với danh mục.** Getting started có lệnh cài và dòng “Browse the component catalog” nhưng chưa có liên kết trực tiếp, cũng không minh họa cấu hình namespace trong `components.json`; người dùng phải tự tìm bằng menu. Mục lục trong trang chỉ hiện từ XL. Nguồn: `app/content/docs/getting-started.md`, `app/components/docs-shell.tsx`, `app/components.json`. | **Đề xuất:** đưa cấu hình registry, lệnh cài đầu tiên và liên kết tới Demo vào cùng một luồng; cân nhắc mục lục thu gọn trên mobile. |
| Thấp | **Cỡ chữ khác nhau giữa các bề mặt** (`content-text-size`, `inline-monospace-size`). Phần prose của docs đặt 15 px; nhãn tab và ghi chú thanh bên là 12 px, còn chỉ mục là 10 px. Nguồn: `app/app/docs/docs.css`, `app/components/playground.tsx`, `app/components/site-frame.tsx`. | **Đề xuất:** phân biệt nhãn thao tác và chỉ mục trang trí; đưa nhãn thao tác về cỡ 14 px theo `DESIGN.md`. Kiểm tra lại bố cục ở 320 px khi đổi thang chữ. |

## Kiểm tra và giới hạn

- Các trang Docs hiện có (`/docs`, `/docs/theming`, `/docs/registry`,
  `/docs/validation`) trả 200; mục lục được kiểm tra có đích hợp lệ. Không xác
  minh toàn bộ liên kết bên ngoài hoặc tất cả URL mẫu trong demo.
- Tìm kiếm có thông báo *No components found*; tab Props có thông báo dự phòng
  *No documented props* trong mã. Các trạng thái Empty/Loader trong showroom là
  bản minh họa, không thay thế phản hồi khi điều hướng lỗi. Chưa mô phỏng tải
  chậm, clipboard bị chặn hoặc từng thao tác trên tất cả component.
- Đã đối chiếu màu, focus, typography và spacing của các bề mặt đã lấy mẫu với
  `DESIGN.md`. Chưa đánh giá đầy đủ 15 quy tắc Kumo cho toàn bộ catalog hoặc
  so sánh độ lệch với phiên bản Kumo upstream. Báo cáo trước trả HTTP 401 nên
  không dùng làm bằng chứng.
