[![Build Status](https://travis-ci.com/andrewome/sgexams-bot.svg?branch=master)](https://travis-ci.com/andrewome/sgexams-bot)
# r/SGExams Bot

# Introduction
This bot is written in `Typescript` using `Discord.js`  - [https://github.com/discordjs/discord.js/](https://github.com/discordjs/discord.js/)
It uses `SQLite3` to store persistent code.

# Getting started

1. `git clone` this repository.
2. Install [Docker Engine](https://docs.docker.com/engine/install/).
3. Install [Docker Compose](https://docs.docker.com/compose/install/).
4. Add `BOT_TOKEN="your discord bot token"` to a file called `.env` in the root of this project.
5. You're ready!

# Running the bot

There are 2 ways to run the bot:

* [Development mode](#running-in-development)
* [Production mode](#running-in-production)

## Running in development

Run `npm run dev` to run a Docker container that uses `ts-node-dev` for hot-reloading during development.

## Running in production

Run `npm start` to spin up a Docker container that transpiles the server code and runs the server.

# Tests and linting

* Run `npm test` to spin up a Docker container that transpiles the server code and runs the tests.
* Run `npm run lint` to check for code style violations.

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
