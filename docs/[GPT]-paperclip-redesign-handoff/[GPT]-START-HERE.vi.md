# Khởi động session Codex mới

Chọn model gpt-5.6-luna trong session mới. Copy toàn bộ gói này vào folder bạn muốn, hoặc mở workspace có quyền truy cập Paperclip host và repo plugin mới. Dán prompt dưới đây, sửa đường dẫn tài liệu nếu đã di chuyển.

## Prompt bàn giao

Hãy thực hiện toàn bộ kế hoạch trong `[GPT]-IMPLEMENTATION-PLAN.vi.md` nằm cùng file này. Mục tiêu là redesign toàn bộ UI Paperclip theo Warm Workspace và xây Agent Studio thành plugin Paperclip trong repository riêng, tích hợp vào host ở môi trường dev.

Đọc tài liệu đầy đủ và xem ảnh trong references trước khi code. Quyết định đã chốt: nền kem/sage; nhân vật Creative Casual A2 nhưng giảm realism thành soft stylized 3D, đồng nhất portrait với office. Các ảnh có dữ liệu mẫu chỉ dùng tham khảo thiết kế. Không hardcode chúng thành dữ liệu production.

Host hiện ở `/Users/dominium/Projects/paperclip`; plugin mới dự kiến `/Users/dominium/Projects/[GPT]-paperclip-agent-studio`. Repo KPI Dashboard chỉ để tham khảo SDK integration, không phải chỗ viết lại host hoặc chứa source Agent Studio. Nếu đường dẫn không tồn tại, khám phá workspace để xác định lại; chỉ hỏi khi không thể xác định được.

Bắt đầu P0, bảo toàn mọi thay đổi chưa commit, kiểm tra AGENTS/versions/routes/SDK và lập checkpoint. Làm tuần tự P0–P8, chia patch nhỏ, test đúng phạm vi, cập nhật PROGRESS sau mỗi phase. Tự tiếp tục công việc được phép, không dừng ở việc đưa ra một plan mới và không hỏi lại các quyết định thiết kế đã chốt.

Giữ nguyên permissions, APIs và nghiệp vụ Paperclip. Plugin chỉ đọc hoạt động và liên kết sang host; không tạo agent/task giả, không mô phỏng trạng thái làm việc. Không sửa/xóa dữ liệu thật. Triển khai kiểm thử trên môi trường riêng; trước thay runtime phục vụ công việc thật, chuẩn bị release/rollback cụ thể rồi xác nhận target nếu chưa được ủy quyền.

Nếu thiếu image tool hoặc asset cuối, tiếp tục phần kỹ thuật độc lập, ghi rõ asset blocker; không gọi placeholder là hoàn tất. Nếu thiếu browser/auth, ghi browser verification chưa thực hiện. Kết quả cuối phải có source, asset manifest, route coverage, kết quả checks, ảnh kiểm thử và runbook install/update/disable/rollback cho plugin cùng host UI.

## Nội dung gói

- IMPLEMENTATION-PLAN: đặc tả và lộ trình thực thi hoàn chỉnh.
- references: 7 ảnh thiết kế/kiểm tra; tên và vai trò từng ảnh ghi trong plan.
- SOURCE-NOTES: nguồn local và phạm vi kiểm chứng khi lập tài liệu.

Không cần session mới đọc toàn bộ hội thoại cũ. Không bắt đầu production deploy chỉ từ việc đọc prompt này.
