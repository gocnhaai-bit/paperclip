# Nguồn và giới hạn

Tài liệu lập ngày 2026-09-13 từ yêu cầu người dùng, ảnh concept trong session và audit read-only checkout Paperclip HEAD `0bf841018b3e6ed8843484184a3fdf8569c926d6`.

Đã kiểm tra: AGENTS.md, DESIGN.md, package.json, ui/package.json, ui/src/App.tsx, Layout.tsx và Agents.tsx, SDK types/hooks, create-paperclip-plugin README, CLI plugin source, KPI manifest, runtime compose.yml. Không đọc secret env, không thay source hoặc restart runtime. Runtime config chỉ là bằng chứng cấu hình, không khẳng định service đang dùng đúng cấu hình đó.

Tài liệu không phụ thuộc API Pixel Agents hoặc Opportunity City. Hai nguồn này là cảm hứng trong yêu cầu ban đầu; không có code/assets từ chúng được copy vào gói, không có tuyên bố đã kiểm tra license của chúng. Nếu session sau muốn tái sử dụng, cần audit license/code thực tế riêng. Implementation V1 được định nghĩa độc lập để tránh phụ thuộc không cần thiết.

Ảnh trong references do công cụ tạo ảnh tích hợp tạo trong session thiết kế; đây là concept, không phải screenshots của sản phẩm đã implement. A2 gần ảnh thật được giữ để tham chiếu diện mạo, không phải render style cuối đã chốt. Phải tạo/hoàn thiện asset soft stylized 3D theo phần 6 trước khi nghiệm thu visual cuối.

Kinh nghiệm từ phiên KPI trước được dùng làm checklist giữ nguyên plugin contracts và phân biệt local build với browser acceptance; mọi dependency/runtime phải kiểm tra lại. Đường dẫn install container phải được verify từ môi trường đích, không sao chép một lệnh cũ rồi mặc định thành công.
