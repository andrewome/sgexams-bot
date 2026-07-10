# Mute command uses Discord timeouts instead of a role, and drops permanent mutes

Mute was implemented by assigning a bot-managed role and re-applying it on rejoin. We're switching it to Discord's native member timeout (`GuildMember#timeout`), mirroring how `BanCommand` uses the native ban API, so the bot no longer has to maintain role state or guess at reapplication.

Discord timeouts cap at 28 days and have no indefinite/permanent state — unlike bans, which can be genuinely permanent. Rather than keep the old role-based system alive as a fallback for permanent or long mutes, we're dropping permanent mute entirely: `MuteCommand` now requires a duration. Running two parallel mute mechanisms (role-based for "permanent", timeout-based for everything else) would defeat the purpose of simplifying onto Discord's native primitive.

`MuteCommand` actually rejects anything over 21 days, not Discord's own 28-day limit. `ModUtil.setMuteTimeout` schedules the eventual `UNMUTE` audit-log write with a plain `setTimeout`, whose delay is a 32-bit signed int (~24.85 day max) — a delay past that overflows and fires almost immediately instead of waiting, silently corrupting the audit trail for any mute between ~24.85 and 28 days. Rather than add reschedule-chaining logic to support the full 28 days correctly, `MAX_MUTE_DURATION_SECONDS` is capped at 21 days, a round number safely under the 32-bit ceiling.

Considered: keeping `SetMuteRoleCommand`/role assignment as a fallback path for permanent mutes only. Rejected — it keeps the mute role system load-bearing indefinitely and doubles the code paths `UserJoinEventHandler` and `WarnCommand` need to handle.

## Consequences

Discord itself gates the timeout action behind `ModerateMembers`, not `BanMembers`/`KickMembers`. As a temporary backward-compat bridge, `MuteCommand`/`UnmuteCommand` require `(BanMembers AND KickMembers) OR ModerateMembers` rather than switching outright — existing mod roles keep working without an immediate permissions migration, while `ModerateMembers` alone is also sufficient. `Command.hasPermissions` only supported a single AND-set of permissions before this; it now needs to express an OR of two sets. This is intentionally transitional — revisit dropping the `BanMembers AND KickMembers` branch once servers have had time to grant `ModerateMembers` to their mod roles.

We are also assuming, unverified, that a Discord member timeout persists across the member leaving and rejoining the guild — i.e. that leave/rejoin is not a mute-evasion technique. This assumption was not confirmed against Discord's official docs (a background research pass was started and then stopped before completing). If it turns out to be false, `UserJoinEventHandler` will need to re-apply a timeout on rejoin using the remaining duration in `moderationTimeouts`, the same anti-evasion behavior the old role-based mute had via `isMemberMuted`. Revisit if mute evasion via rejoin is ever reported.

`SetMuteRoleCommand` and `GetMuteRoleCommand` are removed outright (deleted, unregistered from `CommandCollection.ts`, dropped from `USERGUIDE.md`) — mute no longer touches a role at all, so they have nothing left to configure. The `muteRoleId` column in `moderationSettings` is left in the DB schema unused rather than migrated away, since dropping a live column is a separate concern from this change.

`WarnCommand`'s warn-threshold auto-escalation to mute is migrated the same way as `MuteCommand` (native timeout instead of role assignment), and `SetWarnPunishments` now requires a duration for `mute` entries, capped at 21 days — otherwise it would silently stop working once `muteRoleId` is permanently null.

Users caught mid-mute at deploy time are an out-of-scope manual ops step: unmute them with the old code (or strip the role manually) before this ships, rather than writing one-time migration code to convert an in-flight role-mute into an equivalent timeout.

The `moderationTimeouts` DB bookkeeping and restart re-arming (`ReadyEventHandler`) are kept for mute, mirroring `addBanTimeout`/`setBanTimeout`'s shape — but the callback no longer makes a Discord API call to end the mute (Discord already expires the timeout natively). It only writes the `UNMUTE` audit-log entry and cleans up the `moderationTimeouts` row, which `isMemberMuted()` depends on staying accurate.
