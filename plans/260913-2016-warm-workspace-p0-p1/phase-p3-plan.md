# Phase P3 — Bốn trang trọng tâm (Dashboard, Agents, Tasks, Projects)

**2026-09-14 continuation:** Task panel sizing, collapsed focus and safe attachment preview checks advanced; prior Dashboard/Agents/Projects work is inherited. Full Task actions/states/native zoom and overall P3 acceptance remain incomplete. Current evidence is in [PROGRESS](PROGRESS.md); do not interpret this historical phase plan as a new completion claim.

Thêm vào plan gốc 2026-09-13 (P0+P1 đã xong, commit `526bcaf4b`). P2 gác vì quyết định "kỹ thuật trước, asset sau".

## Mục tiêu (từ handoff)

- Tái cấu trúc **presentation** của 4 nhóm trang từ shared primitives hiện có
- **Giữ nguyên** query hooks, handlers, fetching, permissions, tabs, actions
- Layout responsive, error/empty states dùng chung hệ token
- Exit: screenshot trước/sau + action smoke từng nhóm; visual khác rõ về hierarchy, không chỉ đổi màu

## Phạm vi file (theo ROUTE-COVERAGE.md)

| Nhóm | Files | Variant bắt buộc kiểm tra |
|---|---|---|
| Dashboard | `ui/src/pages/Dashboard.tsx` | — |
| Agents list | `ui/src/pages/Agents.tsx` | `Agents.production.tsx` |
| Agent detail | `ui/src/pages/AgentDetail.tsx` | — |
| Tasks list | `ui/src/pages/Issues.tsx` | — |
| Task detail | `ui/src/pages/IssueDetail.tsx` | — |
| Projects list | `ui/src/pages/Projects.tsx` | — |
| Project detail | `ui/src/pages/ProjectDetail.tsx` | — |

## Nguyên tắc sửa

1. Token-only (token gates phải pass); không inline hex/px/arbitrary values
2. Không tạo primitive V2; dùng Button/Card/Badge/EmptyState hiện có
3. Không đổi data flow: hooks, query keys, mutation handlers giữ nguyên signature
4. Hierarchy qua structure (position/size/weight), không border chồng border (DESIGN.md Principle 4)
5. Một CTA chính mỗi vùng hành động; secondary = outline/text
6. Status dùng đúng semantic token set (Principle 5); numbers/logs qua monospace token (Principle 6)

## Quyết định đã chốt cho P3

- **Avatar resolver:** hoãn bản đầy đủ (thuộc P2/P6 asset manifest). P3 chỉ đảm bảo agent identity hiện có (AgentCapsule/gradient) dùng nhất quán cùng kích thước/hình dạng ở mọi chỗ trong 4 trang — không chế tác asset mới
- **Không đụng** `.production.tsx` nếu nó chỉ là variant flag với cấu trúc riêng hoàn chỉnh — audit trước, quyết khi có bản đồ; nếu sửa một variant phải giữ parity về hành vi

## Validation từng nhóm

- `pnpm check:token-gates` + `cd ui && pnpm typecheck`
- vitest các file test của trang đó (nếu có)
- Screenshot trước/sau (dev isolated `--data-dir ./tmp/paperclip-dev`, wizard ritual đã documented trong PROGRESS P1)
- Action smoke: filter, click row → detail, mở menu action (không cần chạy agent thật)

## Thứ tự làm

1. Scout bản đồ cấu trúc 4 nhóm (subagent)
2. Dashboard → Agents list → Agent detail → Tasks list → Task detail → Projects → Project detail (mỗi nhóm: sửa → check → screenshot)
3. Review (code-reviewer subagent) → cập nhật PROGRESS + feature files nếu đụng → hỏi commit
