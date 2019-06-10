import "./lib/env";
import { Client, Message } from "discord.js";
import { MessageChecker } from "./message/MessageChecker";
import { ResponseFormatter } from "./message/ReportFormatter";
import { performance } from "perf_hooks";

const bot = new Client();
const bannedWords: string[] = ["coon", "nigger", "fuck", "faggot", "fag", "ching chong", "chink", "chigga", "nigga", "negro", "negroe", "nibba", "nig", "chingchong"];
bot.login(process.env.BOT_TOKEN);

bot.on("message", async (message: Message) => {
    // If it's a bot, ignore :)
    if(message.author.bot)
        return;

    // Check message contents if it contains a bad word >:o
    try {
        const t0 = performance.now();
        let result = await new MessageChecker()
            .checkMessage(message.cleanContent, bannedWords);
        if(result.guilty) {
            //console.log(result);
            message.reply(new ResponseFormatter(message, result)
                   .generateEmbed());
            const timeTaken = (performance.now() - t0)/1000;
            message.channel.send(`That took ${timeTaken} seconds.`)
        }
    } catch (err) {
        console.log(err);
    }
});

bot.on('ready', () => {
  console.log('I am ready!');
  console.log(`Banned words for this session are ${bannedWords}`);
});