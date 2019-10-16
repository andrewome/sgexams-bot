# Currently Implemented Modules

1. [Miscallenous Commands](#misc-commands)
2. [Starboard](#starboard)
3. [Message Checker](#message-checker)

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

# Starboard
This module creates a `Starboard` in the server. Whenever a message receives enough counts of a specified emoji reaction, the message will be posted onto the `Starboard` channel to be immortalised.

For the Starboard module to work, a channel, an emoji and a threshold must be set first.

This Starboard also supports multiple emojis, however the counts do not stack. An individual emoji reaction has to hit the threshold to make it to the Starboard.
Additionally, once a message has been posted on the Starboard based on a specific emoji, the count will only be edited by that emoji that it was posted onto the Starboard with.
If another emoji that the bot is listening to reaches the threshold on that message that already has been starred, nothing will happen.

##### Starboard Commands
Command | Example | Description | Permissions
--- | --- | --- | ---
`StarboardSetChannel` | `@bot StarboardSetChannel [channelId]` | Sets the Starboard channel where the bot will add messages that have reached the threshold. If the `channelId` field is empty, the bot resets the channel. | KICK_USERS, DELETE_USERS
`StarboardGetChannel` | `@bot StarboardGetChannel` | Displays the currently set Starboard channel | KICK_USERS, DELETE_USERS
`StarboardAddEmoji` | `@bot StarboardAddEmoji emojiId` | Adds an emoji that the bot will look out for in messages. | KICK_USERS, DELETE_USERS
`StarboardRemoveEmoji` | `@bot StarboardRemoveEmoji emojiId` | Removes an emoji that the bot is currently looking out for in messages. | KICK_USERS, DELETE_USERS
`StarboardGetEmoji` | `@bot StarboardGetEmoji` | Displays the emojis that the bot is looking out for in messages. | KICK_USERS, DELETE_USERS
`StarboardSetThreshold` | `@bot StarboardSetThreshold [value]` | Sets the emoji threshold for a message to be starred. Only positive values will be accepted. If the `value` field is empty, the bot resets the threshold to `null`. | KICK_USERS, DELETE_USERS
`StarboardGetThreshold ` | `@bot StarboardGetThreshold` | Displays the reaction threshold for a message to be starred. | KICK_USERS, DELETE_USERS
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
`MsgCheckerListWords`  | `@bot MsgCheckerListWords` | Displays all blacklisted words. | KICK_USERS, DELETE_USERS
`MsgCheckerAddWords`  | `@bot MsgCheckerAddWords [words]` | Add word(s) to the blacklist, words can be seperated by a space. | KICK_USERS, DELETE_USERS
`MsgCheckerRemoveWords`  | `@bot MsgCheckerRemoveWords [words]` | Remove word(s) from the blacklist,  words can be seperated by a space.| KICK_USERS, DELETE_USERS
`MsgCheckerSetReportChannel`  | `@bot MsgCheckerSetReportChannel` [channel ID] | Sets the reporting channel to post incident reports when blacklisted words are detected. If no channel ID is given, the reporting channel is resetted. | KICK_USERS, DELETE_USERS
`MsgCheckerGetReportChannel`  | `@bot MsgCheckerGetReportChannel` | Displays the currently set reporting channel. | KICK_USERS, DELETE_USERS
`MsgCheckerSetResponseMsg`  | `@bot MsgCheckerSetResponseMsg` [response message] | Sets the response message to the user upon detection of blacklisted words for this server. Use `{user}` inside the message to have the bot tag the user. If no message is given, the message is resetted. | KICK_USERS, DELETE_USERS
`MsgCheckerGetResponseMsg`  | `@bot MsgCheckerGetResponseMsg` | Displays the response message to the user upon detection of blacklisted words for this server. | KICK_USERS, DELETE_USERS
`MsgCheckerSetDeleteMsg`  | `@bot MsgCheckerSetDeleteMsg true|false` | Sets whether the bot should delete instances of blacklisted words being used. | KICK_USERS, DELETE_USERS