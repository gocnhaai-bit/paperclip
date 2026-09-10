# LLM Wiki plugin

## Status

Installed and configured for the local authenticated/private Paperclip runtime.

## Product contract

- Company-scoped local-file Wiki for source ingestion, browsing, cited queries, lint and maintenance workflows.
- Wiki data remains under the configured `wiki-root`; the plugin does not treat an online URL as a writable Wiki root.
- Paperclip-derived distillation writes to the default space in `v0.1.0`.

## Ownership

- `packages/plugins/plugin-llm-wiki/src/manifest.ts`: capabilities, managed resources, routes and UI slots.
- `packages/plugins/plugin-llm-wiki/src/ui/app.tsx`: Wiki page, settings, contextual navigation and primary-sidebar entry.
- `packages/plugins/plugin-llm-wiki/src/wiki/`: filesystem and Wiki behavior.

## UI alignment

The primary-sidebar entry follows the host `SidebarNavItem` visual contract: matching inset, padding, radius, typography, 16px outline icon and sidebar active colors. It marks `/wiki` and its descendant routes active without changing navigation behavior.

## Verification

- Plugin tests, typecheck and build.
- Primary sidebar active and inactive states at the base Wiki route and descendant routes.
- Runtime plugin readiness plus desktop and narrow-sidebar visual checks.
