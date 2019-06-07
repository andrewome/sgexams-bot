import "./lib/env";
import { Client } from "discord.js";
import { MessageChecker } from "./messagechecker/MessageChecker";

const bot = new Client();
const bannedWords: string[] = ["shit", "damn", "nigger", "ching chong"];
bot.login(process.env.BOT_TOKEN);

bot.on("message", async (message) => {
    // If it's a bot, ignore :)
    if(message.author.bot)
        return;

    // Check message contents if it contains a bad word >:o
    let result = await new MessageChecker()
        .checkMessage(message.content, bannedWords);
    console.log(result);
})

bot.on('ready', () => {
  console.log('I am ready!');
  console.log(`Banned words for this session are ${bannedWords}`);
});