# Paperclip Warm Workspace — kế hoạch triển khai UI và Agent Studio

Ngày: 2026-09-13. Người thực hiện dự kiến: Codex, model gpt-5.6-luna. Đây là tài liệu bàn giao để triển khai trong session khác; session tạo tài liệu chưa thay UI, chưa cài plugin, chưa triển khai runtime.

## 1. Kết quả cần đạt và quyết định đã chốt

Thiết kế lại toàn bộ giao diện Paperclip theo phong cách Warm Workspace: nền kem, trắng ấm, xanh sage, chữ navy, bố cục sáng và gọn, nhân vật có cá tính. Giữ Paperclip là công cụ vận hành: người dùng phải nhanh chóng hiểu việc gì đang diễn ra, điều gì cần xử lý, và hành động tiếp theo.

Agent Studio là một plugin Paperclip ở repository riêng. Không phải plugin Codex. Không nhét source plugin vào repo Paperclip hoặc repo KPI Dashboard. Thiết kế lại shell và các trang native vẫn thực hiện trong repo Paperclip; plugin không thể thay toàn bộ giao diện host chỉ bằng CSS của một trang.

Nhân vật: lấy diện mạo và thời trang A2 Creative Casual, rồi giảm độ chân thật. Giữ hoodie, mũ, kính, tóc, phụ kiện và biểu cảm trẻ trung. Dùng nhân vật 3D cách điệu, chất liệu matte, hình khối mềm, ít chi tiết da/tóc, đầu lớn hơn nhẹ, mắt/lông mày dễ đọc. Cùng một nhân vật phải thống nhất giữa portrait, card, sidebar và office. Không sử dụng chân dung gần như ảnh người mẫu A2 làm bộ asset cuối cùng.

Phạm vi đã được người dùng cho phép: lập và thực hiện redesign, xây plugin riêng, tích hợp vào môi trường kiểm thử. Không cần hỏi lại màu sắc, layout, stack cơ bản hoặc các bước phát triển có thể hoàn tác. Việc thay runtime đang phục vụ công việc thật phải có một bước release riêng với target, backup và cách rollback cụ thể.

Không được hiểu ảnh concept là yêu cầu xóa các trang không xuất hiện trong ảnh. Không đổi nghiệp vụ, permissions, authentication, adapter, agent execution, budget enforcement, approvals hoặc dữ liệu chỉ để giống mockup.

## 2. Cách dùng gói bàn giao

Copy cả folder này sang nơi làm việc mới. Giữ thư mục `references/` đi cùng tài liệu. Đọc file START-HERE trước, rồi tài liệu này. Không phụ thuộc lịch sử hội thoại.

Các đường dẫn nguồn tại máy đã kiểm tra:

| Mục | Đường dẫn |
|---|---|
| Paperclip host | `/Users/dominium/Projects/paperclip` |
| KPI plugin hiện hữu, chỉ tham khảo | `/Users/dominium/Projects/paperclip-kpi-dashboard` |
| Runtime cấu hình | `/Users/dominium/Projects/paperclip-runtime/compose.yml` |
| Runtime data, không dùng cho test | `/Users/dominium/Projects/paperclip-data` |
| Repo plugin mới, đường dẫn đề xuất | `/Users/dominium/Projects/[GPT]-paperclip-agent-studio` |

Nếu máy/folder thay đổi, tìm lại repo từ package.json, không tạo một bản Paperclip giả trong thư mục tài liệu. Các tên module bên dưới là trách nhiệm logic, cần tuân theo convention của repo khi tạo file. Các tài liệu/asset mới dùng tiền tố `[GPT]`; không đổi tên file nguồn hiện hữu. Với tên file bắt buộc bởi tooling như package.json, giữ tên chuẩn.

## 3. Bằng chứng source và giới hạn audit

Host HEAD khi lập plan: `0bf841018b3e6ed8843484184a3fdf8569c926d6`. Phải kiểm tra lại trước khi làm. Working tree có sửa chưa commit ở:

- `ui/src/components/CompanySettingsSidebar.test.tsx`
- `ui/src/components/Sidebar.test.tsx`
- `ui/src/components/primary-sidebar-styles.ts`

