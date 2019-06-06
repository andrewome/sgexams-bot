import "./lib/env";
import { Client } from "discord.js";
import { checkForBannedWords, getContextOfBannedWord } from "./lib/parsingFunctions";

const bot = new Client();
const bannedWords: string[] = ["shit", "damn"];
bot.login(process.env.BOT_TOKEN);

bot.on("message", (message) => {
    // If it's a bot, ignore :)
    if(message.author.bot)
        return;

    // Check message contents if it contains a bad word >:o
    let content = message.content;
    let bannedWordsFound = checkForBannedWords(content, bannedWords);
    let contextOfBannedWords: Set<String> = getContextOfBannedWord(content, bannedWordsFound);
    console.log(contextOfBannedWords);
})

bot.on('ready', () => {
  console.log('I am ready!');
});