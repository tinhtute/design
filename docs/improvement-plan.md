# Kế hoạch cải thiện mono design registry

**Phạm vi:** đề xuất sau [PR #19](https://github.com/tinhtute/design/pull/19) và [PR #20](https://github.com/tinhtute/design/pull/20), đối chiếu với mã và docs tại `46dd290`. Chưa triển khai hay chạy lại audit UI. Giữ mô hình shadcn source-first, Base UI, Hugeicons, màu thương hiệu `#124b68` và API đã phát hành. Không đưa `@cloudflare/kumo` vào ứng dụng tiêu thụ.

## Điểm xuất phát

- [Registry](../packages/registry/registry.json) có 62 mục: 53 UI, 2 pattern, 4 block, 1 theme, 1 helper và 1 tệp giấy phép. `packages/registry/src/components/` là mã gốc; `app/scripts/sync-registry.mjs` đồng bộ bản dùng trong showroom trước khi build. Không sửa hai bản component như hai nguồn độc lập.
- [Theme gốc](../packages/tokens/src/themes/default/theme.json) và generator sinh CSS và item `theme-default`. [DESIGN.md](../DESIGN.md) đã định nghĩa brand, typography, spacing, motion và 15 quy tắc Kumo. Showroom đã có sáng/tối theo hệ thống hoặc lựa chọn được lưu. Không thay giá trị token hiện có trong kế hoạch này.
- Showroom có danh mục theo nhóm, tìm kiếm Ctrl/Cmd+K, liên kết `/#slug`, Demo/Code/Props. Bảng props được trích từ TypeScript qua `app/lib/props.ts`; nhóm và tên tìm kiếm hiện đến từ `GROUPS` trong `app/components/playground.tsx`. Docs có Getting started, Theming, Registry và Validation.
- [Audit #20](ui-ux-audit.md) đã xử lý tràn ngang ở 320 px, menu mobile, focus và tên truy cập của Search/CommandPalette, ngày được chọn, nhãn copy và nháy theme. Giữ các test hiện có. Các khoảng trống còn lại: bỏ qua sidebar bằng bàn phím, link sai, onboarding và mục lục mobile, chữ nhỏ ở nhãn thao tác; chưa kiểm thử toàn catalog bằng trình đọc màn hình, với tải chậm hoặc với dữ liệu biên.
- Đã có axe theo demo sáng/tối, Playwright visual và smoke install registry. Axe hiện lọc WCAG 2.0/2.1 A/AA; không thay cho kiểm thử touch, trình đọc màn hình hay chứng nhận WCAG. [Kế hoạch Kumo đang mở](plans/active/kumo-alignment.md) đã có các đợt đối chiếu và redesign; dùng lại bằng chứng và giữ hướng đã chọn, không mở một redesign song song.
- Cả #19 và #20 ghi nhận 119 lỗi snapshot visual đã có trên `main` lúc kiểm, không duyệt lại baseline. Cần tái đo trên `main` hiện tại trước khi dùng visual làm gate cho thay đổi UI; không mặc định con số cũ vẫn đúng hoặc cập nhật toàn bộ ảnh để chạy xanh.

## Đọc gì từ các reference, áp dụng vào đâu?

| Nguồn                                                                                                                                                                                                                                                                                                                                                                                    | Bài học có thể áp dụng                                                                                                                                                                                                                       | Khoảng cách và quyết định cho mono                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Flo Höller — Dropzone component design](https://x.com/flohoeller/status/2108852654957011295?s=46)                                                                                                                                                                                                                                                                                       | Video cho thấy chọn tệp hoặc kéo thả, đếm tệp khi drag-over, tiến độ từng tệp và toàn nhóm, thành công một phần, lỗi quá dung lượng khác lỗi mất kết nối, thử lại/xóa/dọn danh sách, cả hai theme.                                           | Catalog có `Field`, `Loader`, `Empty`, `Toasty`, `Meter` nhưng chưa có flow tải tệp. Làm thử một block dùng dữ liệu mô phỏng, không sao chép UI, giới hạn 25 MB hay tự bổ sung dịch vụ upload. `Meter` biểu thị một phép đo, không dùng thay `progressbar` cho tiến độ công việc. **P2.1**.                                                                              |
| [Libraries.dev](https://libraries.dev/)                                                                                                                                                                                                                                                                                                                                                  | Demo chạy được, playground tinh chỉnh, một nút copy cả lệnh cài/cách dùng/props để agent nhận đủ ngữ cảnh. Beam/Gooey cho thấy lợi ích của demo có tham số, không phải hiệu ứng mặc định cho UI công việc.                                   | Mono có Code và Props nhưng thông tin nằm ở các tab khác nhau. Thử một đoạn “Copy for agent” từ dữ liệu thật và preset demo. Không cài gói hiệu ứng/ML hoặc sao chép hiệu ứng trang trí. **P1.1**.                                                                                                                                                                       |
| [Kumo](https://kumo-ui.com/) — [registry](https://kumo-ui.com/registry), [màu](https://kumo-ui.com/colors), [a11y](https://kumo-ui.com/accessibility), [skill](https://kumo-ui.com/skill), [changelog](https://kumo-ui.com/changelog)                                                                                                                                                    | Metadata máy đọc sinh từ API, gồm props mặc định, biến thể, ví dụ, token và subcomponent. Docs mô tả trách nhiệm của component và của app với bàn phím, focus, nhãn và contrast. Changelog giúp tách thay đổi upstream khỏi thay đổi cục bộ. | JSON shadcn đã phục vụ cài đặt, chưa thay thế được metadata chọn và ghép component. [Manifest Kumo](plans/completed/kumo-source-manifest.json) ghi 2.15.0 cho đợt port mới; component cũ còn header pin trước đó. So sánh theo từng mục và 15 rule ID, không nâng pin đồng loạt hoặc tự thêm Flow/logo; tách mẫu không tương đương khỏi thiếu hụt. **P0.2, P1.1, P2.3**. |
| [Microinteractions.dev](https://microinteractions.dev/) — [Text swap](https://microinteractions.dev/text-swap/), [Tab indicator](https://microinteractions.dev/tab-indicator/), [Aligned select](https://microinteractions.dev/aligned-select/), [Edge-aware tooltip](https://microinteractions.dev/edge-aware-tooltip/), [Drag to reorder](https://microinteractions.dev/drag-reorder/) | Demo đi với giải thích timing, keyboard/touch và mã cài được. Giữ chiều rộng khi đổi nhãn; tab không đẩy chữ; tooltip có chỗ sát mép; drag phải có đường thay thế và không đổi DOM giữa lúc kéo.                                             | `Tabs` đã có indicator; `InlineCopyText` đã có live region và nhãn bền. Kiểm tra layout shift, nhấn nhanh, clipping và feedback lỗi trước; chỉ sửa cái có lợi, không bê timing hay thay Base UI. **P0.2, P1.3, P2.1**.                                                                                                                                                   |
| [Rico — Build the design system and skills your agent can follow](https://x.com/_heyrico/status/2116953958279479760?a=MLxQT3z-M-xrNN58fNc&s=20)                                                                                                                                                                                                                                          | Tách primitives → semantic foundations → components → blocks. Ghi lúc dùng/không dùng, mặc định, ví dụ đúng/sai, trạng thái thật; rút block từ màn hình lặp lại. Quy tắc luôn đọc nên có lý do ngắn, skill chỉ nạp khi làm việc tương ứng.   | Mono đã có 4 block, theme, quy tắc và skill Kumo/Impeccable; docs chưa có chỉ dẫn lựa chọn và ma trận trạng thái thống nhất. Dùng lại Dashboard/Resource list để dạy composition; không liệt kê biến thể chưa tồn tại hoặc để agent tự tạo token. **P1.1, P1.2, P2.2**.                                                                                                  |
| [AI for UI Skills](https://aiforui.dev/skills)                                                                                                                                                                                                                                                                                                                                           | Dùng skill đúng giai đoạn: chọn phương án, thử dữ liệu biên, rồi mới xây và duyệt motion. Xem mục áp dụng bên dưới.                                                                                                                          | Dùng như phương pháp review, không chép cả bộ skill thành quy tắc bắt buộc. Khi tài liệu ngoài gợi ý spring/bounce, giữ quy tắc không bounce/elastic của mono. **P0.2, P1.3, P2.1, P2.4**.                                                                                                                                                                               |
| [Design System Checklist](https://www.designsystemchecklist.com/)                                                                                                                                                                                                                                                                                                                        | Baseline cuối theo bốn lớp: ngôn ngữ thiết kế, nền tảng, component, bảo trì. Một component tồn tại không có nghĩa là mọi trạng thái, tài liệu và hành vi đã có.                                                                              | Phụ lục chấm từng ID và nối với hạng mục hoặc quyết định để ngoài phạm vi. Dùng checklist lại ở cuối mỗi đợt; không coi checklist là yêu cầu thêm mọi component ngoài Kumo.                                                                                                                                                                                              |

Đã đọc hai bài X qua FxTwitter: bài Flo xem các khung hình trong toàn clip; bài Rico đọc các khối nội dung của X Article. Không suy từ clip rằng UI mẫu đã đạt chuẩn a11y. Các kết luận về mono dựa vào mã/tài liệu đã đối chiếu, không phải kết quả kiểm thử mới.

### Cách dùng bộ skill AI for UI

- **Chọn việc:** dùng [pick-ui-library](https://aiforui.dev/skills/pick-ui-library) để so HTML/CSS, Base UI hiện có và gói ngoài trước khi thêm dependency; [prototype](https://aiforui.dev/skills/prototype) để thử lựa chọn khác nhau trong demo cô lập, với dữ liệu thật; [emil-design-eng](https://aiforui.dev/skills/emil-design-eng) để review tổng thể. Dùng animation vocabulary để ghi rõ loại chuyển động, mục đích, thời điểm; không biến thuật ngữ thành yêu cầu thêm hiệu ứng.
- **Thử và sửa:** dùng [break-ui](https://aiforui.dev/skills/break-ui) để thay fixture chứ không sửa markup cho vừa test (rỗng, 1/nhiều mục, chuỗi tiếng Việt dài, thiếu dữ liệu, lỗi/tải chậm); [mobile-native](https://aiforui.dev/skills/mobile-native) để thử touch thật, tránh hover bị kẹt và kiểm tra cuộn/bàn phím ảo; [gestures](https://aiforui.dev/skills/gestures) để thiết kế kéo thả có thể ngắt và có thao tác thay thế.
- **Giới hạn motion:** dùng [find-animation-opportunities](https://aiforui.dev/skills/find-animation-opportunities), [improve-animations](https://aiforui.dev/skills/improve-animations) và [remove-animations](https://aiforui.dev/skills/remove-animations) để phân loại giữ/sửa/bỏ theo tần suất và chức năng; [animate](https://aiforui.dev/skills/animate), [choreograph](https://aiforui.dev/skills/choreograph) để tận dụng token, phối chuyển đổi theo trạng thái, tránh kéo dài chờ; [animation-performance](https://aiforui.dev/skills/animation-performance), [review-animations](https://aiforui.dev/skills/review-animations) để đo frame/layout và duyệt reduced motion/focus/ngắt thao tác. Dùng [learn-taste](https://aiforui.dev/skills/learn-taste) để ghi lại lý do khi một góp ý lặp lại, sau khi owner duyệt. Các skill riêng cho Apple/Expo, trợ lý hỏi đáp và API Sonner không cần cho stack này.

## Lộ trình

Ước tính bằng **ngày công** cả triển khai và kiểm tra, cho một người; chưa gồm thời gian review hay chờ quyết định. P0 ưu tiên sửa luồng hiện có, P1 xây tài liệu và tiêu chuẩn dùng lại, P2 thử block mới và hoàn thiện bảo trì.

| ID   | Hạng mục và nơi làm                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Điều kiện nghiệm thu                                                                                                                                                                                                                                                                                                     | Ngày công |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------: |
| P0.1 | **Tìm → thử → cài.** `app/components/{playground,site-frame,docs-shell,docs-toc}.tsx`, `app/app/docs/[slug]/page.tsx` và not-found UI, `app/content/docs/getting-started.md`: skip link, fallback hash sai và 404 có đường về, mục lục gập trên mobile; đưa cấu hình `registries` dùng URL triển khai thật, lệnh cài và link Demo Button vào một luồng. Thay ví dụ config minh họa chưa đúng schema cài đặt.                                                                                                                                                                                                                        | Tab đầu có lối vào nội dung; hash đúng/back-forward, URL sai và Esc xử lý có chủ đích; 320/390 px không tràn trang; dùng namespace cài được trên app sạch, không dùng URL dev loopback trong docs người dùng.                                                                                                            |       2–3 |
| P0.2 | **A11y, trạng thái khó và baseline visual.** Tái đo baseline `main` bằng Playwright, phân nhóm diff do môi trường, thay đổi có chủ ý hoặc regression; nếu còn lỗi cũ, xử lý bằng PR riêng sau khi rà ảnh. Mở rộng `app/visual/showroom.spec.ts` hoặc spec cùng suite, `app/scripts/a11y-check.mjs`, `app/demos/`: test Search, Dialog/LayerDialog, DatePicker, Field + Input/Checkbox/Radio/Select, Link/Tooltip và Toasty. Chạy fixture dữ liệu biên; rà contrast/label/focus/reflow theo 15 rule ID ở cả showroom và registry, hợp nhất với kế hoạch Kumo. Chuẩn hóa nhãn thao tác 14 px sau khi phân biệt với chỉ mục trang trí. | Axe không có lỗi mới; có bảng keyboard/touch và ít nhất VoiceOver/Safari hoặc NVDA/Firefox cho luồng đại diện (ghi môi trường, kết quả và giới hạn); 320/390 px và desktop, light/dark, tên dài và phóng chữ không mất thao tác. Giữ assertion của #20; báo rõ tình trạng baseline và chỉ chấp nhận đổi ảnh được review. |       4–6 |
| P1.1 | **Catalog dùng được cho người và agent.** `app/lib/props.ts`, `app/components/{playground,component-search,props-table}.tsx`, `app/demos/`: thử với Button, Badge, Field/Select, Dialog, Tabs, Toasty và Resource list. Một nguồn metadata cho mô tả, nhóm, alias tìm kiếm, trạng thái hỗ trợ, ví dụ và link; đề xuất export JSON riêng cho agent, không đổi contract `registry.json`. “Copy for agent” gói lệnh cài, props/default thật, ví dụ ngắn và quy tắc liên quan, không chỉ copy source.                                                                                                                                   | Metadata khớp item/slug/type và demo; test link, tìm qua alias, copy/clipboard lỗi và import ví dụ chạy được; docs ghi lúc dùng/không, ví dụ đúng/sai, anatomy, trạng thái rỗng/lỗi/disabled/loading nếu có. Không ghi API tưởng tượng.                                                                                  |       4–6 |
| P1.2 | **Foundations và cách viết.** `DESIGN.md`, `app/content/docs/theming.md`, thêm hướng dẫn vào `app/content/docs/` và đăng ký ở `app/lib/docs.ts`: bảng vai trò semantic → token tương ứng, contrast theo cặp/mode, type/line length, Grid/breakpoint/spacing, elevation (surface + shadow + lớp portal), tên và quy cách icon; glossary, tone, microcopy lỗi/trống/CTA, ngày/số/chuỗi dài/RTL. Nêu phần nào bảo đảm và phần nào cần app cấu hình.                                                                                                                                                                                    | Ví dụ lấy từ theme và mã hiện hành; giữ `#124b68`, tên/giá trị token và khả năng tùy biến, dùng brand/font hiện có. Vietnamese dài/RTL là case kiểm thử, không ngụ ý site được dịch toàn bộ.                                                                                                                             |       3–4 |
| P1.3 | **Motion phục vụ feedback.** Đọc token trong `packages/tokens/src/themes/default/theme.json` và CSS của `Button`, `Tabs`, `InlineCopyText`, `Loader/SkeletonLine`, `Meter`, `Tooltip`, `Toasty`, `Collapsible`, `Dialog/LayerDialog`, `Select`. Chọn vài thay đổi có bằng chứng: nhãn copy không xô layout, indicator tabs ổn khi đổi nhanh, popover sát mép, spinner SVG có trạng thái tĩnh khi giảm motion. `Meter` dùng transition width, `Tabs` dùng `transition-all`: đo trước khi thu hẹp thuộc tính thay vì cập nhật mù.                                                                                                     | Mỗi motion ghi mục đích, token/timing, khi bị ngắt và fallback tĩnh; test `reducedMotion: 'reduce'`, nhấn nhanh và touch; kiểm tra profile layout/frame trước–sau với thiết bị/lưu lượng cố định. Không thêm motion lib; dùng token và timing mono thay vì nhập nguyên mẫu.                                              |       3–5 |
| P2.1 | **Pilot block File upload.** Demo cô lập trước (`app/demos/file-upload.tsx`, đường dẫn đề xuất). Nếu đạt và có nhu cầu lặp lại ở ít nhất hai bề mặt, mới thêm `packages/registry/src/components/file-upload.tsx` và mục registry; cập nhật danh mục và danh sách item chính xác trong `packages/registry/scripts/e2e-smoke.sh`. Ghép `Field`, Button và Empty; dùng native file picker, `progress` có nhãn hoặc semantics tương đương, trạng thái thông báo có tiết chế; app truyền upload/cancel/retry, không kèm backend hoặc lưu tệp.                                                                                            | Bàn phím/touch không cần kéo; mô phỏng queued/uploading/success/cancel/retry được và lỗi validation không retry; nhiều tệp, tên dài, 320 px, hai theme, reduced motion; retry một tệp không xóa tệp còn lại; test install nếu phát hành.                                                                                 |       4–6 |
| P2.2 | **Recipes và quyết định phần thiếu.** Mở rộng `app/demos/{dashboard,resource-list-page,delete-resource,filter-bar}.tsx` và docs registry với ví dụ phối hợp theo flow thật. Đối chiếu checklist: dùng Collapsible cho disclosure đơn, HTML cho list/divider/image, Banner cho thông báo dài; ghi rõ phần không tương đương. Avatar, carousel và API mới chỉ thành đề xuất riêng khi có use case, không phải điều kiện hoàn thành.                                                                                                                                                                                                   | Có một ví dụ app nhỏ ghép block, test keyboard/narrow/empty/loading/error; mỗi mục thiếu có cách ghép, lý do hoãn hoặc đề xuất kiểm chứng, không mở API mới chỉ để đủ checklist.                                                                                                                                         |       3–5 |
| P2.3 | **Drift và vòng đời.** Cập nhật [manifest Kumo](plans/completed/kumo-source-manifest.json) theo từng mục khi có thay đổi, cùng README, Registry/Validation docs, đề xuất changelog và policy tương thích/browser, cách báo deprecated/migrate. So sánh tên, props, token, license với pin/upstream; lập PR nhỏ cho drift thực sự ảnh hưởng.                                                                                                                                                                                                                                                                                         | Có bảng upstream/local/khác biệt có chủ ý và lịch rà lại; không nhận quàng mọi thay đổi upstream. Chạy smoke install từ item phát hành và ghi thử update cho app đã copy source.                                                                                                                                         |       2–3 |
| P2.4 | **Đóng vòng bảo trì.** Dùng `docs/WORKFLOW.md`, `docs/plans/` và GitHub Issues/PR; đề xuất mẫu bug/feature/review có reproduction, a11y, dark/reduced motion, dữ liệu biên và acceptance. Định nghĩa vai trò reviewer, changelog/link cập nhật, quy tắc khi dùng local recipe và cách gửi feedback.                                                                                                                                                                                                                                                                                                                                 | Ghi quyết định và người review cho một pilot; theo dõi số issue vướng cài/tra cứu trước khi cân nhắc analytics. Không cam kết SLA, lịch trực, office hours hay thu thập telemetry khi chưa có nhu cầu và owner duyệt.                                                                                                    |       2–3 |

Tổng: **27–41 ngày công**. Cắt PR theo ranh giới kiểm chứng: P0.1 độc lập; P0.2 lập ma trận làm nền cho P1.3 (chưa ước tính sửa toàn bộ diff visual cũ); P1.1 dùng API hiện có, phối hợp P1.2 để dùng chung thuật ngữ; P2.1 phụ thuộc P0.2/P1.3 và không chặn các việc P2 khác. Bắt đầu P2.3/P2.4 song song nếu không sửa cùng trang docs. Không mở lại hướng thiết kế hoặc thay màu mà chưa có quyết định của owner.

### Gate cho các PR triển khai

- Showroom: `pnpm --filter app build`, `pnpm --filter app a11y`, `pnpm --filter app visual` và `pnpm --filter app typecheck`; dùng Playwright cho regression theo luồng, review ảnh diff trước khi cập nhật baseline. Ghi các ca kiểm thủ công và chỗ chưa kiểm.
- Registry/token: `pnpm --filter @therealtinhtute/registry validate`, build registry rồi `validate:build` / `e2e`; nếu chạm generator, sinh lại và so theme CSS/item bằng `pnpm --filter @therealtinhtute/tokens generate`. Dùng [Validation](../app/content/docs/validation.md) cho lệnh/CI hiện có và `pnpm lint`, `pnpm -r build` khi phạm vi thay đổi cần.
- Hoàn thành mỗi đợt khi có bằng chứng chạy lệnh, diff hoặc thao tác thật phù hợp với hạng mục; cập nhật những dòng liên quan ở phụ lục, không đánh “có” chỉ vì có file hoặc vì axe không báo lỗi.

## Phụ lục — Design System Checklist

Đối chiếu **230 mục hiển thị** trên bản tiếng Anh: Design language (10), Foundations (26), Core components (166), Maintenance (28). Danh sách ID lấy từ cấu hình của site ([mã nguồn](https://github.com/ardakaracizmeli/design-system-checklist/tree/master/src/data)), đối chiếu với bundle đang phục vụ và nhãn trong payload trang. Giữ thêm hai mục có trong bản dịch nhưng không được cấu hình hiển thị, đánh dấu † (232 dòng cả phụ trội).

**Có** = tìm được hỗ trợ trong mã hoặc tài liệu; **Một phần** = có primitive tương đương, hỗ trợ chưa đầy đủ, hoặc chưa đủ bằng chứng xác nhận hành vi; **Thiếu** = chưa thấy hỗ trợ tương đương ở cấp design system. Đây là đánh giá tĩnh, không chứng nhận accessibility. Với dòng **Có**, hạng mục chỉ việc ghi tài liệu/xác minh giữ nguyên; với dòng **Thiếu**, hạng mục có thể là recipe hoặc ghi lý do hoãn, không hứa mở API hay quy trình mới. ID và tên mục giữ nguyên từ nguồn để tiện đối chiếu.

### Ngôn ngữ thiết kế (Design language)

#### Brand

`PRODUCT.md` có mục đích và nguyên tắc; `DESIGN.md`, `app/public/logo-solid.svg` và các font hiện có cung cấp nhận diện, chưa thành bộ hướng dẫn tài sản.

| ID                     | Mục               | Trạng thái | Hạng mục |
| ---------------------- | ----------------- | ---------- | -------- |
| `dl-brand-vision`      | Vision            | Có         | P1.2     |
| `dl-brand-principles`  | Design principles | Có         | P1.2     |
| `dl-brand-tone`        | Tone of voice     | Thiếu      | P1.2     |
| `dl-brand-terminology` | Terminology       | Thiếu      | P1.2     |
| `dl-brand-assets`      | Brand assets      | Một phần   | P1.2     |

#### Guidelines

Audit, quy tắc Kumo và Validation có hướng dẫn a11y; chưa có chuẩn viết/microcopy/glossary riêng. Một số component có nhãn tùy chỉnh, font hỗ trợ tiếng Việt nhưng chưa có chính sách i18n/RTL.

| ID                          | Mục                  | Trạng thái | Hạng mục |
| --------------------------- | -------------------- | ---------- | -------- |
| `dl-guidelines-a11y`        | Accessibility        | Một phần   | P0.2     |
| `dl-guidelines-writing`     | Writing guidelines   | Thiếu      | P1.2     |
| `dl-guidelines-microcopy`   | Microcopy guidelines | Thiếu      | P1.2     |
| `dl-guidelines-terminology` | Terminology          | Thiếu      | P1.2     |
| `dl-guidelines-i18n`        | Internationalisation | Một phần   | P1.2     |

### Nền tảng (Foundations)

#### Color

Theme có semantic tokens và dark mode; audit đã đo một số cặp, Theming nêu contrast floor nhưng chưa có bảng đầy đủ.

| ID                    | Mục             | Trạng thái | Hạng mục |
| --------------------- | --------------- | ---------- | -------- |
| `df-color-a11y`       | Accessibility   | Một phần   | P0.2     |
| `df-color-semantic`   | Semantic colors | Có         | P1.2     |
| `df-color-dark-mode`  | Dark mode       | Có         | P1.2     |
| `df-color-guidelines` | Guidelines      | Một phần   | P1.2     |

#### Layout

`DESIGN.md` ghi bước 4 px; `Grid` và shell responsive có bố cục hiện hữu, chưa thành chuẩn grid/gutter/breakpoint cho consumer.

| ID                      | Mục         | Trạng thái | Hạng mục |
| ----------------------- | ----------- | ---------- | -------- |
| `df-layout-units`       | Units       | Có         | P1.2     |
| `df-layout-grid`        | Grid        | Một phần   | P1.2     |
| `df-layout-breakpoints` | Breakpoints | Một phần   | P1.2     |
| `df-layout-spacing`     | Spacing     | Một phần   | P1.2     |

#### Typography

`DESIGN.md` ghi thang fluid, tracking, line-height; `app/app/layout.tsx` dùng next/font với swap; chưa có ma trận type-grid/line length hoặc số đo tải font.

| ID                          | Mục            | Trạng thái | Hạng mục |
| --------------------------- | -------------- | ---------- | -------- |
| `df-typography-mobile`      | Responsiveness | Một phần   | P1.2     |
| `df-typography-grid`        | Grid relation  | Một phần   | P1.2     |
| `df-typography-readability` | Readability    | Một phần   | P1.2     |
| `df-typography-performance` | Performance    | Một phần   | P1.2     |
| `df-typography-guidelines`  | Guidelines     | Một phần   | P1.2     |

#### Elevation

Theme/generator có shadow và surface; Dialog/Popover có lớp portal và z-index cục bộ, chưa có thang theo vai trò liên component.

| ID                        | Mục               | Trạng thái | Hạng mục |
| ------------------------- | ----------------- | ---------- | -------- |
| `df-elevation-shadows`    | Shadows           | Có         | P1.2     |
| `df-elevation-background` | Background colors | Một phần   | P1.2     |
| `df-elevation-z`          | Z-index           | Một phần   | P1.2     |

#### Motion

Motion scale có trong DESIGN.md; một số component có reduced motion. Loader dùng SVG animate; không mặc nhiên được media CSS vô hiệu hóa.

| ID                   | Mục           | Trạng thái | Hạng mục |
| -------------------- | ------------- | ---------- | -------- |
| `df-motion-easing`   | Easing        | Có         | P1.3     |
| `df-motion-duration` | Duration      | Có         | P1.3     |
| `df-motion-a11y`     | Accessibility | Một phần   | P1.3     |

#### Iconography

Hugeicons là họ icon thống nhất; `icon-alignment` và audit nhãn nút là nền. Chưa có danh mục icon theo từ khóa hay quy ước dành riêng cho hành động.

| ID                          | Mục                | Trạng thái | Hạng mục |
| --------------------------- | ------------------ | ---------- | -------- |
| `df-iconography-a11y`       | Accessibility      | Một phần   | P0.2     |
| `df-iconography-style`      | Style              | Có         | P1.2     |
| `df-iconography-naming`     | Naming             | Một phần   | P1.2     |
| `df-iconography-grid`       | Relation with grid | Một phần   | P1.2     |
| `df-iconography-keywords`   | Keywords           | Thiếu      | P1.2     |
| `df-iconography-reserved`   | Reserved icons     | Thiếu      | P1.2     |
| `df-iconography-guidelines` | Guidelines         | Một phần   | P1.2     |

### Component cốt lõi (Core components)

#### Accordion

`Collapsible` có trạng thái mở và compound parts; thay thế disclosure đơn, không đồng nghĩa với Accordion nhiều mục.

| ID                          | Mục                          | Trạng thái | Hạng mục |
| --------------------------- | ---------------------------- | ---------- | -------- |
| `c-accordion-active`        | Active state                 | Có         | P1.1     |
| `c-accordion-composition`   | Composition                  | Có         | P1.1     |
| `c-accordion-transition`    | Toggle transition            | Một phần   | P1.3     |
| `c-accordion-a11y-relation` | Content and trigger relation | Một phần   | P0.2     |

#### Alert

`Banner` có variant, title và icon; cần ví dụ secondary action, xác minh responsive và vai trò thông báo theo ngữ cảnh.

| ID                   | Mục                   | Trạng thái | Hạng mục |
| -------------------- | --------------------- | ---------- | -------- |
| `c-alert-colors`     | Colors                | Có         | P1.1     |
| `c-alert-title`      | Title support         | Có         | P1.1     |
| `c-alert-icon`       | Icon support          | Có         | P1.1     |
| `c-alert-actions`    | Supplementary actions | Một phần   | P2.2     |
| `c-alert-responsive` | Responsiveness        | Một phần   | P0.2     |
| `c-alert-a11y-roles` | Accessibility roles   | Một phần   | P0.2     |

#### Avatar

Không có item Avatar. Ghi nhận nhu cầu trước khi mở component; recipe consumer nếu cần.

| ID                        | Mục                 | Trạng thái | Hạng mục |
| ------------------------- | ------------------- | ---------- | -------- |
| `c-avatar-image`          | Image               | Thiếu      | P2.2     |
| `c-avatar-image-fallback` | Image fallback      | Thiếu      | P2.2     |
| `c-avatar-sizes`          | Sizes               | Thiếu      | P2.2     |
| `c-avatar-colors`         | Colors              | Thiếu      | P2.2     |
| `c-avatar-shape`          | Shape               | Thiếu      | P2.2     |
| `c-avatar-group`          | Avatar groups       | Thiếu      | P2.2     |
| `c-avatar-a11y-label`     | Accessibility label | Thiếu      | P2.2     |

#### Badge

`Badge` có variant màu, filled/dot và icon; chưa coi TagInput là dismissible Badge, chưa có API size/empty/position riêng.

| ID                     | Mục                | Trạng thái | Hạng mục |
| ---------------------- | ------------------ | ---------- | -------- |
| `c-badge-colors`       | Colors             | Có         | P1.1     |
| `c-badge-variants`     | Variants           | Có         | P1.1     |
| `c-badge-sizes`        | Sizes              | Thiếu      | P2.2     |
| `c-badge-icon-support` | Icon support       | Có         | P1.1     |
| `c-badge-dismiss`      | Dismissible action | Thiếu      | P2.2     |
| `c-badge-empty`        | Empty state        | Thiếu      | P2.2     |
| `c-badge-positioning`  | Positioning        | Một phần   | P2.2     |

#### Button

`Button` có size/shape/variant/icon/loading/disabled và HTML button; kiểm lại hover/focus và pressed action trong demo. Không đồng nhất active tức thời với toggle.

| ID                    | Mục                | Trạng thái | Hạng mục |
| --------------------- | ------------------ | ---------- | -------- |
| `c-button-colors`     | Colors             | Có         | P1.1     |
| `c-button-variants`   | Variants           | Có         | P1.1     |
| `c-button-sizes`      | Sizes              | Có         | P1.1     |
| `c-button-icon`       | Icon support       | Có         | P1.1     |
| `c-button-hover`      | Hover state        | Một phần   | P0.2     |
| `c-button-active`     | Active state       | Có         | P1.3     |
| `c-button-loading`    | Loading state      | Có         | P1.1     |
| `c-button-disabled`   | Disabled state     | Có         | P1.1     |
| `c-button-a11y-role`  | Accessibility role | Có         | P1.1     |
| `c-button-a11y-focus` | Focus indicator    | Một phần   | P0.2     |

#### Breadcrumbs

`Breadcrumbs` có icon và `aria-current`; cần recipe chuỗi dài/collapse, không mặc định có disabled hoặc separator tùy chỉnh.

| ID                        | Mục              | Trạng thái | Hạng mục |
| ------------------------- | ---------------- | ---------- | -------- |
| `c-breadcrumbs-icon`      | Icon support     | Có         | P1.1     |
| `c-breadcrumbs-disabled`  | Disabled state   | Thiếu      | P2.2     |
| `c-breadcrumbs-collapsed` | Collapsed state  | Một phần   | P2.2     |
| `c-breadcrumbs-separator` | Custom separator | Thiếu      | P2.2     |

#### Calendar

`DatePicker` bọc DayPicker, có mode, ngày chọn và điều hướng tháng; kiểm locale, keyboard và thông báo khi chọn. Ưu tiên DatePicker hiện hành thay lịch đôi deprecated.

| ID                           | Mục                  | Trạng thái | Hạng mục |
| ---------------------------- | -------------------- | ---------- | -------- |
| `c-calendar-modes`           | Display modes        | Có         | P1.1     |
| `c-calendar-selected`        | Selected state       | Có         | P1.1     |
| `c-calendar-month-selection` | Month selection      | Có         | P1.1     |
| `c-calendar-day-names`       | Day names            | Có         | P1.2     |
| `c-calendar-i18n`            | Internationalisation | Một phần   | P1.2     |
| `c-calendar-a11y-keyboard`   | Keyboard navigation  | Một phần   | P0.2     |
| `c-calendar-a11y-state`      | State announcement   | Một phần   | P0.2     |

#### Card

`LayerCard` có compound sections; recipes cần ghi media/action, card group và cách ứng xử ở màn hình hẹp.

| ID                      | Mục                   | Trạng thái | Hạng mục |
| ----------------------- | --------------------- | ---------- | -------- |
| `c-card-composition`    | Content composition   | Có         | P1.1     |
| `c-card-media-sections` | Media sections        | Một phần   | P2.2     |
| `c-card-actions`        | Supplementary actions | Một phần   | P2.2     |
| `c-card-responsive`     | Responsiveness        | Một phần   | P0.2     |
| `c-card-groups`         | Card groups           | Một phần   | P2.2     |

#### Carousel

Không có item Carousel. Không đưa vào scope chỉ để đủ checklist.

| ID                                    | Mục                 | Trạng thái | Hạng mục |
| ------------------------------------- | ------------------- | ---------- | -------- |
| `c-carousel-navigation`               | Navigation controls | Thiếu      | P2.2     |
| `c-carousel-composition`              | Item composition    | Thiếu      | P2.2     |
| `c-carousel-item-size`                | Item sizes          | Thiếu      | P2.2     |
| `c-carousel-touch`                    | Touch navigation    | Thiếu      | P2.2     |
| `c-carousel-responsive`               | Responsiveness      | Thiếu      | P2.2     |
| `c-carousel-a11y-keyboard-navigation` | Keyboard navigation | Thiếu      | P2.2     |

#### Checkbox

`Checkbox` có label, checked, lỗi, disabled và indeterminate; nhóm ghép bằng fieldset/legend, kiểm keyboard.

| ID                         | Mục                 | Trạng thái | Hạng mục |
| -------------------------- | ------------------- | ---------- | -------- |
| `c-checkbox-label`         | Label               | Có         | P1.1     |
| `c-checkbox-checked`       | Checked state       | Có         | P1.1     |
| `c-checkbox-error`         | Error state         | Có         | P1.1     |
| `c-checkbox-disabled`      | Disabled state      | Có         | P1.1     |
| `c-checkbox-indeterminate` | Indeterminate state | Có         | P1.1     |
| `c-checkbox-group`         | Checkbox group      | Một phần   | P2.2     |
| `c-checkbox-a11y-keyboard` | Keyboard support    | Một phần   | P0.2     |

#### Divider

Có separator trong menu và cấu trúc vạch trong UI; chưa có item Divider đa hướng. Recipe ưu tiên HTML `hr` khi đúng ngữ nghĩa.

| ID                    | Mục                | Trạng thái | Hạng mục |
| --------------------- | ------------------ | ---------- | -------- |
| `c-divider-direction` | Direction          | Một phần   | P2.2     |
| `c-divider-a11y-role` | Accessibility role | Một phần   | P2.2     |

#### Dropdown

`DropdownMenu` có compound parts, Base UI Positioner, portal và quản lý input; kiểm mép viewport, zoom, đóng/trả focus; không ép hover-only.

| ID                         | Mục                 | Trạng thái | Hạng mục |
| -------------------------- | ------------------- | ---------- | -------- |
| `c-dropdown-composition`   | Content composition | Có         | P1.1     |
| `c-dropdown-hover`         | Hover trigger       | Một phần   | P2.2     |
| `c-dropdown-positioning`   | Dynamic positioning | Một phần   | P0.2     |
| `c-dropdown-responsive`    | Responsiveness      | Một phần   | P0.2     |
| `c-dropdown-a11y-focus`    | Focus trapping      | Một phần   | P0.2     |
| `c-dropdown-a11y-keyboard` | Keyboard navigation | Một phần   | P0.2     |

#### Icon

Hugeicons cho màu/cỡ qua props hoặc CSS; phân biệt icon trang trí với nút icon cần accessible name.

| ID                       | Mục           | Trạng thái | Hạng mục |
| ------------------------ | ------------- | ---------- | -------- |
| `c-icon-colors`          | Colors        | Có         | P1.2     |
| `c-icon-sizes`           | Sizes         | Có         | P1.2     |
| `c-icon-a11y-decoration` | Interactivity | Một phần   | P0.2     |

#### Image

Có ảnh/logo ở app; chưa có item Image hay recipe chung cho responsive density, fallback và alt.

| ID                 | Mục                    | Trạng thái | Hạng mục |
| ------------------ | ---------------------- | ---------- | -------- |
| `c-image-sizes`    | Sizes                  | Một phần   | P2.2     |
| `c-image-fallback` | Image fallback         | Một phần   | P2.2     |
| `c-image-density`  | Screen density support | Một phần   | P2.2     |
| `c-image-a11y-alt` | Alt text               | Một phần   | P0.2     |

#### Link

`Link` có icon/variant màu/inherit, dùng anchor hoặc adapter; thêm case quấn dòng và hướng dẫn thay link không khả dụng.

| ID                        | Mục                | Trạng thái | Hạng mục |
| ------------------------- | ------------------ | ---------- | -------- |
| `c-link-icon`             | Icon support       | Có         | P1.1     |
| `c-link-colors`           | Colors             | Có         | P1.1     |
| `c-link-disabled`         | Disabled state     | Một phần   | P2.2     |
| `c-link-font-inheritance` | Font inheritance   | Có         | P1.1     |
| `c-link-multiline`        | Multiline display  | Một phần   | P0.2     |
| `c-link-a11y-role`        | Accessibility role | Có         | P1.1     |

#### List

Dùng native `ul`, `ol`, `li` và Resource list recipe; container hiển thị tài nguyên không tự cung cấp một primitive List tổng quát.

| ID                   | Mục                | Trạng thái | Hạng mục |
| -------------------- | ------------------ | ---------- | -------- |
| `c-list-order`       | Order              | Một phần   | P2.2     |
| `c-list-composition` | Content cmposition | Một phần   | P2.2     |
| `c-list-a11y-role`   | Accessibility role | Một phần   | P2.2     |

#### Loading indicator

`Loader` có size, dùng currentColor và `role=status`/nhãn. SVG chạy lặp, chưa có chính sách loading duration hoặc fallback tĩnh đã kiểm.

| ID                                        | Mục                 | Trạng thái | Hạng mục |
| ----------------------------------------- | ------------------- | ---------- | -------- |
| `c-loading-indicator-colors`              | Colors              | Một phần   | P1.1     |
| `c-loading-indicators-sizes`              | Sizes               | Có         | P1.3     |
| `c-loading-indicator-time`                | Loading duration    | Thiếu      | P2.2     |
| `c-loading-indicator-a11y-reduced-motion` | Reduced motion      | Một phần   | P1.3     |
| `c-loading-indicator-a11y-label`          | Accessibility label | Có         | P1.3     |

#### Modal

`Dialog` có compound parts/action/close, size và portal; Base UI quản lý focus/keyboard. Kiểm app có title/description đúng, focus ban đầu và trả focus.

| ID                      | Mục                         | Trạng thái | Hạng mục |
| ----------------------- | --------------------------- | ---------- | -------- |
| `c-modal-composition`   | Content composition         | Có         | P1.1     |
| `c-modal-actions`       | Supplementary actions       | Có         | P1.1     |
| `c-modal-close`         | Close action                | Có         | P1.1     |
| `c-modal-positioning`   | Positioning                 | Có         | P1.1     |
| `c-modal-sizes`         | Sizes                       | Có         | P1.1     |
| `c-modal-a11y-focus`    | Focus trapping              | Một phần   | P0.2     |
| `c-modal-a11y-keyboard` | Keyboard navigation         | Một phần   | P0.2     |
| `c-modal-a11y-labels`   | Title and subtitle labeling | Một phần   | P0.2     |

#### Pagination

`Pagination` có điều khiển trang, thông tin khoảng và page size; chưa có contract đã xác minh cho tổng chưa biết, kiểm đọc trang hiện tại.

| ID                           | Mục                           | Trạng thái | Hạng mục |
| ---------------------------- | ----------------------------- | ---------- | -------- |
| `c-pagination-selected`      | Selected page state           | Có         | P1.1     |
| `c-pagination-ranges`        | Page display ranges           | Có         | P1.1     |
| `c-pagination-amount`        | Amount of items per page      | Có         | P1.1     |
| `c-pagination-indeterminate` | Indeterminate amount of pages | Thiếu      | P2.2     |
| `c-pagination-a11y-label`    | Full page label announcements | Có         | P1.2     |
| `c-pagination-a11y-state`    | State announcement            | Một phần   | P0.2     |

#### Progress bar

Chưa có item đúng ngữ nghĩa progressbar; `Meter` có giá trị/nhãn nhưng không biểu thị tiến độ tác vụ. Pilot dùng native progress có nhãn; đừng gọi Meter là Progress.

| ID                      | Mục                 | Trạng thái | Hạng mục |
| ----------------------- | ------------------- | ---------- | -------- |
| `c-progress-label`      | Label               | Thiếu      | P2.1     |
| `c-progress-sizes`      | Sizes               | Thiếu      | P2.1     |
| `c-progress-duration`   | Duration            | Thiếu      | P2.1     |
| `c-progress-a11y-label` | Accessibility label | Thiếu      | P2.1     |

#### Input radio

`Radio` có label, checked, lỗi, disabled và group; kiểm phím mũi tên/tab. Disabled có trong payload dịch nhưng không nằm trong 230 mục hiển thị.

| ID                      | Mục              | Trạng thái | Hạng mục |
| ----------------------- | ---------------- | ---------- | -------- |
| `c-radio-label`         | Label            | Có         | P1.1     |
| `c-radio-checked`       | Checked state    | Có         | P1.1     |
| `c-radio-error`         | Error state      | Có         | P1.1     |
| `c-radio-disabled` †    | Disabled state   | Có         | P1.1     |
| `c-radio-group`         | Radio group      | Có         | P1.1     |
| `c-radio-a11y-keyboard` | Keyboard support | Một phần   | P0.2     |

#### Select

`Select` có label/lỗi/disabled/placeholder/description, icon và size; demo recipe cho prefix, kiểm accessible name. Sizes có trong payload dịch nhưng không nằm trong 230 mục hiển thị.

| ID                     | Mục                 | Trạng thái | Hạng mục |
| ---------------------- | ------------------- | ---------- | -------- |
| `c-select-label`       | Label               | Có         | P1.1     |
| `c-select-error`       | Error state         | Có         | P1.1     |
| `c-select-disabled`    | Disabled state      | Có         | P1.1     |
| `c-select-placeholder` | Placeholder         | Có         | P1.1     |
| `c-select-helper`      | Helper text         | Có         | P1.1     |
| `c-select-icon`        | Icon support        | Có         | P1.1     |
| `c-select-prefix`      | Prefix              | Một phần   | P2.2     |
| `c-select-sizes` †     | Sizes               | Có         | P1.1     |
| `c-select-a11y-label`  | Accessibility label | Có         | P0.2     |

#### Skeleton

`SkeletonLine` có width/height; chart có skeleton riêng. Hướng dẫn ghép hình, kiểm reduced motion cho các kiểu shimmer.

| ID                       | Mục            | Trạng thái | Hạng mục |
| ------------------------ | -------------- | ---------- | -------- |
| `c-skeleton-sizes`       | Sizes          | Có         | P1.3     |
| `c-skeleton-shapes`      | Shapes         | Một phần   | P1.3     |
| `c-skeleton-composition` | Composition    | Một phần   | P1.3     |
| `c-skeleton-a11y-motion` | Reduced motion | Một phần   | P1.3     |

#### Switch

`Switch` có label, checked/disabled; kiểm bàn phím và tên cho cả switch standalone và switch trong field.

| ID                       | Mục                 | Trạng thái | Hạng mục |
| ------------------------ | ------------------- | ---------- | -------- |
| `c-switch-label`         | Label               | Có         | P1.1     |
| `c-switch-checked`       | Checked state       | Có         | P1.1     |
| `c-switch-disabled`      | Disabled state      | Có         | P1.1     |
| `c-switch-a11y-keyboard` | Keyboard navigation | Một phần   | P0.2     |
| `c-switch-a11y-label`    | Accessibility label | Một phần   | P0.2     |

#### Tabs

`Tabs` có variants, selected và nhãn ReactNode để ghép icon; chưa xác nhận API disabled/equal-width; kiểm keyboard thực tế.

| ID                     | Mục                 | Trạng thái | Hạng mục |
| ---------------------- | ------------------- | ---------- | -------- |
| `c-tabs-composition`   | Content composition | Có         | P1.1     |
| `c-tabs-variants`      | Variants            | Có         | P1.1     |
| `c-tabs-selected`      | Selected state      | Có         | P1.1     |
| `c-tabs-disabled`      | Disabled state      | Thiếu      | P1.1     |
| `c-tabs-icon`          | Icon support        | Một phần   | P1.1     |
| `c-tabs-equal`         | Equal width layout  | Thiếu      | P1.1     |
| `c-tabs-a11y-keyboard` | Keyboard support    | Một phần   | P0.2     |

#### Text area

`InputArea` có variants và ghép Field cho label, trạng thái lỗi, helper; kiểm liên kết tên/description khi dùng độc lập và trong Field.

| ID                        | Mục                 | Trạng thái | Hạng mục |
| ------------------------- | ------------------- | ---------- | -------- |
| `c-text-area-label`       | Label               | Có         | P1.1     |
| `c-text-area-error`       | Error state         | Có         | P1.1     |
| `c-text-area-disabled`    | Disabled state      | Có         | P1.1     |
| `c-text-area-placeholder` | Placeholder         | Có         | P1.1     |
| `c-text-area-helper`      | Helper text         | Có         | P1.1     |
| `c-text-area-sizes`       | Sizes               | Có         | P1.1     |
| `c-text-area-a11y-label`  | Accessibility label | Một phần   | P0.2     |

#### Text field

`Input`, `InputGroup`, `Field` cung cấp label/error/helper, adornment và size; kiểm tên truy cập trong composition.

| ID                         | Mục                 | Trạng thái | Hạng mục |
| -------------------------- | ------------------- | ---------- | -------- |
| `c-text-field-label`       | Label               | Có         | P1.1     |
| `c-text-field-error`       | Error state         | Có         | P1.1     |
| `c-text-field-disabled`    | Disabled state      | Có         | P1.1     |
| `c-text-field-placeholder` | Placeholder         | Có         | P1.1     |
| `c-text-field-helper`      | Helper text         | Có         | P1.1     |
| `c-text-field-icon`        | Icon support        | Có         | P1.1     |
| `c-text-field-affix`       | Prefix / Suffix     | Có         | P1.1     |
| `c-text-field-sizes`       | Sizes               | Có         | P1.1     |
| `c-text-field-a11y-label`  | Accessibility label | Một phần   | P0.2     |

#### Toast

`Toasty` có title/description, variant/icon, timeout/stack của Base UI và action; kiểm focus khi tương tác/xóa và reduced motion.

| ID                    | Mục                  | Trạng thái | Hạng mục |
| --------------------- | -------------------- | ---------- | -------- |
| `c-toast-composition` | Content composition  | Có         | P1.1     |
| `c-toast-colors`      | Colors               | Có         | P1.1     |
| `c-toast-icon`        | Icon support         | Có         | P1.1     |
| `c-toast-timeout`     | Timeout              | Có         | P1.1     |
| `c-toast-stacking`    | Stacking             | Có         | P1.1     |
| `c-toast-action`      | Supplementary action | Có         | P1.1     |
| `c-toast-a11y-focus`  | Focus management     | Một phần   | P0.2     |
| `c-toast-a11y-motion` | Reduced motion       | Một phần   | P1.3     |

#### Tooltip

`Tooltip` có side/offset với Base UI; cần test timeout, focus keyboard và vị trí sát mép.

| ID                        | Mục              | Trạng thái | Hạng mục |
| ------------------------- | ---------------- | ---------- | -------- |
| `c-tooltip-positioning`   | Positioning      | Có         | P1.3     |
| `c-tooltip-timeout`       | Timeout          | Một phần   | P0.2     |
| `c-tooltip-a11y-keyboard` | Keyboard support | Một phần   | P1.3     |

### Bảo trì (Maintenance)

#### Documentation

`DESIGN.md`, Getting started, Validation, Props và demo đã có; cần anatomy/recipes/spec support/release rõ ràng, chưa có sandbox app ghép hoàn chỉnh.

| ID                            | Mục                            | Trạng thái | Hạng mục |
| ----------------------------- | ------------------------------ | ---------- | -------- |
| `m-documentation-principles`  | Design system principles       | Có         | P1.2     |
| `m-documentation-start`       | Getting started                | Có         | P1.1     |
| `m-documentation-design`      | Design best practices          | Một phần   | P1.1     |
| `m-documentation-dev`         | Development best practices     | Một phần   | P1.1     |
| `m-documentation-anatomy`     | Component anatomy              | Một phần   | P1.1     |
| `m-documentation-props`       | Component properties           | Có         | P2.2     |
| `m-documentation-composition` | Component composition examples | Một phần   | P2.2     |
| `m-documentation-sandbox`     | Sandbox product example        | Một phần   | P2.2     |
| `m-documentation-env`         | Browser / OS support           | Thiếu      | P2.3     |
| `m-documentation-release`     | Release cycle                  | Thiếu      | P2.3     |

#### Local libraries

Hiện là registry cộng đồng source-first, chưa có khung cho thư viện local. Viết chính sách nhỏ, không dựng cơ cấu nhiều team khi chưa cần.

| ID                     | Mục                               | Trạng thái | Hạng mục |
| ---------------------- | --------------------------------- | ---------- | -------- |
| `m-local-when`         | When to build                     | Một phần   | P2.4     |
| `m-local-types`        | Horizontal and vertical libraries | Thiếu      | P2.4     |
| `m-local-expectations` | Library expectations              | Thiếu      | P2.4     |
| `m-local-release`      | Release cycle alignment           | Thiếu      | P2.4     |

#### Team processes

`docs/plans/` có decisions và roadmap theo sáng kiến; chưa xác nhận stakeholder map, analytics, phân ca hay SLA.

| ID                      | Mục                      | Trạng thái | Hạng mục |
| ----------------------- | ------------------------ | ---------- | -------- |
| `m-process-log`         | Decision-making log      | Một phần   | P2.4     |
| `m-process-roadmap`     | Roadmap                  | Một phần   | P2.4     |
| `m-process-stakeholder` | Stakeholder mapping      | Thiếu      | P2.4     |
| `m-process-analytics`   | Analytics                | Thiếu      | P2.4     |
| `m-process-shifts`      | Ongoing support "shifts" | Thiếu      | P2.4     |
| `m-process-sla`         | SLA                      | Thiếu      | P2.4     |

#### Community support

GitHub là điểm bắt đầu cho feedback; chưa xác nhận bộ template/cadence/office hours dành riêng cho design system.

| ID                     | Mục              | Trạng thái | Hạng mục |
| ---------------------- | ---------------- | ---------- | -------- |
| `m-community-channels` | Support channels | Một phần   | P2.4     |
| `m-community-template` | Templates        | Thiếu      | P2.4     |
| `m-community-updates`  | Regular updates  | Thiếu      | P2.4     |
| `m-community-slots`    | Open hours       | Thiếu      | P2.4     |

#### Contribution

`AGENTS.md`, Workflow và README có quy trình/lệnh; cần chuẩn hóa đề xuất, setup và ghi nhận đóng góp.

| ID                          | Mục                        | Trạng thái | Hạng mục |
| --------------------------- | -------------------------- | ---------- | -------- |
| `m-contribution-rules`      | House rules for the system | Có         | P2.4     |
| `m-contribution-guidelines` | Contribution guidelines    | Một phần   | P2.4     |
| `m-contribution-template`   | Feature proposal template  | Thiếu      | P2.4     |
| `m-contribution-engagement` | Engagement                 | Thiếu      | P2.4     |
