---
title: Sử dụng LLM Wiki
summary: Nạp tài liệu, duyệt Wiki, hỏi đáp có dẫn nguồn và tự động tổng hợp dữ liệu Paperclip
---

LLM Wiki biến tài liệu và dữ liệu Paperclip thành một kho kiến thức dạng Markdown có thể duyệt, tìm kiếm và hỏi đáp. Hướng dẫn này áp dụng cho plugin LLM Wiki `v0.1.0`.

Quy trình cơ bản:

```text
Nạp tài liệu → Wiki Maintainer xử lý → Duyệt hoặc hỏi Wiki → Kiểm tra chất lượng → Bật tự động hóa khi cần
```

## Chuẩn bị

Trước khi sử dụng các chức năng AI, mở **LLM Wiki → Settings → Setup** và kiểm tra:

- **Base Folder** ở trạng thái đọc/ghi được và không thiếu tệp hay thư mục.
- **Wiki Maintainer** đã được cấu hình, được phê duyệt nếu cần và không ở trạng thái tạm dừng.
- Các **Managed Skills** đã được cài.
- Project vận hành **LLM Wiki** đang hoạt động.

Nếu Wiki Maintainer đang tạm dừng, mở agent từ phần **Managed Agents** rồi tiếp tục hoạt động của agent. Các thao tác Add Content, Ask và Lint đều cần agent này để xử lý task phía sau.

## Nạp tài liệu

Mở **LLM Wiki → Add Content**. Khi mới bắt đầu, giữ Space là **Default**.

### Thả tệp

1. Thả tệp vào vùng **Drop source files here**.
2. Kiểm tra các tệp chờ nạp.
3. Xác nhận ingest.

Plugin giữ bản nguồn trong thư mục `raw/`, tạo một task vận hành cho Wiki Maintainer và ghi kết quả thành các trang Wiki có thông tin nguồn.

### Dán văn bản hoặc Markdown

1. Nhập **Source title** nếu cần.
2. Dán nội dung vào **Paste markdown / text**.
3. Nhấn **Capture & ingest**.

Đây là cách ổn định để đưa nội dung từ Google Docs, Notion hoặc một trang web vào Wiki.

### Nạp từ URL

Trường URL của `v0.1.0` chưa tự tải nội dung trang. Nếu chỉ nhập URL, plugin lưu địa chỉ nguồn cùng nội dung giữ chỗ.

Để nạp một nguồn trực tuyến:

1. Điền URL để lưu địa chỉ nguồn.
2. Sao chép nội dung nguồn vào **Paste markdown / text**.
3. Nhấn **Capture & ingest**.

Với Google Drive hoặc Google Docs, không nên chỉ nhập đường dẫn chia sẻ và chờ plugin tự đọc tài liệu.

## Theo dõi quá trình xử lý

Mở **LLM Wiki → History** để xem các hoạt động nạp tài liệu, hỏi đáp, lint và tổng hợp Paperclip.

Các trạng thái thường gặp:

- `queued`: đang chờ Wiki Maintainer.
- `running`: đang xử lý.
- `done`: đã hoàn thành.
- `error`: xử lý thất bại; mở hoạt động để xem chi tiết.

Đây là các task vận hành của plugin nên có thể không xuất hiện trong danh sách Tasks thông thường.

## Duyệt Wiki

Mở **LLM Wiki → Wiki** để xem các trang đã tạo và nguồn đã lưu.

Các vị trí chính:

- `wiki/index.md`: mục lục Wiki.
- `wiki/projects/<project-slug>/standup.md`: trạng thái hiện tại của dự án.
- `wiki/projects/<project-slug>/index.md`: kiến thức lâu dài của dự án.
- `wiki/concepts/`: khái niệm và quy trình.
- `wiki/entities/`: người, tổ chức, hệ thống hoặc sản phẩm.
- `wiki/synthesis/`: nội dung tổng hợp từ nhiều nguồn.
- `wiki/log.md`: nhật ký cập nhật Wiki.

Có thể đọc các tệp Markdown trực tiếp trong Wiki root. Khi chỉnh sửa nội dung, nên dùng giao diện hoặc Wiki Maintainer để metadata, backlinks và mục lục được cập nhật đồng bộ.

## Hỏi Wiki

Sau khi ít nhất một nguồn đã được xử lý, mở **LLM Wiki → Ask** và đặt câu hỏi cụ thể, ví dụ:

```text
Quy trình triển khai hiện tại gồm những bước nào? Hãy dẫn nguồn.
```

```text
Những quyết định quan trọng nào đã được đưa ra cho dự án CRM?
```

```text
So sánh yêu cầu trong tài liệu A và tài liệu B.
```