Không reset, stash tự động, overwrite hoặc gom những thay đổi này vào commit của mình. Đọc diff, giữ nguyên intent, chọn worktree/branch phù hợp với baseline cần dùng. Nếu làm từ HEAD sạch, ghi rõ các sửa chưa commit chưa được mang sang và cần tích hợp trước release. Branch mới dùng tiền tố `codex/`.

Đã đọc `AGENTS.md`, `DESIGN.md`, package scripts, App routes, SDK hooks/types, manifest KPI, scaffold README và compose. Đây là audit source cho plan, chưa phải bằng chứng browser/runtime hoạt động. Thư viện trong checkout thay đổi theo thời gian; pin phiên bản theo lockfile được kiểm tra ở phase 0, không chọn latest tùy ý.

Host dùng React/Vite/TypeScript/Tailwind v4. UI package `@paperclipai/ui`; engine của UI yêu cầu Node >=24.11.0. Token root thực tế là `ui/src/index.css`, không phải tailwind.config. SDK ở `packages/plugins/sdk`, không phải `packages/plugin-sdk`.

`DESIGN.md` còn có ràng buộc “zero visual change / no visual redesign” của đợt simplification cũ. Yêu cầu người dùng trong tài liệu này cho phép redesign. Cập nhật DESIGN.md trước để ghi phạm vi redesign mới, giữ các quy tắc token, semantics và hierarchy; không để Luna dừng vì hiểu nhầm ràng buộc của đợt cũ. Không viết lại toàn bộ lịch sử tài liệu.

## 4. Thứ tự tham chiếu thiết kế

1. Quyết định bằng lời trong phần 1 và các quy tắc dữ liệu trong tài liệu này.
2. `references/[GPT]-01-overview.png`, `03-tasks`, `04-project-detail`: định hướng bố cục và màu.
3. `references/[GPT]-08-agents-creative-casual.png`: cách đặt portrait trong card, nhưng giảm realism của portrait.
4. `references/[GPT]-07-agent-identities-creative-casual.png`: nhận diện, trang phục, biểu cảm; không phải render style cuối.
5. `references/[GPT]-09-agent-studio-a2-compatibility.png`: kết quả thử A2 vào office, giúp thấy vấn đề quá thật.
6. `references/[GPT]-00-agent-studio-original.png`: kiến trúc office, ánh sáng, sắc độ, tỷ lệ UI.

Các ảnh là concept bằng AI, có tên, task, cost và status mẫu. Không nhập chúng vào DB, không hardcode thành nội dung production. Bộ sáu tên Maya/Alex/Linh/Noah/Sofia/Theo chỉ là tên archetype thiết kế, không phải danh sách agent phải tạo. Nếu ảnh sai typography, số học, UI state hoặc thiếu chức năng, code phải dùng dữ liệu và hành vi đúng.

## 5. Chuẩn giao diện

### 5.1 Token và cấu trúc

Đề xuất palette khởi điểm, chỉ khai báo trong token layer, điều chỉnh để đạt contrast: canvas `#FAF8F4`, surface `#FFFFFF`, sidebar `#F5F2EB`, text chính `#172334`, secondary `#586170`, primary sage `#506F5B`, selected `#E4EBDD`, border `#DADDD5`. Đây là điểm bắt đầu, không thay toàn bộ semantic status tokens bằng sage.

Giữ font sans hiện hữu nếu hỗ trợ đầy đủ tiếng Việt; không thêm font tải ngoài không cần thiết. Heading phân cấp 28–32/20–24/16–18; body 14–16; metadata không dưới 12. Các số này là hướng thiết kế để ánh xạ token, không inline CSS. Numbers/logs dùng formatting và monospace token hiện có.

Spacing scale mục tiêu 4/8/12/16/24/32. Radius controls 8, cards 12, portrait 12–16; token hóa và kiểm tra trước khi chuẩn hóa các giá trị cũ. Border mảnh, shadow nhẹ chỉ cho lớp nổi. Không biến mọi section thành một card có border lồng nhau. Một CTA chính trên một vùng hành động, secondary dùng outline hoặc text.

Giữ dark mode hiện có: phát triển semantic overrides đồng thời, nền than ấm, surface tách rõ, sage đạt contrast. Không ép portrait sáng thành âm bản; dùng background trung tính và silhouette rõ. Không tuyên bố dark mode hoàn tất chỉ vì CSS compile.

