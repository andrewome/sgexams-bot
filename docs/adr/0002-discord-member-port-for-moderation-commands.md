# Moderation commands use a DiscordMemberPort instead of raw GuildMemberManager

`BanCommand`, `MuteCommand`, `UnmuteCommand`, `UnbanCommand`, `KickCommand`, and `WarnCommand` called discord.js's `GuildMemberManager`/`GuildMember` directly through `CommandArgs.members`. Testing any of them meant mocking discord.js objects, which nobody had done — these were the only moderation commands with zero test coverage. We're introducing a `DiscordMemberPort` interface at the seam between these six commands and discord.js: `ban`, `unban`, `kick`, `timeout`, and a read-only `lookup` (for `WarnCommand`'s validate-and-display-only need, which performs no mutation). `DiscordMemberAdapter` wraps the real manager in production; `FakeMemberAdapter` drives the six commands' tests.

Unlike the rest of the codebase (`ModDbUtils` and every other moderation command catches `DiscordAPIError` per call site and translates it to an "invalid user" embed), `DiscordMemberPort`'s methods return `{ ok: true, tag: string } | { ok: false }` instead of throwing. This is a deliberate deviation: it absorbs the fetch-then-act composition and the repeated `DiscordAPIError`-to-embed translation that were duplicated six times into the port itself, rather than leaving each command to redo both.

Considered: a thin wrapper mirroring `GuildMemberManager`/`GuildMember` almost 1:1 (`fetch`, `ban`, `unban`, plus a `Member` object with `.tag`/`.timeout()`/`.kick()`). Rejected — it would unblock testing but wouldn't deepen anything; it's a Middle Man that mostly delegates onward, not a real seam.

Scope: only the six commands that touch `GuildMemberManager`. `PurgeCommand`'s `MessageManager` seam is a different discord.js surface and a separate deepening. `ReadyEventHandler`'s direct `GuildMemberManager` usage (for re-arming ban timeouts on restart) doesn't go through `CommandArgs` and is deferred.

## Consequences

`WarnCommand`'s warn-threshold escalation branch drops its redundant second `fetch` (previously fetched the target once in `execute()` for the warn embed, then again in `handleWarnThreshold()` for the ban/mute escalation) since the port's action methods fetch internally.

`CommandArgs.members` turned out **not** removable, contradicting what we expected going in. `ModUtils.addBanTimeout` (which schedules a temporary ban's eventual auto-unban) still takes a raw `GuildMemberManager`, and both `BanCommand` and `WarnCommand`'s ban-escalation branch still call it directly for that one purpose — changing `addBanTimeout`'s own signature is `ReadyEventHandler` territory (the other caller), which this ADR explicitly deferred. So `members` stays in `CommandArgs`, narrowed to exactly this one purpose (scheduling the ban timer), while every direct discord.js action call in the six commands goes through `memberActions`. Revisit deleting it if/when the deferred `ReadyEventHandler` deepening happens and `addBanTimeout` can take a port instead.