Mỗi câu hỏi tạo một task vận hành cho Wiki Maintainer. Agent tìm trong các trang và nguồn thuộc Space đang mở rồi trả lời trong giao diện.

Nếu câu trả lời chứa kiến thức ổn định, có thể lưu nó thành một trang như:

```text
wiki/concepts/deployment-process.md
```

Không nên lưu mọi câu trả lời thử nghiệm vì chúng có thể tạo nội dung trùng lặp hoặc nhanh lỗi thời.

## Kiểm tra chất lượng

Mở **LLM Wiki → Lint** để tìm:

- Trang không được liên kết.
- Liên kết Wiki bị hỏng.
- Nội dung thiếu nguồn.
- Nội dung tổng hợp đã lỗi thời.
- Nội dung trùng hoặc mâu thuẫn.
- Mục lục không còn khớp với các trang hiện tại.

Nên chạy lint sau khi nạp một nhóm tài liệu hoặc sau một đợt cập nhật lớn, thay vì chạy sau từng tệp.

## Tổng hợp dữ liệu Paperclip

LLM Wiki có thể tổng hợp task, comment, issue document và trạng thái project vào **Default Space**.

### Tổng hợp dữ liệu hiện có

Mở **Settings → Distillation**:

1. Chọn **Enable for active projects**.
2. Nhấn **Distill now** để chạy thử.
3. Xem kết quả trong **History**.

Quá trình này duy trì các trang trạng thái và kiến thức dự án dưới `wiki/projects/`.

Ở `v0.1.0`, dữ liệu Paperclip chỉ được tổng hợp tự động vào Default Space.

### Thu thập thay đổi mới

Mở **Settings → Ingestion Settings**, bật event ingestion cho công ty rồi chọn nguồn:

- Issues.
- Comments.
- Documents.

Thiết lập khởi đầu nên dùng **Issues + Documents** và tạm tắt **Comments**. Comment thường chứa trao đổi tạm thời và có thể làm Wiki nhiễu; chỉ bật khi chúng thực sự chứa kiến thức cần giữ.

Nội dung attachment và work product chưa được đọc trực tiếp trong luồng này.

## Bảo trì định kỳ

Mở **Settings → Managed Routines**. Nếu routine còn thiếu, dùng **Fix routines** để tạo:

- **Cursor window processing**: xử lý thay đổi Paperclip theo từng đợt.
- **Nightly Wiki lint**: kiểm tra Wiki định kỳ.
- **Index refresh**: làm mới `wiki/index.md`.

Các routine có thể được tạo ở trạng thái tạm dừng. Chỉ bật sau khi ingest, Ask và Distill now đã chạy thành công. Mỗi lần chạy routine sử dụng agent và có thể phát sinh chi phí model.

## Sử dụng Space

Space tách nguồn và trang thành các kho kiến thức riêng, ví dụ Engineering, Marketing hoặc Internal Policies.

Giữ **Default Space** khi mới bắt đầu. Chỉ tạo Space mới khi cần tách nội dung, quyền truy cập hoặc đội phụ trách. Trong `v0.1.0`, các Space khác chủ yếu phù hợp cho tài liệu nạp thủ công; tổng hợp tự động từ Paperclip vẫn ghi vào Default Space.

## Bài kiểm tra đầu tiên

Nạp một nguồn có tiêu đề `SMIT Company Overview` với nội dung:

```md
# SMIT Company

SMIT xây dựng hệ thống AI hỗ trợ quản lý và tự động hóa công việc.

## Mục tiêu

- Tập trung tri thức dự án.
- Giảm công việc lặp lại.
- Giữ quyết định và quy trình có dẫn chứng.

## Nguyên tắc

- Dữ liệu quan trọng phải có nguồn.
- Không biến nội dung tạm thời thành kiến thức lâu dài.
```

Sau khi History báo hoàn thành, hỏi:

```text
Mục tiêu và nguyên tắc hoạt động của SMIT là gì? Hãy dẫn nguồn.
```

Nếu câu trả lời đúng và có nguồn, luồng ingest và Ask cơ bản đã hoạt động.

## Lộ trình triển khai khuyến nghị

1. Bật Wiki Maintainer.
2. Giữ Default Space.
3. Nạp 2–3 tài liệu.
4. Kiểm tra History đến khi hoàn thành.
5. Duyệt các trang đã tạo.
6. Hỏi 3–5 câu và kiểm tra nguồn.
7. Chạy lint một lần.
8. Bật distillation cho active projects.
9. Chạy Distill now.
10. Bật event ingestion cho Issues và Documents.
11. Tạo rồi bật từng routine cần thiết.
