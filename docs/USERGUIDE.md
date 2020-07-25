# Currently Implemented Modules

- [Currently Implemented Modules](#currently-implemented-modules)
- [Commands](#commands)
- [Miscallenous Commands](#miscallenous-commands)
- [Moderation](#moderation)
- [Starboard](#starboard)
        - [Starboard Commands](#starboard-commands)
- [Message Checker](#message-checker)
        - [Message Checker Commands](#message-checker-commands)

# Commands
The bot listens to commands only if you tag it. Since this bot does not require constant commands, figured this was a better solution than using prefixes since it might clash with other bots.

The commands that the bot listens out for is case-insensitive.

# Miscallenous Commands
Just a collection of commands and features that do not need their own section :)

Command | Example | Description | Permissions
--- | --- | --- | ---
`Help` | `@bot Help` | Prints outs all commands that the bot is listening to. | None
`Uptime` | `@bot Uptime` | Displays how long the bot has been online for. | None
`Rotate` | `@bot Rotate messageId` | Reuploads the image in the message as stated in `messageId`, adds `↪` and `↩` reactions to the message and rotates the image by 90 degrees cw/ccw according to the reaction the user clicks on. | None
`OkBoomer` | `@bot OkBoomer messageId` | Adds predefined regional indicator reactions to the message in a specific order that spells "Okboomer". | None
`OkZoomer` | `@bot OkZoomer messageId` | Adds predefined regional indicator reactions to the message in a specific order that spells "Okzoomer". | None

# Moderation
Command | Example | Description | Permissions
--- | --- | --- | ---
`Kick` | `@bot kick userId [reason]` | Kicks a user from the server. | KICK_MEMBERS
`Ban` | `@bot ban userId [reason] [X{m\|h\|d}]` | Bans a user from the server with an optional timeout.<br> X is an integer followed by `m` for minutes, `h` for hours and `d` for days. This is optional and if not specified, it means that the timeout is permanent. | BAN_MEMBERS
`BanRM` | `@bot banrm userId [reason] [X{m\|h\|d}]` | Exactly the same as the `Ban` command, but it also deletes all messages sent by the user in the last 24 hours. | BAN_MEMBERS
`Unban` | `@bot unban userId [reason]` | Unbans a user from the server. | BAN_MEMBERS
`Mute` | `@bot mute userId [reason] [X{m\|h\|d}]` | Mutes a user from the server with an optional timeout.<br> X is an integer followed by `m` for minutes, `h` for hours and `d` for days. This is optional and if not specified, it means that the timeout is permanent. | KICK_MEMBERS, BAN_MEMBERS
`Unmute` | `@bot unmute userId [reason]` | Unmutes a user. | KICK_MEMBERS, BAN_MEMBERS
`Warn` | `@bot warn userId [reason]` | Warns a user. | KICK_MEMBERS, BAN_MEMBERS
`Purge` | `@bot purge numMessages [userId]` | Deletes messages from the channel this command is used in.<br> `numMessages` is the number of messages to fetch. <br>Optional `userId` can be specified to only delete messages from that user within the messages fetched.<br> **Only deletes messages that are under 2 weeks old due to Discord API limitations.** | MANAGE_MESSAGES
`SetMuteRole` | `@bot SetMuteRole [roleId]` | Sets the mute role that the bot will assign upon the `mute` command.<br> If `roleId` is not specified, the role is resetted. | KICK_MEMBERS, BAN_MEMBERS
`GetMuteRole` | `@bot GetMuteRole` | Displays the currently set Mute Role | KICK_MEMBERS, BAN_MEMBERS
`SetWarnPunishments` | `@bot SetWarnPunishments [numWarns-{MUTE\|BAN}[-X{m\|h\|d}] ...]` | Sets punishments when a user has accumulated a certain number of warnings.<br> `numWarns` is the number of warns the user has accumulated.<br> X is an integer followed by `m` for minutes, `h` for hours and `d` for days. This is optional and if not specified, it means that the timeout is permanent.<br> `@bot SetWarnPunishments 5-mute-3d 6-ban-7d 7-ban` will: <ul><li>mute the user for 3 days upon reaching 5 warnings</li><li>ban the user for 7 days upon reaching 6 warnings</li><li>ban the user permanently upon reaching 7 warnings</li></ul> | KICK_MEMBERS, BAN_MEMBERS
`GetWarnPunishments` | `@bot GetWarnPunishments` | Gets Warn threshold punishments | KICK_MEMBERS, BAN_MEMBERS
`SetModLogChannel` | `@bot SetModLogChannel [channelId]` | Sets the ModLog reporting channel. | KICK_MEMBERS, BAN_MEMBERS
`GetModLogChannel` | `@bot GetModLogChannel` | Displays the currently set ModLog channel | KICK_MEMBERS, BAN_MEMBERS
`ModLogs` | `@bot ModLogs [userId] [{KICK\|BAN\|MUTE\|WARN}]` | Displays moderation logs.<br> Optional userId and type filtering is available as well. If userId and type are specified, the position of the arguments matter. | KICK_MEMBERS, BAN_MEMBERS

# Starboard
This module creates a `Starboard` in the server. Whenever a message receives enough counts of a specified emoji reaction, the message will be posted onto the `Starboard` channel to be immortalised.

For the Starboard module to work, a channel, an emoji and a threshold must be set first.

This Starboard also supports multiple emojis, however the counts do not stack. An individual emoji reaction has to hit the threshold to make it to the Starboard.

Additionally, once a message has been posted on the Starboard based on a specific emoji, the count will only be edited by that emoji that it was posted onto the Starboard with.

If another emoji that the bot is listening to reaches the threshold on that message that already has been starred, nothing will happen.

##### Starboard Commands
Command | Example | Description | Permissions
--- | --- | --- | ---
`StarboardSetChannel` | `@bot StarboardSetChannel [channelId]` | Sets the Starboard channel where the bot will add messages that have reached the threshold.<br> If the `channelId` field is empty, the bot resets the channel. | KICK_MEMBERS, BAN_MEMBERS
`StarboardGetChannel` | `@bot StarboardGetChannel` | Displays the currently set Starboard channel | KICK_MEMBERS, BAN_MEMBERS
`StarboardAddEmoji` | `@bot StarboardAddEmoji emojiId` | Adds an emoji that the bot will look out for in messages. | KICK_MEMBERS, BAN_MEMBERS
`StarboardRemoveEmoji` | `@bot StarboardRemoveEmoji emojiId` | Removes an emoji that the bot is currently looking out for in messages. | KICK_MEMBERS, BAN_MEMBERS
`StarboardGetEmoji` | `@bot StarboardGetEmoji` | Displays the emojis that the bot is looking out for in messages. | KICK_MEMBERS, BAN_MEMBERS
`StarboardSetThreshold` | `@bot StarboardSetThreshold [value]` | Sets the emoji threshold for a message to be starred. Only positive values will be accepted.<br> If the `value` field is empty, the bot resets the threshold. | KICK_MEMBERS, BAN_MEMBERS
`StarboardGetThreshold ` | `@bot StarboardGetThreshold` | Displays the reaction threshold for a message to be starred. | KICK_MEMBERS, BAN_MEMBERS
# Message Checker
This module aims to detect blacklisted words that might be deliberately masked with...

1. **Non Numeric Characters**

| Blacklisted Word | Example |
| --- | --- |
| Banned | B a_n_n=e d |

2. **Padding with Junk Characters**

| Blacklisted Word | Example |
| --- | --- |
| Banned | xXBannedXx |

3. **Repeating Characters**

| Blacklisted Word | Example |
| --- | --- |
| Banned | Baaaaaaaaanned |

4. **LeetSpeak**

| Blacklisted Word | Example |
| --- | --- |
| Banned | B4nn3d |

Once a blacklisted word is detected, the bot will find the `context` in which the word was used.

| Blacklisted Word | Message | Context |
| --- | --- | --- |
| Coon | Hey, I saw a raccoon!  | raccoon

The bot will then query an English dictionary. If the word is a legitimate word, then it will ignore the detection.

Huge props to Datamuse - [http://www.datamuse.com/api/](http://www.datamuse.com/api/) which I'm using as an English dictionary!


##### Message Checker Commands
Command | Example | Description | Permissions
--- | --- | --- | ---
`MsgCheckerListWords`  | `@bot MsgCheckerListWords` | Displays all blacklisted words. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerAddWords`  | `@bot MsgCheckerAddWords [words ...]` | Add word(s) to the blacklist, multiple words separated by a space. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerRemoveWords`  | `@bot MsgCheckerRemoveWords [words ...]` | Remove word(s) from the blacklist, multiple words separated by a space. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerSetReportChannel`  | `@bot MsgCheckerSetReportChannel [channelId]` | Sets the reporting channel to post incident reports when blacklisted words are detected.<br> If no `channelId` is given, the reporting channel is resetted. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerGetReportChannel`  | `@bot MsgCheckerGetReportChannel` | Displays the currently set reporting channel. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerSetResponseMsg`  | `@bot MsgCheckerSetResponseMsg [response message]` | Sets the response message to the user upon detection of blacklisted words for this server.<br> Use the string `{user}` inside the message to have the bot tag the user.<br> If no message is given, the message is resetted. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerGetResponseMsg`  | `@bot MsgCheckerGetResponseMsg` | Displays the response message to the user upon detection of blacklisted words for this server. | KICK_MEMBERS, BAN_MEMBERS
`MsgCheckerSetDeleteMsg`  | `@bot MsgCheckerSetDeleteMsg {TRUE\|FALSE}` | Sets whether the bot should delete instances of blacklisted words being used. | KICK_MEMBERS, BAN_MEMBERS
