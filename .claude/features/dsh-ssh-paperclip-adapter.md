# DSH Paperclip adapters

## HTTP bridge exception

Paperclip's built-in HTTP adapter may reach exactly `https://agent-baquan-hermes.tail9452c0.ts.net:8447/run` when MagicDNS resolves that hostname to a private Tailscale address. Matching occurs after URL parsing and requires HTTPS, the exact hostname, explicit port `8447`, path `/run`, no user information, query, or fragment. Other private addresses, Tailscale IP literals, sibling tailnet hostnames, ports, and paths remain subject to the default SSRF guard. Link-local addresses remain denied even if returned for the allowed hostname. HTTP adapter redirects are rejected rather than followed.

This exception changes only Paperclip egress validation. DSH bridge creation, credentials, and agent adapter configuration remain operator-owned and are not part of this patch.

## SSH adapter status

External adapter package `0.2.0` is installed in the local Paperclip instance. The replacement `DSH Pilot` agent is created with heartbeat disabled after the original agent was terminated. Assignment dispatch through the dedicated SSH forced command to the pinned DSH runtime on the VPS is verified after the worker dependency relocation. Model/provider setup and successful task completion are intentionally deferred.

## Contract

- Adapter type: `dsh_ssh`; fixed model presentation: `gpt-5.6-luna` through `router-smit`.
- Package remains external: Paperclip loads it through the adapter plugin `localPath`/npm mechanism; core registries are unchanged.
- One SSH invocation sends one UTF-8 JSON request through stdin, closes EOF and parses one JSON response.
- Protocol `dsh-paperclip-runner/draft-2`; `draft-1` is a separate immutable synthetic baseline and is not wire-compatible.
- Supported operations: `start`, `status`, `events`, `cancel`.
- `start` requires server-authored agent/company/issue/run identity plus a run-scoped Paperclip JWT. Other operations never carry the JWT.
- Durable payload contains only task, timeout and `disconnectPolicy: continue`; repeated start is idempotent by its non-secret payload digest.
- `accepted`, `running` and `cleanup_pending` are nonterminal. Only `completed`, `cancelled`, `timed_out` and `failed` are terminal.
- A cancel response is an acknowledgement, not proof of cleanup. The adapter waits for terminal status and fails closed if settlement cannot be verified.
- Event sequence is cursor-based. An empty event list means no new events, not completion.
- Success requires terminal `completed`, a `final` event and a bounded observed disposition receipt.

## Connection deployment

- Paperclip external adapter inventory reports `dsh_ssh` version `0.2.0`, source `external`, loaded and enabled.
- `DSH Pilot` uses adapter `dsh_ssh`, remains `idle`, and has scheduler heartbeat disabled.
- Adapter pins separate real and synthetic runner paths; config cannot override runner, Node executable, or Paperclip API authority.
- A dedicated ED25519 SSH key is restricted by `authorized_keys` to `/home/quancoo/.local/bin/dsh-paperclip-forced-command`; forwarding, PTY and arbitrary command execution are disabled.
- Forced command fixes principal `paperclip-dsh-pilot` and state root `/home/quancoo/.local/state/dsh-paperclip-draft-2-real`.
- DSH runtime is an immutable copy of `0.1.5-rc.2` with only the verified Paperclip worker and scope-fencing overlay; its manifest hash is recorded on the VPS.
- Paperclip DB and the previous VPS `authorized_keys` were backed up before mutation.


The VPS-authoritative profile scaffold is currently fixed to:

- route: `router-smit`;
- model: `gpt-5.6-luna`;
- credential environment reference: `ROUTER_SMIT_API_KEY`;
- base URL: `https://server-claude-router.tail9452c0.ts.net/v1`;
- API dialect: `openai-completions`.

None of these fields can be selected through request JSON or adapter config. Model/provider credential setup is intentionally outside the completed connection work. Without that setup, DSH starts and then fails during provider initialization; this does not invalidate the verified Paperclip-to-DSH dispatch path.

The deterministic synthetic fixture uses a separate immutable runner path selected only by explicit synthetic mode; the real runner path is selected otherwise. Neither path is configurable. The real runner hard-codes the `router-smit` profile. The fixture performs no provider request and emits a deterministic final and receipt solely to test the runner/adapter lifecycle.

## JWT and recovery boundary

- Paperclip reuses its existing `AdapterExecutionContext.authToken` and local-agent JWT minting; no server/core JWT change was needed.
- Adapter places the token only in the serialized `start` stdin request, never SSH argv/environment/metadata/results.
- Supervisor excludes it from request files, SQLite, payload digest and events, then transfers it once through an anonymous pipe inherited by the worker.
- Worker reads and closes the FD, then gives `PAPERCLIP_API_KEY` only to the DSH child environment for that run.
- A durable non-secret handoff fence forbids provider relaunch. Supervisor/worker loss after handoff causes exact cleanup and terminal `failed`, never automatic restart.
- Same-UID isolation on the VPS is an accepted pilot limitation, not a security sandbox.

## Observed disposition receipt

The runner uses existing authenticated Paperclip endpoints; it does not add a core API or database receipt:

1. DSH performs the normal task mutation using the run JWT.
2. After native idle and session flush, the worker reads the issue and comments.
3. It accepts only `done`, `in_review`, or `blocked` with a comment attributed to the same run.
4. It emits only `kind`, issue ID, status, run ID, comment ID and verification timestamp.

This is an immediate observed verification receipt, not an immutable or cryptographic audit receipt. API failure, malformed state, unsupported disposition, wrong-run/missing comment, missing final or missing receipt makes the run fail closed.