### 5.2 Shell và interaction

Giữ company selector, contextual sidebar, account menu, breadcrumb, search, keyboard shortcuts và deep links. Sidebar compact, icon nhất quán, vùng active sage. Không copy sidebar rút gọn trong ảnh rồi xóa navigation hiện hữu. Shared primitives hiện tại là nơi sửa trước, tránh tạo ButtonV2/CardV2 song song.

Desktop: header + filters rõ thứ bậc, nội dung chiếm chiều rộng hợp lý. Tablet: sidebar collapse, card chuyển 2 cột. Mobile: nav hiện hữu được giữ, cards 1 cột, table có giải pháp cuộn hoặc compact row, panel thành sheet. Không để body cuộn ngang. Dialog, menu, tooltip và focus ring đều cùng hệ token.

Accessibility: text contrast >=4.5:1 cho chữ thông thường, focus rõ, status luôn có text/icon ngoài màu, icon-only button có accessible name. Tab/Shift+Tab/Escape hoạt động; dialog trap/restore focus. Respect prefers-reduced-motion. Không hiển thị toast lặp cho trạng thái đã rõ tại chỗ.

### 5.3 Phủ toàn bộ trang

Phase 0 xuất bảng tất cả routes từ `ui/src/App.tsx`, kể cả nested, redirects, feature flags và plugin routes. Với mỗi route ghi file thực sự render, dữ liệu chính, actions, layout family, và tình trạng kiểm thử. Kiểm tra import graph và feature flags vì repo có file `.production.tsx`; không đoán cứ file giống tên là trang đang dùng.

| Nhóm | Thay đổi nhìn thấy | Hành vi phải giữ |
|---|---|---|
| Dashboard/Overview, Live | KPI cấp cao, việc cần xử lý, activity gọn; không wall-of-cards | source metrics, filters, live state |
| Agents, Org, Agent detail, Run | Cards/list, portrait thống nhất, detail rõ task/run/status | tất cả tabs, agent actions, logs, configuration, permissions |
| Tasks (Issues), My work, detail | List/board hiện có, filter bar, priority rõ, thread đọc tốt | assignment, checkout, comments, attachments, links, approvals |
| Projects/detail, Goals/detail | mục tiêu, tiến độ thật, owners, task list | views, edit flows, workspace links |
| Approvals, What needs me, queues | pending items ưu tiên, decision context | mọi bước duyệt và xác nhận hiện hữu |
| Costs/budgets | con số chính, breakdown, cảnh báo có nghĩa | precision, currency, hard-stop semantics |
| Apps, connections, gateways, tools | form/tabs/tables cùng visual language | connect/auth, secret entry, permissions, error recovery |
| Skills, catalogs, routines, pipelines, cases, artifacts, audit | áp template list/detail/editor phù hợp | mỗi action/tab thực tế, file viewer, run history |
| Company/instance/settings, members, secrets, plugins/adapters | form sections rõ, điều hướng đầy đủ | access guards, sensitive fields, plugin management |
| Auth/onboarding/search/not found/error/loading | cùng typography, controls, empty states | auth callback, validation, retry, redirects |
| KPI và plugin hiện hữu | kế thừa host tokens và controls; audit contrast/layout | giữ plugin IDs, exports, routes, bridges và dữ liệu |

Các nhóm là checklist tối thiểu; inventory thực tế quyết định coverage đầy đủ. Không ghi “toàn bộ UI xong” nếu chỉ hoàn tất bốn mockup.

## 6. Hệ nhân vật và quy trình asset

### 6.1 Art direction cuối

Tên hướng: Creative Casual / Soft Stylized 3D. Người trưởng thành trẻ, tỷ lệ khoảng 4.5–5.5 đầu khi đứng, lớn đầu nhẹ so với người thật nhưng không chibi 2–3 đầu. Hair dạng khối có vài lọn lớn, da matte mịn, không pores/photographic skin. Mắt và lông mày có hình rõ, biểu cảm vui/tò mò/tập trung; không tất cả cùng cười hoặc cùng khuôn mặt. Trang phục có 1–2 điểm nhận diện đọc được ở kích thước nhỏ, tránh chi tiết li ti.

