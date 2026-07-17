# DM the affected user before kick/ban, not after

ADR-0004 sends the Action notice DM only after mute/kick/ban is confirmed to have succeeded. For kick and ban this backfires: Discord requires a mutual server (or an existing DM channel) to open a DM, and kicking/banning a user from the only server they share with the bot severs that relationship before the DM is attempted — the notification silently fails in exactly the cases it matters most. We're moving kick/ban's DM to before the action, gated on a `lookup()` call first so an invalid or non-member target ID still gets today's "invalid user" error with no DM sent. Mute is unaffected by this change: it doesn't remove the member from the server, so mutual-server status is untouched and ADR-0004's after-action ordering already works fine there.

## Considered Options

- Reorder without a `lookup()` gate first — rejected: an invalid or typo'd user ID (the common moderator-error case, previously caught for free by `kick()`/`ban()`'s own internal fetch) would now get a "you were kicked" DM before the action fails, worse than sending nothing.
- Keep DM after the action (status quo) — rejected: the DM systematically fails whenever the kicked/banned server was the only one shared with the bot, which is the common case for one-off moderation of a single troublesome user — the notification silently doesn't work for exactly the cases it matters most.

## Consequences

This reopens, narrowly, the false-positive risk ADR-0004 originally eliminated: if `lookup()` succeeds but the subsequent `kick()`/`ban()` call itself then fails (e.g. the bot's role sits below the target's in the hierarchy — only discoverable when Discord evaluates the actual mutation, not at lookup time), the user will already have received a DM claiming the action happened when it didn't. This is accepted as a documented tradeoff, narrower than the one ADR-0004 eliminated — scoped to kick/ban only (not mute), and only past the `lookup()` gate, so invalid/non-member IDs still produce zero false DMs.

`WarnCommand`'s ban-escalation branch moves to the same lookup-then-DM-then-ban order; its mute-escalation branch is untouched.

Every kick/ban now costs one extra Discord API call (`lookup`, already an existing `DiscordMemberPort` method per ADR-0002 — no new port surface needed) before the DM.