## Configuration

Required lab configuration:

- `labOnly: true`;
- SSH host, port and username;
- isolated draft-2 state root;
- fixed trusted principal;
- private key and known-hosts entries through Paperclip secret fields;
- strict host-key checking;
- work timeout from 100 ms through the approved 3,600,000 ms maximum.

Synthetic `finish`/`hang` mode is available only when both `synthetic: true` and an explicit mode are configured. Individual SSH RPCs remain separately bounded.

## Security

- Task/JWT content is sent through SSH stdin, never runner command arguments.
- SSH credentials and known-hosts data are never written to adapter logs or results.
- Adapter requires the dedicated private key and sets OpenSSH `IdentitiesOnly=yes`, preventing fallback to broader SSH-agent/default identities.
- Paperclip API authority and Node executable are pinned in the runner artifact and cannot be overridden by adapter config.
- Arbitrary host/client environment variables are not forwarded.
- Raw runner stderr, API response bodies, comment bodies and provider reasoning are not surfaced as Paperclip transcript content.
- `PAPERCLIP_PRINCIPAL` is still trusted wrapper configuration, not accepted production authentication.
- Draft-1 and draft-2 never share a state root, protocol, scope prefix or recovery loop.

## Runtime correction discovered in lab

DSH 0.1.5-rc.2 real release profiles must run the compiled `apps/cli/lib/bin.js`. Source execution through `tsx` is unsupported for the full base/headless graph because imported TypeScript `const enum FiberState` has no runtime export in Cordis. Production WebUI already uses the compiled entrypoint. The draft-2 router worker is compiled before use; no Cordis/vendor shim was added.

The synthetic profile remains a development-only exception: it runs the existing source-mode test composition through `tsx`, which is known to work for that restricted mock graph and enables the established DSH scope/persistence fixtures. It is a separate immutable command and cannot be selected by the real runner.

## Verification evidence

- Local adapter: 18/18 tests, typecheck and build pass.
- VPS draft-2 native mock suite: 12/12 tests pass for strict version/auth, DSH final+receipt, no persistent/argv JWT sentinel, non-secret idempotency digest, DSH session persistence, native cancellation/session flush, post-handoff crash/no-restart, 60-minute bound, fixed profile metadata, and pinned Paperclip authority/executable.
- Native cancel proof created two real task-owned systemd scopes and verified both inactive; no draft-2 gate units remained active after the final suite.
- Pinned runtime native suite also passes 12/12 after adding only the verified worker and scope-fencing overlay.
- Read-only dependency audit verifies relocated worker module imports, all manifest hashes, diagnostic `ready`, and `MISSING_CREDENTIAL` with the old dependency error absent.
- Replacement-agent E2E run `23bcb686-0fad-4da8-9e5f-8134233581c5` independently verifies assignment dispatch to native `ready`, idle, session flush and the deferred provider boundary.
- Draft-1 supervisor hash remains `7c3e7161b69fb849053a1919f03d374eedc217fe73fefec8ded1ee7d5fbb6308`.
- `dsh-web.service` remained active during verification.

The native synthetic profile uses DSH's mock provider and a fake in-memory Paperclip API response. It proves DSH session lifecycle, cancellation, persistence, systemd scope cleanup, FD handoff and receipt gating without a billable provider request. The fixed `router-smit` profile and live Paperclip/provider integration remain unverified and require the next approval-gated smoke.

## Connection verification

- Original agent `d5a1b49e-cb18-48e8-9a84-d2105e7ad516` remains terminated as immutable audit history; Paperclip deliberately forbids resuming terminated records.
- Replacement `DSH Pilot` agent `3aedd01a-a2f2-4278-a799-c81054ee3a35` preserves the restricted adapter configuration and heartbeat-disabled policy.
- Creating and assigning `SMI-12` to the replacement agent automatically created Paperclip run `23bcb686-0fad-4da8-9e5f-8134233581c5`.
- The run used the required dedicated private key with `IdentitiesOnly=yes`; no SSH-agent/default identity fallback is allowed.
- VPS evidence for that exact run contains the durable request, credential fence, worker handshake, generated DSH profile, native `ready`, native idle, session flush, result, worker exit and terminal runner state.
- The old `Cannot find package '@deepseek-ai/dsh-session'` error is absent. The session records `MISSING_CREDENTIAL` for `router-smit`, which is the intentionally deferred provider boundary.
- `completed=false`; no final disposition receipt was manufactured.
- The E2E probe issue was closed after verification. Heartbeat remains disabled.
- No draft-2 systemd unit remains active; `dsh-web.service` remains active.

## Deferred model readiness

To make assigned tasks complete successfully rather than merely reach DSH, separately configure a valid provider/model credential for the fixed DSH profile, then run one completion/disposition smoke. This follow-up does not require changing the adapter, SSH key, forced command, agent assignment flow, or heartbeat policy.

## Production approval gate

Before enabling scheduled heartbeat or declaring successful task completion, explicitly verify:

1. draft-2 runner artifact hashes and production path;
2. dedicated SSH credential and forced-command principal mapping;
3. production state/runtime/workspace roots;
4. strict known-host fingerprint;
5. reachable fixed Paperclip API URL and live JWT/disposition behavior;
6. non-echoing per-worker injection of the provider credential;
7. external plugin installation;
8. pilot agent configuration with heartbeat disabled;
9. one billable manual smoke task and targeted rollback.

No SSH authorization, credential read/use, provider call, production runner/service, plugin registration, agent or heartbeat mutation occurred during draft-2 synthetic implementation.
