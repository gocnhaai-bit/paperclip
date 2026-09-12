# Hermes Gateway Paperclip authentication

## Status

Operationally configured and verified on 2026-09-11 for the remote Product General Manager runtime.

## Topology

Hermes Gateway and Paperclip run on separate Tailnet hosts:

- Paperclip: `https://os.smitbox.com`
- Hermes Gateway: `agent-baquan-hermes.tail9452c0.ts.net`

The integration has two independent authentication directions:

- Paperclip → Hermes uses `API_SERVER_KEY`.
- Hermes → Paperclip uses `PAPERCLIP_BRIDGE_API_KEY`; `PAPERCLIP_API_KEY` carries the same scoped value for Paperclip skill and API compatibility.

Do not substitute one credential for the other or place either value in prompts, logs, issue comments, repository files, command arguments, or service-unit output.

## Authorization contract

The Hermes-side Paperclip credential belongs to the Product General Manager agent and uses `task_bridge` scope. It may read, comment on, and update issues assigned to that agent or created by the same bridge. It cannot use company-wide, peer-agent, project, runtime, or secret APIs.

The key's parent boundary is the source issue used for this rollout. This boundary governs task creation; access to an existing source issue still requires that the issue be assigned to the same agent.

## Runtime ownership

`/home/quancoo/.hermes/.env` on the Hermes host owns:

- `PAPERCLIP_API_URL`
- `PAPERCLIP_API_KEY`
- `PAPERCLIP_BRIDGE_API_KEY`
- `PAPERCLIP_COMPANY_ID`
- `PAPERCLIP_AGENT_ID`

The file must remain owned by `quancoo` with mode `0600`. `hermes-gateway.service` must be restarted after changing these values because the long-running process loads the dotenv file at startup.

## Credential lifecycle

The Product General Manager runtime owner is responsible for this bridge key. Rotate it immediately after suspected exposure, agent reassignment or termination, remote-host ownership changes, or failed access review; otherwise rotate it during planned credential maintenance. Paperclip does not automatically expire persistent agent keys, so the old key must be explicitly revoked after its replacement passes verification.

## Rotation and rollback

1. Create a Paperclip database backup and a timestamped copy of the remote `.env`.
2. Create a newly named `task_bridge` key through the authenticated agent-key API.
3. Transfer the raw token only through encrypted stdin and atomically replace `.env`.
4. Restart Gateway and verify authenticated issue access from the Hermes host.
5. Revoke the previous key only after the new key passes verification.

On failure, restore the timestamped `.env`, restart Gateway, verify health, and revoke the failed new key. Database restore is an emergency fallback, not the normal credential rollback.

## Verification

The 2026-09-11 rollout verified:

- a manual Paperclip database backup completed before mutations;
- the remote `.env` and its backup are owned by `quancoo` with mode `0600`;
- Gateway health returned HTTP 200 after restart;
- remote `GET /api/agents/me` returned the expected agent, company, and `task_bridge` scope;
- remote `GET /api/issues/SMI-3` returned HTTP 200 for the assigned issue;
- the recovery run sent authenticated Paperclip requests with the correct run header;
- the final issue update returned HTTP 200 and `SMI-3` reached `done`.

Never record raw credential values as verification evidence.
