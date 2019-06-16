import "./lib/env";
import { Client, Message, TextChannel } from "discord.js";
import { MessageChecker } from "./message/MessageChecker";
import { ResponseFormatter } from "./message/ReportFormatter";
import { performance } from "perf_hooks";
import { CommandParser } from "./command/CommandParser";
import { Server } from "./storage/Server";
import { Storage } from "./storage/Storage";

//const bannedWords: string[] = ["coon", "nigger", "fuck", "faggot", "fag", "ching chong", "chink", "chigga", "nigga", "negro", "negroe", "nibba", "nig", "chingchong"];

const bot = new Client();

const storage = new Storage().loadServers();

const getServer = (id: string): Server => {
    if(!storage.servers.has(id)) {
        storage.servers.set(id, new Server([], id));
    }

    return storage.servers.get(id)!;
}

bot.login(process.env.BOT_TOKEN);
bot.on("message", async (message: Message) => {
    // Retrieve server
    let server = getServer(message.guild.id.toString());
    let bannedWords = server.getBannedWords();
    let reportingChannelId = server.getReportingChannelId();

    // If it's a bot, ignore :)
    if(message.author.bot)
        return;

    // If it's a command, execute the command and save servers
    const commandParser = new CommandParser(message.content);
    if(commandParser.isCommand(bot.user.id.toString())) {
        commandParser.getCommand().execute(server, message);
        storage.saveServers();
    }

    // Check message contents if it contains a bad word >:o
    try {
        const t0 = performance.now();
        let result = await new MessageChecker()
            .checkMessage(message.content, bannedWords);
        if(result.guilty) {
            let embed = new ResponseFormatter(message, result)
                .generateEmbed();
            const timeTaken = (performance.now() - t0)/1000;
            if(reportingChannelId !== undefined) {
                let reportingChannel = message.guild.channels.get(reportingChannelId);
                if(typeof reportingChannel !== "undefined") {
                    (reportingChannel as TextChannel).send(`That took ${timeTaken} seconds.`, embed);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
});

bot.on('ready', () => {
  console.log('I am ready!');
});