Giữ sáu archetype A2: strategy sage/pixie; engineering hoodie/cap; content sky blue/bob; research sand/curls/glasses; design lavender/blonde bob; operations navy/polo/glasses. Role không quyết định giới tính, sắc tộc hoặc năng lực. Cho phép đổi visual preset mà không đổi role nghiệp vụ. Chân dung tùy chỉnh hiện hữu của user được ưu tiên nếu có.

### 6.2 Asset pack bắt buộc

Tạo trước một nhân vật Sofia làm vertical slice: portrait 512, avatar 128, seated office sprite transparent ở góc camera dự kiến, idle và working. Kiểm tra side-by-side với office ở viewport thực, rồi mới nhân rộng sáu nhân vật. Không cần xin lại định hướng; sửa đến khi đạt checklist trong phần này.

Mỗi preset cuối có portrait, avatar nhỏ, seated idle/working, metadata crop/anchor/scale và các hướng ngồi cần cho layout. Có thể dùng sprite flip khi không làm sai phụ kiện bất đối xứng; otherwise xuất góc riêng. States error/paused/waiting biểu thị bằng UI marker, không cần dựng nhiều tư thế không có ý nghĩa. Floor/furniture tách lớp để xử lý che khuất đúng. File asset có manifest version, nguồn/quyền dùng, dimensions và license ghi rõ.

Ưu tiên render 2.5D từ asset tạo sẵn: không bắt Luna tự model/rig người như ảnh bằng hàng trăm khối CSS. Image generation chỉ tạo bitmap, không tự biến thành mesh/rig 3D. Nếu dùng image tool, phải inspect chất lượng, alpha, hands, mặt, góc ngồi và consistency. Không hứa chuyển ảnh thành animation tự động. Nếu tool không có, dùng approved/source assets làm preview có nhãn, hoàn tất kỹ thuật độc lập, ghi asset cuối là blocker; không coi placeholder là hoàn tất thiết kế.

Prompt mẫu cho asset artist/image tool: “Create the same youthful character identity and creative casual outfit as the supplied A2 reference, as a soft stylized 3D adult miniature for Paperclip's warm ivory and sage isometric office. Matte sculpted surfaces, simplified hair clumps, slightly enlarged head, expressive brows and eyes, no photographic skin, no heavy outlines, no childlike chibi proportions. Keep the same face, hairstyle and outfit across portrait and seated view. Match office camera and warm upper-left soft lighting. No UI text, no logos. Export the requested individual asset with clean transparent background.” Bổ sung góc/crop/trạng thái cụ thể cho từng lần; không lấy ảnh UI làm sprite.

### 6.3 Identity đồng nhất giữa host và plugin

Không có shadow agent registry. Khóa danh tính là companyId + agentId; mặc định chọn preset bằng stable hash có version, không theo index danh sách hoặc tên có thể đổi. Không đổi avatar mỗi render. Unknown/new role vẫn có fallback đúng style. Mapping chỉ là presentation metadata.

Giải pháp tối thiểu: asset manifest và resolver pure dùng chung được version hóa, source sở hữu trong repo plugin, build thành artifact/package chỉ chứa data/assets/resolver. Host nhập artifact có pin version hoặc dùng bản vendored có script sync + checksum; chọn một cách ở phase 0 và ghi ADR. Không import source host vào plugin. Avatar host vẫn chạy khi plugin disable/uninstall. Chưa thêm UI chỉnh avatar hoặc schema DB nếu không cần; nếu sau này có override dùng cơ chế settings đã kiểm chứng, company-scoped, không tự sửa agent metadata ngoài contract.

## 7. Agent Studio: chức năng và kiến trúc

### 7.1 Phạm vi V1

Một office layout đẹp theo ảnh, sáu chỗ mỗi room, agent selection, hover/focus label, detail panel, project filter, search, zoom/pan/reset, reduce motion, list view. Tự phân trang room khi >6 agents, giữ seat assignment ổn định bằng ID; không xếp 100 bàn vào một canvas. Có empty/loading/error/stale/disconnected. Mobile mặc định list view, office là lựa chọn với toolbar dễ chạm.

