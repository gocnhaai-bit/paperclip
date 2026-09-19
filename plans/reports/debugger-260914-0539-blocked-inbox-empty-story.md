# Blocked Inbox story renders empty — root cause

Scope narrowed mid-task per coordinator: investigate only the BlockedInbox `DesktopLoaded` empty-render finding the parent already observed. No new route sweep performed (coordinator called off further route expansion before it started).

## Evidence

- Browser: own named session `warm-routes-260914` (agent-browser), Storybook 6006 (reused, not restarted). Story `product-inbox-blocked-tab--desktop-loaded` (`Product/Inbox/Blocked tab` → `Desktop Loaded`).
  - 1440×900: body text = "No work is stopped. Tasks that need a decision, recovery, or external action will appear here." Screenshot `/tmp/warm-routes-blocked-inbox-desktop-1440.png`.
  - 390×844: same empty text. Screenshot `/tmp/warm-routes-blocked-inbox-mobile-390.png`.
  - Also checked `desktop-with-search` variant at 1440×900 — same empty state.
- Own browser closed at end (`agent-browser close`).

## Cause chain (source, no source edits made)

1. `ui/src/components/BlockedInboxView.tsx:76` — the component's live query key is:
   `[...queryKeys.issues.listBlockedAttention(companyId), "live-descendant-summary"]`
2. `ui/storybook/stories/blocked-inbox.stories.tsx:171` — `PrimeBlockedFixtures` seeds:
   `queryClient.setQueryData(queryKeys.issues.listBlockedAttention(companyId), fixtureIssues)`
   This key has no `"live-descendant-summary"` suffix, so it is a **different cache entry** than what `useQuery` reads. The seed is effectively dead — React Query never serves it to the component; a real `useQuery` fetch runs instead (matches coordinator's suspicion that refetch overwrites/bypasses the seed — confirmed: it's a key mismatch, not a race).
3. That triggers the Storybook global fetch fixture at `ui/storybook/.storybook/preview.tsx:635-647`, resource `"issues"`, which returns `storybookIssues` (from `ui/storybook/fixtures/paperclipData.ts`).
4. `buildBlockedInboxRows` (`ui/src/lib/blockedInbox.ts:129-139`) drops any issue where `issue.blockedInboxAttention` is falsy (`if (!attention) continue;`, line 133). Checked: no entry in `storybookIssues` (`ui/storybook/fixtures/paperclipData.ts`, ~line 795 onward) sets `blockedInboxAttention`. So `allRows` is empty regardless of the key bug — two independent gaps, either one alone reproduces the empty state.

## Conclusion

Confirmed non-flake: the `DesktopLoaded` story cannot currently show populated rows. Component/logic (`BlockedInboxView`) itself is not proven broken — this is a **story/fixture wiring gap**, not a product bug.

## Smallest fix — superseded by parent's verification

Parent fixed and verified: `ui/storybook/stories/blocked-inbox.stories.tsx:171` seed key corrected to include the `"live-descendant-summary"` suffix, matching `BlockedInboxView.tsx:76`. No global fixture change needed.

My earlier "pick the fetch-fixture fix, key-only fix races on refetch" caveat is wrong and retracted: `preview.tsx:685` sets `staleTime: Number.POSITIVE_INFINITY` on the story `QueryClient`, so a correctly-keyed `setQueryData` seed is never invalidated/refetched in Storybook. The key mismatch was the sole cause; the `blockedInboxAttention`-less `storybookIssues` fixture is irrelevant once the query never falls through to the real fetch. Parent confirmed 8 rows render at 390 light after the one-line key fix; search story renders `PAP-420` only (expected, filtered).

## Not in scope / not done

- No other route families checked in this slice (coordinator stopped expansion before the 390/768/1440 dark/light sweep began).
- No source edits, no live/3122 use, no mutation.

Status: DONE
Summary: BlockedInbox `DesktopLoaded`/`DesktopWithSearch` stories rendered empty solely because the story's `setQueryData` key (`blocked-inbox.stories.tsx:171`) omitted the `"live-descendant-summary"` suffix used by the component's real query key (`BlockedInboxView.tsx:76`). Parent fixed the key and verified 8 rows render at 390 light; no global fixture change was needed since the story `QueryClient` uses `staleTime: Infinity` (`preview.tsx:685`), so a correctly-keyed seed is never refetched. No product defect found in `BlockedInboxView` itself.
Concerns: none; my initial extra caveat about needing a fixture-level fix was incorrect and is retracted above.
