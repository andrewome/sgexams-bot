[![Build Status](https://travis-ci.com/andrewome/sgexams-bot.svg?branch=master)](https://travis-ci.com/andrewome/sgexams-bot)
# r/SGExams Bot

# Introduction
This bot is written in `Typescript` using `Discord.js`  - [https://github.com/discordjs/discord.js/](https://github.com/discordjs/discord.js/)

Also huge props to Datamuse - [http://www.datamuse.com/api/](http://www.datamuse.com/api/) which I'm using as an English dictionary!

# Currently Implemented Modules
1. [Message Checker (for banned words)](#About-Message-Checker)
2. Starboard (coming soon!)

# Commands
The bot listens to commands only if you tag it. Since this bot does not require constant commands, figured this was a better solution than using prefixes since it might clash with other bots.

##### General Commands
Command | Example | Description | Permissions
--- | --- | --- | ---
help | @bot help | Prints outs all commands that the bot is listening to. | KICK_USERS, DELETE_USERS

##### Message Checker
Command | Example | Description | Permissions
--- | --- | --- | ---
listwords | @bot listwords | Displays all blacklisted words. | KICK_USERS, DELETE_USERS
addwords | @bot addwords [words] | Add word(s) to the blacklist, words can be seperated by a space or a newline char (`\n`). | KICK_USERS, DELETE_USERS
removewords | @bot removewords [words] | Remove word(s) from the blacklist,  words can be seperated by a space or a newline char (`\n`).| KICK_USERS, DELETE_USERS
setreportchannel | @bot setreportchannel [channel ID] | Sets the reporting channel to post incident reports when blacklisted words are detected. If no channel ID is given, the reporting channel is resetted. | KICK_USERS, DELETE_USERS
getreportchannel | @bot getreportchannel | Displays the currently set reporting channel. | KICK_USERS, DELETE_USERS
setresponsemessage | @bot setresponsemessage [response message] | Sets the response message to the user upon detection of blacklisted words for this server. Use `{user}` inside the message to have the bot tag the user. If no message is given, the message is resetted. | KICK_USERS, DELETE_USERS
getresponsemessage | @bot getresponsemessage | Displays the response message to the user upon detection of blacklisted words for this server. | KICK_USERS, DELETE_USERS
setdeletemessage | @bot setdeletemessage true\|false | Sets whether the bot should delete instances of blacklisted words being used. | KICK_USERS, DELETE_USERS

# About: Message Checker
This module aims to detect blacklisted words that might be deliberately masked with

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

# Getting Started
1. `git clone` this repositry.
2. `npm i` to install dependencies.
3. Add `BOT_TOKEN="<your discord bot token>"` to `.env` in `root`
4. You're ready!
   * `npm run-script build` to transpile the code into `javascript`. Output files can be found in `./build`
   * `npm start` to use `nodemon` for testing.
   * `npm test` to run tests.

# Contributing
Feel free to fork and submit pull requests. 
Run `npm test` to **make sure all tests are passed!**
**