Click agent xem tên thật, role thật, run status, task/project nếu có liên kết. Open task/Open run dùng deep link của host. Không cung cấp start/stop/pause execution trong V1; tới trang host để dùng hành động được kiểm soát sẵn. Layout editor, multiplayer avatars, chat bubbles giả, đi lại/mở họp tự diễn, 3D camera tự do, gamification và 3D realtime engine là phase sau, không điều kiện hoàn tất V1.

### 7.2 Renderer được chọn

React + TypeScript, scene 2.5D dùng layered transparent images trong container có transform; các hit targets là DOM buttons accessible. Dùng floor/furniture layers và character sprite có tọa độ/anchor theo scene manifest, z-order theo depth. Không dùng cả ảnh screenshot có sẵn người làm background rồi chồng người lần nữa. Tọa độ thuộc scene data, không rải magic numbers trong components. Canvas/WebGL không bắt buộc ở V1; chỉ chuyển renderer khi profiling chứng minh vấn đề và ghi ADR. Điều này giảm độ phức tạp cho Luna mà vẫn giữ chất lượng artwork.

SceneModel độc lập React và API. React data adapter tạo model từ snapshot. Renderer không tự fetch, không biết credentials, không tự quyết định run state. Cảnh lazy-load; giữ list/detail hoạt động khi asset fail. Asset lỗi hiện neutral silhouette cùng tên, không biến mất agent.

### 7.3 Data contract nội bộ dự kiến

Đây là contract plugin cần định nghĩa, không phải API Paperclip đã tồn tại:

```ts
type StudioSnapshot = {
  companyId: string;
  fetchedAt: string;
  sourceUpdatedAt?: string;
  revision?: string;
  freshness: 'fresh' | 'stale' | 'unavailable';
  agents: StudioAgent[];
};
type StudioAgent = {
  id: string;
  name: string;
  roleLabel: string | null;
  lifecycleStatus: string;
  activity: 'running' | 'queued' | 'waiting' | 'idle' | 'unknown';
  presetId: string;
  currentRun: { id: string; status: string } | null;
  currentTask: { id: string; title: string } | null;
  project: { id: string; name: string } | null;
};
```

Giữ lifecycle riêng với activity: paused/error của agent và terminal/error của run không đồng nghĩa. Mapping status phải dựa enums và APIs thực tế; không tự phát minh upstream “waiting” nếu chỉ có idle. Không có task liên kết thì null, không chọn một task bất kỳ được assign rồi gọi current task. Nếu nhiều run đồng thời, chọn theo quy tắc documented và hiển thị số run thêm; task filter không được suy ra mọi agent làm trong project đó từ role/name.

Dữ liệu từ SDK worker: kiểm tra `ctx.agents`, `ctx.issues`, `ctx.projects` và orchestration read trong `packages/plugins/sdk/src/types.ts`. UI dùng `useHostContext`, `usePluginData`, `useHostNavigation` từ `@paperclipai/plugin-sdk/ui`. Host SDK capabilities/actor scoping quyết định quyền; kiểm tra companyId ở boundary, không tin params UI vô điều kiện. Không raw SQL, không browser-held API key, không CORS workaround, không đọc folder data.

Manifest dự kiến id `dominium.paperclip-agent-studio`, routePath `agent-studio`, page export `AgentStudioPage`, sidebar export `AgentStudioSidebar`. Xác nhận chưa collision. Capabilities bắt đầu `ui.page.register`, `ui.sidebar.register`, `agents.read`; thêm quyền read issues/projects/events chỉ khi handler thực sự dùng và tên capability có trong SDK. Không copy `secrets.read-ref` của KPI. Không xin quyền pause/invoke/create agents.

Data flow: host SDK -> worker read adapter -> validated normalized snapshot -> usePluginData -> reducer -> scene/list/detail. Khởi đầu poll có refresh (khoảng 5 giây khi tab visible), pause khi hidden, backoff khi lỗi, stale sau khoảng 15 giây không có fetch thành công. Các mốc là cấu hình và phải kiểm tra tải. Không gọi N+1 trên toàn bộ task history; chỉ query scope cần, paginate và cap. Nếu SDK cung cấp stream phù hợp, dùng invalidation + refetch, không xây hệ event riêng. Khi reconnect luôn tải snapshot mới, bỏ response cũ của company trước, chống out-of-order bằng request generation/revision.

