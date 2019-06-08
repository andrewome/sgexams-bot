import "./lib/env";
import { Client } from "discord.js";
import { MessageChecker } from "./message/MessageChecker";
import { ResponseFormatter } from "./message/ResponseFormatter";

const bot = new Client();
const bannedWords: string[] = ["fuck", "nigger", "nigga", "ching chong", "coon"];
bot.login(process.env.BOT_TOKEN);

bot.on("message", async (message) => {
    // If it's a bot, ignore :)
    if(message.author.bot)
        return;

    // Check message contents if it contains a bad word >:o
    try {
        let result = await new MessageChecker()
            .checkMessage(message.content, bannedWords);
        
        if(result.guilty) {
            new ResponseFormatter(message, result).sendResult();
        }
    } catch (err) {
        console.log(err);
    }
});

bot.on('ready', () => {
  console.log('I am ready!');
  console.log(`Banned words for this session are ${bannedWords}`);
});