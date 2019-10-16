[![Build Status](https://travis-ci.com/andrewome/sgexams-bot.svg?branch=master)](https://travis-ci.com/andrewome/sgexams-bot)
# r/SGExams Bot

# Introduction
This bot is written in `Typescript` using `Discord.js`  - [https://github.com/discordjs/discord.js/](https://github.com/discordjs/discord.js/)

# Getting Started
1. `git clone` this repositry.
2. `npm i` to install dependencies.
3. Add `BOT_TOKEN="your discord bot token"` to a file called `.env` in the root of this project.
4. You're ready!
   * `npm run-script build` to transpile the code into `javascript`. Output files can be found in `./build`
   * `npm start` to use `ts-node` and `nodemon` for testing.
   * `npm test` to run tests.
   * `npx eslint ./src/**` to check for code style violations.

# Guides
[User Guide](docs/USERGUIDE.md)
Dev Guide (Under construction indefinitely :)

# Contributing
Feel free to fork and submit pull requests. 
Run `npm test` and `eslint ./src/**` and **make sure all tests and code style checks are passed!**