Running animation chỉ bật khi có run đang chạy được xác nhận và snapshot fresh. Mất kết nối dừng activity animation, giữ last known state có nhãn, không đổi thành idle. Thở/blink nếu có là decorative motion, không được diễn giải thành agent đang làm việc. Never fabricate typing progress, tokens, messages hoặc tác vụ.

### 7.4 Ranh giới source plugin

Tách các module nhỏ: manifest; worker; host adapter; status normalization; snapshot types; UI page; list/detail; office renderer; seat allocation; asset manifest/resolver; SDK test harness. Mỗi module có một trách nhiệm, tránh file UI khổng lồ. Pure functions cho status, seats, filters được test độc lập. Worker không chứa React; UI không import server modules. Bundle qua SDK presets, React/SDK đúng shared runtime, không bundle thêm bản React gây invalid hooks.

## 8. Đấu nối repo riêng với Paperclip

1. Đọc `packages/plugins/create-paperclip-plugin/README.md` và CLI help ở checkout thật. Scaffold ngoài repo qua generator địa phương; pin SDK từ `packages/plugins/sdk` theo cơ chế `.paperclip-sdk` tarball được scaffold hỗ trợ. Không dùng `workspace:*` để trỏ từ repo riêng mà không có workspace tương ứng.
2. Chạy install/typecheck/test/build của plugin, verify manifest và entrypoint files trong dist. Dùng SDK test harness để preview; sample data chỉ trong tests/Storybook có nhãn.
3. Native dev host: cài plugin bằng đường dẫn tuyệt đối mà server đọc được, qua CLI hoặc Plugin Manager hiện hữu. Đọc `pnpm paperclipai plugin --help` và `... install --help` trước khi dùng; xác nhận host URL/company. Không đoán flags từ tài liệu này.
4. Docker host: Mac path không tự tồn tại trong container. Thêm bind mount repo plugin mới ở một path riêng như `/app/packages/plugins/agent-studio:ro`, giữ mount KPI và volume data nguyên vẹn. Cài bằng đường dẫn trong container. Tất cả SDK tarball/dependency/dist cần cho runtime phải resolve trong container; test package portability, không để symlink trỏ về Mac. Không truyền Mac node_modules native modules sang Linux nếu runtime cần chúng; đóng gói artifact đúng platform hoặc build bên container.
5. Compose hiện có mount KPI read-only và data riêng; host build context nằm trong compose thực tế. Không sửa trực tiếp env/secrets. Cấu hình mount chỉ có hiệu lực sau recreate service; restart đơn thuần không thêm mount. UI host đổi cần build image/bundle host; build dist plugin không thay host UI.
6. Trong môi trường dev riêng, verify plugin activate, sidebar xuất hiện đúng một lần, route reload/deep link được, company switch không leak, asset URLs resolve, Open task/run đúng, disable plugin không phá host. Ghi plugin version, SDK version, host SHA và path install.
7. Nếu SDK thiếu read surface cần thiết, ghi gap cụ thể, implement minimal read-only host extension có auth/company checks và test; ghi trong integration ADR. Không làm endpoint bypass. Có thể ship thiếu field với unavailable đúng nghĩa, nhưng nếu đó là run state cốt lõi thì ghi blocker live visualization, không gọi V1 hoàn tất.

## 9. Kế hoạch thực thi theo đợt cho Luna

Làm tuần tự theo dependencies, không cần multi-agent. Mỗi đợt sửa một nhóm trách nhiệm. Không ước lượng số giờ/model tokens như cam kết. Không dừng sau khi chỉ viết thêm plan; tự tiếp tục qua các đợt đã được giao. Chỉ hỏi khi thiếu credential, target release, hoặc quyết định không thể suy ra có rủi ro dữ liệu.

### P0 — Baseline và bản đồ

Đọc AGENTS ở các cấp, `doc/GOAL.md`, PRODUCT, SPEC-implementation, DEVELOPING, DATABASE, DESIGN và hướng dẫn UI liên quan. Ghi versions, status/diff, scripts, active routes/imports/flags. Chụp baseline các page family ở dev isolated nếu có browser. Inventory components/tokens và permissions. Tạo `[GPT]-PROGRESS.md`, `[GPT]-ROUTE-COVERAGE.md`, `[GPT]-INTEGRATION-ADR.md`. Không đọc/print secrets. Exit: biết file nào thật sự render, working changes nào cần bảo toàn, runtime nào là test.

