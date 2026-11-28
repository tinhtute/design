# Catalog cho agent

Mở tab **Code** của một demo pilot và chọn **Copy for agent** để lấy lệnh cài,
props và giá trị mặc định trích từ TypeScript, ví dụ TSX và lưu ý sử dụng. Nếu
trình duyệt chặn clipboard, sao chép thủ công từ ô văn bản bên dưới nút.

[`/agent-catalog.json`](https://design.tinhtute.me/agent-catalog.json) trả về
`{ schemaVersion: 1, items: [...] }`. Mỗi item có slug, tên, nhóm, loại/mô tả
registry, alias tìm kiếm, URL demo và JSON cài đặt, lệnh cài và props được trích
xuất. `example` và `guide` là `null` ở các item chưa thuộc pilot. Mảng props rỗng
nghĩa là không có props riêng được trích xuất, không phải component không nhận
props; `defaultValue: null` là không có mặc định được trích xuất. Catalog không
thay thế contract shadcn `/r/registry.json`.

| Pilot              | Nên dùng                                                                            | Tránh                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Button             | Nút **Save changes** thực hiện lưu; dùng `loading` khi đang gửi.                    | Dùng Button cho URL điều hướng thay cho Link.                                 |
| Badge              | Gắn nhãn **Active** hoặc **Failed**, có chữ bên cạnh tín hiệu màu.                  | Biến Badge thành nút thao tác hoặc nhồi cả hướng dẫn vào nhãn.                |
| Field / Select     | Field nối label và lỗi với Input; Select có nhãn **Fruit** và các lựa chọn rõ ràng. | Dùng placeholder thay label, hoặc dùng Select khi phải nhập để lọc.           |
| Dialog             | Yêu cầu xác nhận với title và description, giữ Escape và trả focus.                 | Chặn người dùng chỉ để thông báo trạng thái không cần trả lời.                |
| Tabs               | Đổi giữa **Overview** và **Deployments** trong cùng ngữ cảnh.                       | Biến Tabs thành trình tự bắt buộc hoặc điều hướng giữa các trang.             |
| Toasty             | Thông báo ngắn **Worker deployed** sau khi tác vụ thành công.                       | Chỉ báo lỗi form trong toast thoáng qua.                                      |
| Resource list page | Ghép layout với Table có cột **Name** và **Status**.                                | Dùng layout danh sách cho trang chi tiết, hoặc mặc định block tự tải dữ liệu. |

Anatomy và trạng thái được ghi trên từng item. Resource list page chỉ cấp bố
cục và các slot; app tự cung cấp nội dung rỗng, đang tải và lỗi. Ví dụ được lấy
từ các demo thực và cài thêm registry item mà chính ví dụ import. Ví dụ Toasty
tự bọc provider vì showroom vốn cấp provider ở cấp trang.
