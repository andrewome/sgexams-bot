# discord.js v13 → v14 Migration Notes

## 1. Summary of scope

- **Repo:** `sgexams-bot` (Discord moderation/utility bot, TypeScript/Node.js)
- **Current version:** `discord.js: "^13.3.1"` per [package.json](../package.json)
- **Target version:** latest published v14.x, currently **`14.26.4`** on npm ([npm registry](https://registry.npmjs.org/discord.js/latest))
- **TL;DR impact on this repo:** This bot is a **prefix/message-command bot** — it has no slash-command (`CommandInteraction`/`ChatInputCommandInteraction`), no button/select-menu/modal code at all (`grep` for `MessageButton`, `MessageActionRow`, `MessageSelectMenu`, `CommandInteraction`, `.deferReply(` all return zero matches in `src/`). That eliminates the single biggest v14 migration surface (Components/Interactions) for most bots. What *is* heavily used and *will* break:
  - `MessageEmbed` (constructor + `addField`) — used in **~40 files**, ~100+ call sites.
  - `Permissions` (bitfield class + string flags) — used in **~30 files**.
  - `Intents.FLAGS.*` — used once in `src/main/App.ts`, but it's on the hot path (client construction, login flow).
  - `partials: ['MESSAGE', 'REACTION']` string array — one call site, `src/main/App.ts:47`.
  - Node.js runtime: `Dockerfile` currently pins `node:16-alpine3.14`, which is **below** the v14.16+ requirement of Node ≥ 18.
  - No usage of `Formatters`, `MessageButton`/`ActionRow`/`SelectMenu`, `ShardingManager`, or interaction-based replies was found — these categories are "not used in this repo."

---

## 2. Node.js version requirement

- discord.js **14.0.0** required **Node.js ≥ 16.9.0** (verified directly from the published `package.json`'s `engines` field: `curl https://registry.npmjs.org/discord.js/14.0.0` → `"engines": {"node": ">=16.9.0"}`).
- The requirement was bumped over time; confirmed by fetching `engines.node` from each npm-published version's `package.json`:
  - `14.0.0` – `14.12.0`: `>=16.9.0`
  - `14.14.0`: `>=16.11.0`
  - `14.16.0` through the current latest `14.26.4`: `>=18` ([npm registry, discord.js 14.26.4](https://registry.npmjs.org/discord.js/14.26.4))
- The official guide's prerequisites section also tells users to run `node -v` and update to the latest LTS before upgrading ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).

**Repo status:** `Dockerfile` pins `FROM node:16-alpine3.14` (verified via `grep -i "FROM node" Dockerfile`), and `devDependencies` in `package.json` list `"@types/node": "^16.11.10"`. Both are **below** the Node ≥18 floor required by any current v14.x release. These must be bumped as part of the upgrade — this is a hard blocker, not just a "nice to have."

---

## 3. Gateway Intents / Partials changes

**Per official docs:**
- `Intents.FLAGS.GUILDS` (string-keyed static flags object) → `GatewayIntentBits.Guilds` (a `PascalCase` numeric enum from `discord-api-types`/discord.js) ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- `partials: ['MESSAGE', 'REACTION']` (string array) → `partials: [Partials.Message, Partials.Reaction]` (enum array) ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- More broadly, v14 enums switched from `SCREAMING_SNAKE_CASE` string/number constants to `PascalCase` numeric-only enums across the library (`ApplicationCommandOptionTypes` → `ApplicationCommandOptionType`, etc.) ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- Discord's own Gateway docs describe intents as bitwise flags identifying which event categories a connection subscribes to, and flag `GUILD_MEMBERS`/`GUILD_PRESENCES`/`MESSAGE_CONTENT` as privileged ([Discord Developer Docs — Gateway Events / Intents](https://docs.discord.com/developers/events/gateway)); discord.js v14 simply renames the client-side representation of these same flags, it does not add newly *required* intents by itself.

**Repo status — applies, single hot spot:**
- `src/main/App.ts:3` imports `Intents` from `discord.js`.
- `src/main/App.ts:42-44` constructs the client with `Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING` — all need to become `GatewayIntentBits.Guilds`, `GatewayIntentBits.GuildMembers`, `GatewayIntentBits.GuildBans` (note: `GuildBans` itself was later split/renamed to `GuildModeration` in newer Discord API versions — verify current enum member name against the v14.26.4 docs at migration time), `GatewayIntentBits.GuildMessages`, `GatewayIntentBits.GuildMessageReactions`, `GatewayIntentBits.GuildMessageTyping`.
- `src/main/App.ts:47` — `partials: ['MESSAGE', 'REACTION']` needs to become `partials: [Partials.Message, Partials.Reaction]`.
- Because the bot reads message content (`OnMessageEventHandler`, word-checking/moderation features), it should double check whether `GatewayIntentBits.MessageContent` (a privileged intent introduced by Discord after v13 shipped) is also required now — this is a Discord API-level change, not just a discord.js rename, and needs to be enabled both in code and in the Discord Developer Portal ([Discord Developer Docs — Gateway Events / Intents](https://docs.discord.com/developers/events/gateway)).

---

## 4. Structure / Manager renames

**Per official docs:**
- `Guild#setRolePositions()` → `RoleManager#setPositions()`; `Guild#setChannelPositions()` → `GuildChannelManager#setPositions()`; `Guild#me` → `GuildMemberManager#me`; `Role.comparePositions()` → `RoleManager#comparePositions()` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- `MessageManager#fetch()` / `ThreadMemberManager#fetch()` merge their second options parameter into the first argument object ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- `CategoryChannel#children` becomes a manager instead of a plain `Collection` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- Channel type-guard methods (`channel.isText()`, `.isVoice()`, `.isDM()`) are removed in favor of comparing `channel.type` against the `ChannelType` enum ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).

**Repo status:**
- `setRolePositions`/`setChannelPositions`/`guild.me` — **not used in this repo** (`grep -rn "setRolePositions\|setChannelPositions\|guild.me" src/main` returned nothing beyond unrelated `.member` matches).
- `MessageManager#fetch()` **is** used, and is already called with a single options object: `src/main/command/moderationcommands/PurgeCommand.ts:129` — `const messages = await messageManager.fetch(options);` where `options: ChannelLogsQueryOptions = { limit: 100, before: lastId }`. This particular call site is already in the "merged object" shape the v14 API expects, but the `ChannelLogsQueryOptions` type name/shape itself may change under v14 typings and should be re-checked against `MessageManager#fetch` types in `14.26.4`.
- `.cache` access patterns (`GuildMemberRoleManager#cache`, `GuildManager#cache`) remain valid in v14 and are used at: `src/main/command/moderationcommands/MuteCommand.ts:85`, `src/main/command/moderationcommands/UnmuteCommand.ts:76`, `src/main/command/moderationcommands/WarnCommand.ts:127`, `src/main/modules/birthday/BirthdayAnnouncer.ts:65`. No rename affects these — flagged only because the task asked to check `.cache` usage explicitly; no action needed here beyond a typecheck pass.
- `GuildMemberManager`, `GuildChannelManager`, `GuildEmojiManager`, `RoleManager`, `MessageManager` type imports are used as type annotations throughout `src/main/command/classes/CommandArgs.ts:2-3`, `src/main/modules/moderation/ModUtil.ts:1`, `src/main/eventhandler/ReadyEventHandler.ts:1`, `src/main/command/moderationcommands/WarnCommand.ts:2`, `src/main/command/moderationcommands/PurgeCommand.ts:2`. These class names are unchanged in v14, so only re-verification of method signatures on them (not renames) is needed.
- `channel.isText()/.isVoice()/.isDM()` type guards — **not used in this repo** (`grep -rn "isText\|isVoice()\|isDM()"` returned nothing). One incidental match, `StarboardResponse.ts:38` (`msgEmbed.type === 'image'`), is unrelated (it's an embed's `type` field, not a channel type guard).

---

## 5. Interaction / Slash-command API changes

**Per official docs:** v14 moves to Discord API v10, changes interaction reply/defer flows, and introduces builder-based slash command definitions (`SlashCommandBuilder`), autocomplete interaction handling, etc. ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)); Discord's own interactions documentation covers the underlying API v10 interaction/response contract this all sits on top of ([Discord Developer Docs — Gateway Events](https://docs.discord.com/developers/events/gateway)).

**Repo status: not used in this repo.** Confirmed via multiple greps returning zero matches in `src/`:
- `grep -rn "CommandInteraction" src/` → no results
- `grep -rn "SlashCommand\|ChatInputCommand\|interactionCreate\|@discordjs/builders" src/` → no results
- `grep -rn "\.reply(\|\.deferReply(\|\.editReply(\|\.followUp(" src/` → no results

The bot only listens for `messageCreate`/`message` events and replies via a plain message-reply callback — see `src/main/command/Command.ts:68` (`await messageReply({ embeds: [embed] });`) and the `messageReply` type defined in `src/main/command/classes/CommandArgs.ts:9` (`(options: string | MessagePayload | ReplyMessageOptions): Promise<Message>`). This is `Message#reply()`, not interaction reply — a different, largely-unaffected code path. No slash-command migration is needed unless the bot later adds application commands.

---

## 6. Embed changes (`MessageEmbed` → `EmbedBuilder`)

**Per official docs:**
- `MessageEmbed` is renamed/replaced by `EmbedBuilder` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- The constructor signature is `new EmbedBuilder(data?: Partial<APIEmbed>)` — it still accepts an optional plain-object of embed data, so both `new EmbedBuilder()` and `new EmbedBuilder({ title: 'x' })` remain valid patterns ([discord.js.org — EmbedBuilder class docs](https://discord.js.org/docs/packages/discord.js/main/EmbedBuilder:Class)).
- `EmbedBuilder#addField()` is removed; use `addFields()` (which takes an array/spread of field objects, not positional `name, value, inline` args) ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- `setAuthor()` and `setFooter()` now take a single options object instead of positional arguments ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- Received/API-returned embeds are now immutable plain objects; only `EmbedBuilder` instances are mutable/chainable ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).

**Repo status — applies extremely broadly.** `grep -rn "MessageEmbed" src/` shows **~40 files** importing/using `MessageEmbed`, both `new MessageEmbed()` and `new MessageEmbed({ ... })` object-literal forms, e.g.:
- `src/main/eventhandler/ModLogUpdateEventHandler.ts:1,44` — `import { MessageEmbed, ... }`, `const embed = new MessageEmbed();`
- `src/main/modules/birthday/BirthdayAnnouncer.ts:2,111` — `new MessageEmbed({ ... })` object-literal constructor form
- `src/main/command/Command.ts:2,80` — base-class helper `generateGenericEmbed()` returns `new MessageEmbed()`, used by every command subclass
- `src/main/command/starboardcommands/StarboardSetChannelCommand.ts`, `StarboardGetChannelCommand.ts`, `StarboardRemoveEmojiCommand.ts`, `StarboardGetThresholdCommand.ts`, `StarboardGetEmojiCommand.ts`, `StarboardSetThresholdCommand.ts`, `StarboardAddEmojiCommand.ts` — all import and return `MessageEmbed`
- `src/main/command/moderationcommands/*.ts` (Kick, Mute, Ban, Warn, Unban, Unwarn, Unmute, ModLogs, Purge, SetModLogChannel, GetModLogChannel, SetMuteRole, GetMuteRole, SetWarnPunishments, GetWarnPunishments) — all use `MessageEmbed`
- `src/main/command/messagecheckercommands/*.ts` (AddWord, RemoveWord, ListWords, SetResponseMessage, GetResponseMessage, SetReportChannel, GetReportChannel, SetDeleteMessage) — all use `MessageEmbed`
- `src/main/command/birthdaycommands/*.ts` (ListBirthdays, SetBirthdayChannel, SetBirthday) and `src/main/command/helpcommands/HelpCommandBase.ts:1,17` — all use `MessageEmbed`
- Also ~15 files under `src/test/` import `MessageEmbed`.

`.addField()` call sites needing conversion to `.addFields()` (positional args → single field-object or array):
- `src/main/modules/starboard/StarboardResponse.ts:55,93`
- `src/main/command/moderationcommands/ModLogsCommand.ts:192`
- `src/main/command/moderationcommands/BanCommand.ts:120,121`
- `src/main/modules/messagechecker/response/MessageResponse.ts:86-88` (chained `.addField().addField().addField()`)
- `src/main/command/moderationcommands/KickCommand.ts:101`, `UnwarnCommand.ts:105`, `UnmuteCommand.ts:120`, `UnbanCommand.ts:88`, `WarnCommand.ts:174`
- `src/main/command/Command.ts:81`
- `src/main/command/moderationcommands/MuteCommand.ts:149,150`
- `src/main/command/messagecheckercommands/MsgCheckerAddWordCommand.ts:74,84,90`, `MsgCheckerRemoveWordCommand.ts:74,84,90`
- `src/main/command/helpcommands/HelpCommandBase.ts:23`
- `src/main/eventhandler/ModLogUpdateEventHandler.ts:45,51,54,56,57,58,61` (7 calls in one handler)

Given the sheer count (~30 call sites across ~20 files), this is the single largest mechanical-refactor category in the whole migration, but it is a fairly uniform find/replace: rename the import, `new MessageEmbed(...)` → `new EmbedBuilder(...)`, and each `.addField(name, value, inline?)` → `.addFields({ name, value, inline })`.

---

## 7. Message Components (buttons/select menus/action rows)

**Per official docs:**
- `MessageButton` → `ButtonBuilder`, `MessageActionRow` → `ActionRowBuilder`, `MessageSelectMenu` → `StringSelectMenuBuilder`, `TextInputComponent` → `TextInputBuilder`, `Modal` → `ModalBuilder`, `MessageAttachment` → `AttachmentBuilder` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- Style enums drop the `Message` prefix and switch to `PascalCase`, e.g. `MessageButtonStyles` → `ButtonStyle` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- `StringSelectMenuBuilder#addOption()` is removed in favor of `addOptions()` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- Components received from the API are immutable; `ComponentBuilder.from()` must be used to get a mutable copy ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).

**Repo status: not used in this repo**, confirmed by zero-match greps:
- `grep -rn "MessageButton" src/` → no results
- `grep -rn "MessageActionRow" src/` → no results
- `grep -rn "MessageSelectMenu" src/` → no results

`MessageAttachment` **is** used (type-only), and per the guide it is renamed to `AttachmentBuilder`:
- `src/main/modules/starboard/StarboardResponse.ts:2,29` — `import { ..., MessageAttachment, ... }`, `attachments: Collection<string, MessageAttachment>`

This single reference should become `AttachmentBuilder` (or, if it's only typing *received* attachments rather than constructing new ones, it may map to the plain `Attachment` structure class instead — worth double-checking against the `14.26.4` docs since "received" vs "sent" attachment types diverged in v14).

---

## 8. Other commonly-hit breaking changes (Permissions, Formatters, Collection, sharding)

**Per official docs:**
- `Permissions` → `PermissionsBitField`; permission flag names move from a `Permissions` static `FLAGS` string-map into `PermissionFlagsBits` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14); [discord.js.org — PermissionsBitField class docs](https://discord.js.org/docs/packages/discord.js/main/PermissionsBitField:Class), which confirms `PermissionsBitField.Flags`/`PermissionFlagsBits` hold the "numeric permission flags" and the class exposes `has()`, `add()`, `remove()`, `serialize()`).
- Thread permissions `USE_PUBLIC_THREADS`/`USE_PRIVATE_THREADS` are removed; `MANAGE_EMOJIS_AND_STICKERS` → `ManageGuildExpressions` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- `@discordjs/formatters` now exports plain top-level functions (`bold()`, `italic()`, `codeBlock()`, etc.) rather than static methods on a `Formatters` class ([discord.js.org — @discordjs/formatters package docs](https://discord.js.org/docs/packages/formatters/main), which documents `codeBlock` as a standalone exported function and describes the package as "a collection of functions for formatting strings").
- Constants restructuring: `Constants.Opcodes` → `GatewayOpcodes`, `Constants.WSEvents` → `GatewayDispatchEvents`, `Constants.WSCodes` → `GatewayCloseCodes`, `InviteScopes` → `OAuth2Scopes` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).
- Event renames: `message` → `messageCreate`, `interaction` → `interactionCreate` ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)) — note this rename actually happened in v13 already for `messageCreate`.
- Package cleanup: the guide explicitly recommends uninstalling any standalone `@discordjs/builders`, `@discordjs/formatters`, `@discordjs/rest`, `discord-api-types` packages before upgrading, since v14's `discord.js` bundles/re-exports them and version-mismatches between a standalone install and discord.js's bundled version can cause type/runtime conflicts ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14)).

**Repo status:**
- `Permissions` **is used heavily** — `grep -rn "Permissions" src/` shows it imported and instantiated in **~30 files**, always via the pattern `new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS'])` with string-array flag names, e.g.:
  - `src/main/command/Command.ts:45-50` — base class `hasPermissions(commandPermissions: Permissions, userPermissions: Readonly<Permissions>)` using `userPermissions.has(commandPermissions)`
  - `src/main/command/moderationcommands/BanCommand.ts:19` — `private permissions = new Permissions(['BAN_MEMBERS']);`
  - `src/main/command/moderationcommands/KickCommand.ts:19` — `new Permissions(['KICK_MEMBERS'])`
  - `src/main/command/moderationcommands/PurgeCommand.ts:19` — `new Permissions(['MANAGE_MESSAGES'])`
  - Similarly in `MuteCommand.ts:20`, `UnmuteCommand.ts:19`, `WarnCommand.ts:22`, `UnwarnCommand.ts:21`, `UnbanCommand.ts:19`, `GetWarnPunishmentsCommand.ts:22`, `SetWarnPunishmentsCommand.ts:21`, `ModLogsCommand.ts:27`, `SetModLogChannelCommand.ts:29`, `GetModLogChannelCommand.ts:19`, `SetMuteRoleCommand.ts:25`, `GetMuteRoleCommand.ts:19`, and all `StarboardSetChannelCommand.ts`/`StarboardGetChannelCommand.ts`/etc. and `MsgCheckerAddWordCommand.ts`/etc. command classes (each ~2 lines)
  - `src/main/command/classes/CommandArgs.ts:2,17` — `memberPerms: Readonly<Permissions>;` type field, populated per-message from the guild member's permissions
  - `src/test/command/Command.test.ts:19-48` and ~15 other test files construct `new Permissions([...])` directly for fixtures

  All of these string flag names (`'KICK_MEMBERS'`, `'BAN_MEMBERS'`, `'MANAGE_MESSAGES'`, `'ADMINISTRATOR'`, `'MANAGE_CHANNELS'`) need to move to `PermissionFlagsBits.KickMembers` etc. under `PermissionsBitField`, and `new Permissions([...])` becomes `new PermissionsBitField([...])` (or the array can be passed straight to `PermissionsBitField.resolve()`/kept as bigint flags, since v13 `Permissions` internally used bitfields already — the API shape here is very close, mostly a class-name + flag-name swap).

- `Formatters` — **not used in this repo.** The `Formatters` search matched only unrelated `} from 'discord.js';` import-closing lines, not `Formatters.bold()`/etc. calls (`grep -rn "Formatters" src/` returns no real usage). No action needed.
- `Collection` — used only as a type annotation at `src/main/modules/starboard/StarboardResponse.ts:2,29` (`attachments: Collection<string, MessageAttachment>`); `@discordjs/collection`'s `Collection` class itself is unchanged in v14, so this is not a breaking-change hot spot beyond the `MessageAttachment` generic parameter noted in Section 7. The repo's own `CommandCollection` class (`src/main/command/classes/CommandCollection.ts`) is an unrelated, bot-defined class with no discord.js relationship.
- Sharding (`ShardingManager`, etc.) — **not used in this repo** (`grep -rn "Shard" src/main` returns no results).
- Channel-position/thread-permission renames (`ManageGuildExpressions`, `USE_PUBLIC_THREADS`) — **not used in this repo** (no matches for those flag strings in `src/`).

---

## Suggested migration order

Synthesizing the official guide's recommended flow ([discord.js Guide — Updating to v14](https://discordjs.guide/legacy/additional-info/changes-in-v14), whose "Before you start" section leads with Node.js version and package hygiene before touching any code) with this repo's actual hot spots:

1. **Bump the Node.js runtime first**, before touching any discord.js code — update `Dockerfile`'s `FROM node:16-alpine3.14` to `node:18-alpine` or newer, bump `"@types/node"` in `package.json` accordingly, and confirm CI/deploy environments run Node ≥18 (the current latest discord.js, `14.26.4`, hard-requires it — see Section 2). This is a prerequisite the app simply won't boot without.
2. **Upgrade the `discord.js` dependency** in `package.json` from `^13.3.1` to `^14.26.4` (or `^14`, latest at time of migration) and run `npm install`. Since the repo has no standalone `@discordjs/builders`/`@discordjs/rest`/`@discordjs/formatters`/`discord-api-types` dependencies of its own (confirmed via `package.json`'s dependency list), the guide's "uninstall stray packages" step is not needed here.
3. **Fix the client bootstrap** in `src/main/App.ts`: swap `Intents.FLAGS.*` → `GatewayIntentBits.*` (App.ts:42-44) and `partials: ['MESSAGE', 'REACTION']` → `partials: [Partials.Message, Partials.Reaction]` (App.ts:47). Also confirm whether `GatewayIntentBits.MessageContent` needs to be added and enabled in the Developer Portal, since this bot reads message content for moderation (Section 3). Fixing this first lets the bot at least connect and start emitting events again, which unblocks manual testing of everything else.
4. **Do the mechanical `Permissions` → `PermissionsBitField` / `PermissionFlagsBits` rename** across the ~30 command files and CommandArgs.ts (Section 8). This is high-volume but low-risk/high-uniformity — good to batch as one pass, e.g. with a codemod or careful find/replace, then let the TypeScript compiler point out any remaining spots.
5. **Do the mechanical `MessageEmbed` → `EmbedBuilder` rename**, including converting every `.addField(name, value, inline)` call to `.addFields({ name, value, inline })` (Section 6) — this is the largest single category (~40 files, ~30 `addField` call sites) and is best done as its own pass after Permissions, since many files touch both and mixing them makes diffs harder to review.
6. **Fix the lone `MessageAttachment` reference** in `StarboardResponse.ts` (Section 7) — verify against v14.26.4 docs whether it should become `AttachmentBuilder` or the plain `Attachment` structure type, since this file only *receives* attachments rather than constructing them.
7. **Run the full test suite and `tsc --noEmit`** — since this bot has an extensive `src/test/` suite that also imports `MessageEmbed`/`Permissions` directly for fixtures (Sections 6 and 8), the compiler and tests together should catch nearly all remaining breakage; there is no slash-command/interaction/component surface to manually re-test (Sections 4 and 7 are no-ops for this repo), so risk is concentrated entirely in embeds, permissions, and the intents/partials bootstrap.
8. **Manually smoke-test** the moderation commands (ban/kick/mute/warn/purge), starboard, birthday, and message-checker flows end-to-end in a test guild, since these are the modules with the highest `MessageEmbed`/`Permissions` call-site density and the most to lose from a subtle `.addFields()` argument-shape mistake.