### P1 — Token và shared shell

Cập nhật DESIGN.md về redesign được phép; thay semantic tokens, primitives, sidebar/header/page rhythm. Giữ interactions. Test light/dark, focus, mobile navigation, company switch. Exit: 3 trang khác nhóm nhận cùng visual language, token gate pass, không route mất.

### P2 — Character vertical slice và asset contract

Làm Sofia portrait + office sprite theo phần 6, một scene sạch tách lớp, resolver shared, preview đúng kích thước. Tự inspect tính đồng nhất, đảm bảo giảm realism so với A2. Exit: portrait và seated là cùng người, không clipping/alpha lỗi, role nhận diện được, asset còn thiếu ghi rõ. Sau slice mới làm 5 preset còn lại.

### P3 — Bốn trang trọng tâm

Dashboard, Agents/list/detail, Tasks/list/detail, Projects/detail. Giữ query hooks và handlers, tái cấu trúc presentation từ primitives. Không rewrite fetching/permissions. Thêm avatar resolver, layout responsive, error/empty states. Exit: screenshot trước/sau và action smoke từng nhóm; visual khác rõ về hierarchy, không chỉ đổi màu.

### P4 — Phủ các trang còn lại

Làm theo từng row của coverage table phần 5: approvals/costs; apps/tools; skills/routines/artifacts/audit; settings/auth. Mỗi nhóm cập nhật route checklist. Cả branches/feature flags đang hỗ trợ phải được audit. Exit: mọi route reachable có reviewed layout, loading/error, desktop/mobile evidence hoặc limitation ghi rõ.

### P5 — Plugin skeleton + data adapter

Scaffold repo riêng, manifest slots, SDK pin, snapshot handler và list view. Test company boundary, unavailable/missing fields, request race, mapping states. Không vẽ office trước khi data/list đúng. Exit: agents từ dev host hiện thật, company switch đúng, no fixture in runtime, links hợp lệ.

### P6 — Office renderer + interaction

Tích hợp asset/scene model, seats ổn định, selection panel, zoom/pan/reset, rooms/filter/search, keyboard list parity. Character occlusion và selection ring đúng chỗ; không che mặt bởi UI marker. Respect reduced motion, hidden tabs. Exit: 0/1/6/7/30/100 agents xử lý tốt; scene chỉ render room visible, detail luôn usable.

### P7 — Integration và kiểm thử tổng thể

Cài vào host dev, kiểm tra tokens và sidebar với plugins khác; verify runtime data và session lifecycle, reload/uninstall/reinstall. Build host và plugin độc lập. Chạy checks phần 10. Exit: không regression cốt lõi, evidence đủ, remaining blockers tách bạch.

### P8 — Release package và hướng dẫn vận hành

Tạo release notes, version manifest, artifact checksums, exact host/plugin commits, install/update/disable/rollback steps đã thử ở dev. Trình target runtime cụ thể nếu cần apply production. Không tự chạy restart service phục vụ công việc khi chưa có release authorization. Exit: người dùng/session kế tiếp có thể triển khai bằng runbook không đoán path/flags.

## 10. Validation bắt buộc

Mỗi đợt chạy check nhỏ liên quan; không lặp full suite sau mỗi file. Trước bàn giao hoàn chỉnh ở host, theo scripts hiện có: `pnpm check:token-gates`, `pnpm -r typecheck`, `pnpm test:run`, `pnpm build`, `pnpm build-storybook`. Nếu command thay đổi, dùng equivalent từ package.json và ghi lý do. Plugin chạy scripts typecheck/test/build của scaffold, kiểm tra packaged dist. Không tự bỏ/skip test đang fail để đạt xanh; phân biệt lỗi baseline với lỗi mới bằng evidence.

Kiểm thử hành vi có giá trị: company switch khi request chậm; permission denied; task/run thiếu; stale và reconnect; unknown status; agent bị remove khi selected; filter không có kết quả; stable seats sau rename/reorder; agent paused nhưng run cũ completed; multiple active runs; uninstall plugin không phá avatars; asset load fail. Fixtures chỉ tồn tại trong test/Storybook.

