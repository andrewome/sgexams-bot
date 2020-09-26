[![Build Status](https://travis-ci.com/andrewome/sgexams-bot.svg?branch=master)](https://travis-ci.com/andrewome/sgexams-bot)
# r/SGExams Bot

# Introduction
This bot is written in `Typescript` using `Discord.js`  - [https://github.com/discordjs/discord.js/](https://github.com/discordjs/discord.js/)
It uses `SQLite3` to store persistent code.

# Getting Started
1. `git clone` this repository.
2. `npm i` to install dependencies.
3. Add `BOT_TOKEN="your discord bot token"` to a file called `.env` in the root of this project.
4. You're ready!
   * `npm run build` to transpile the code into `javascript`. Output files can be found in `./build`
   * `npm start` to run the transpiled code.
   * `npm run dev` to use `ts-node-dev` for hot-reloading during development.
   * `npm test` to run tests.
   * `npx eslint ./src/**` to check for code style violations.

# Migrating to SQlite3
Before porting to `SQLite3`, storage was deserialised and saved into a json file. Here are the steps to convert the json into a `SQLite3` Database.

1. `node database/migrate.js`
2. If there is no errors in the console, we're done. Double check with a DB Browser Application to confirm that the data has been ported over properly.

# Guides
[User Guide](docs/USERGUIDE.md)

Dev Guide (Under construction indefinitely :))

# Contributing
Feel free to fork and submit pull requests. 
Run `npm test` and `eslint ./src/**` and **make sure all tests and code style checks are passed!**