Browser smoke tối thiểu: dashboard, agents + detail/run, task + thread/action test ở isolated data, project, approvals, costs, settings, plugin page, login/empty/error. Desktop 1440x900, laptop 1280x800, tablet 768x1024, mobile 390x844; thêm 200% zoom. Light/dark; keyboard và reduced motion. Screenshot không đủ chứng minh click hoạt động, phải thao tác menu/form/link liên quan.

Hiệu năng mục tiêu cần đo: initial office visible assets <=5 MB compressed ở room đầu; lazy scene không vào critical bundle của các trang khác; ít nhất 30 fps lúc pan trên máy mục tiêu; không animation loop khi hidden/reduced motion; list 100 agents responsive nhờ paging/virtualization nếu cần. Ghi máy, browser, room size và số đo thực. Nếu chưa đạt, tối ưu assets/render trước khi thêm engine.

Nghiệm thu visual: đúng ivory/sage; hierarchy rõ; không border chồng; text đọc tốt; nhân vật cùng style; room có ánh sáng/scale/occlusion thống nhất; portrait không photoreal lệch scene; mỗi agent nhận diện qua tóc/outfit ngay ở scene size; thiếu viewport/browser thì báo chưa verify, không tự đánh dấu pass.

## 11. Release, rollback và bảo toàn dữ liệu

Dùng dev database riêng; không chạy reset DB trong AGENTS example, không migrate dữ liệu thật để test UI. Default redesign không cần migration. Nếu phát sinh cần persistence, ưu tiên existing supported settings và nêu rõ migration scope trước khi release.

Trước apply runtime thật: xác định compose/service/current image/plugin version, lưu config diff và bản backup theo runbook thực tế, không dump secrets vào report. Host update và plugin update có rollback riêng. Rollback host bằng previous image/build; rollback plugin bằng previous artifact/version hoặc disable qua manager. Bỏ bind mount plugin bằng recreate chỉ khi cần; không xóa volume. Verify health, auth, company/agents/tasks còn nguyên và links hoạt động sau rollback. Không gọi “deploy verified” chỉ từ HTTP 200.

KPI plugin hiện hữu giữ nguyên route/id/contracts. Nếu cần chỉnh presentation riêng sau host token pass, làm patch riêng có scope rõ; không sửa worker CRM hoặc source-series để vừa mockup.

## 12. Quy tắc tự quản công việc cho Luna

Trước mỗi đợt: đọc PROGRESS, đọc chỉ file liên quan, nêu mục tiêu ngắn. Sau mỗi đợt: ghi files changed, checks/results, screenshots, known issues, next exact step. Mỗi commit nếu được thực hiện chỉ chứa thay đổi thuộc đợt; không commit toàn bộ dirty tree. Khi context sắp đầy, cập nhật checkpoint thay vì mở rộng scope. Session sau đọc checkpoint và tiếp tục, không làm lại phase 0 nếu evidence vẫn hợp lệ.

Nếu gặp lỗi hai lần cùng nguyên nhân, dừng cách làm đó để kiểm tra API/types/import graph/logs; không thử ngẫu nhiên dependency upgrades. Không giả định Luna có image generator, browser hay Docker access: kiểm tra capability, tiếp tục phần độc lập và báo blocker cụ thể. Không cài plugin không liên quan. Không cần model mạnh hơn mặc định; cần task nhỏ, contracts rõ và kiểm chứng.

Mẫu checkpoint: `Phase / Done / Evidence / Remaining / Exact next files / Commands already run / Baseline issues / Blockers`. Mẫu final report tách: Code complete, Local verified, Browser verified, Real upstream verified, Release applied hoặc chưa apply, Blockers, commits/artifacts. Không gộp “build pass” thành “sản phẩm hoàn tất”.

Definition of Done: route coverage đầy đủ; design tokens/shared components nhất quán; bộ nhân vật cuối đồng nhất; Agent Studio độc lập cài/disable được; data và statuses trung thực; tests/browser checks đạt hoặc có blocker công khai; không thay đổi nghiệp vụ ngoài scope; release/rollback có thể thực hiện. Plan này không cho phép đánh dấu hoàn tất chỉ với mockup, scaffold hoặc screenshot tĩnh.
