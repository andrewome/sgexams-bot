import "./lib/env";
import { Client, Message, TextChannel } from "discord.js";
import { MessageChecker } from "./message/MessageChecker";
import { ResponseFormatter } from "./message/ReportFormatter";
import { performance } from "perf_hooks";
import { CommandParser } from "./command/CommandParser";
import { Server } from "./storage/Server";
import { Storage } from "./storage/Storage";

class App {
    private bot: Client;
    private storage: Storage;

    constructor() {
        this.bot = new Client();
        this.storage = new Storage().loadServers();
    }

    private getServer(id: string): Server {
        if(this.storage.servers.has(id) === false) {
            this.storage.servers.set(id, new Server([], id));
        }
        return this.storage.servers.get(id)!;
    }

    public login(): App {
        this.bot.login(process.env.BOT_TOKEN);
        return this;
    }

    public run() {
        this.bot.on("message", async (message: Message) => {
            // Retrieve server
            let server = this.getServer(message.guild.id.toString());
            let bannedWords = server.getBannedWords();
            let reportingChannelId = server.getReportingChannelId();
            let isValidReportingChannel = !(typeof reportingChannelId === "undefined");

            // If it's a bot, ignore :)
            if(message.author.bot)
                return;

            // If it's a command, execute the command and save servers
            const commandParser = new CommandParser(message.content);
            if(commandParser.isCommand(this.bot.user.id.toString())) {
                commandParser.getCommand().execute(server, message);
                this.storage.saveServers();
            }

            // Check message contents if it contains a bad word >:o
            try {
                const t0 = performance.now();
                let result = await new MessageChecker()
                    .checkMessage(message.content, bannedWords);
                if(result.guilty) {
                    let embed = new ResponseFormatter(message, result).generateEmbed();
                    const timeTaken = (performance.now() - t0)/1000;
                    if(isValidReportingChannel) {
                        let reportingChannel = message.guild.channels.get(reportingChannelId as string);
                        (reportingChannel as TextChannel).send(`That took ${timeTaken} seconds.`, embed);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });

        this.bot.on('ready', () => {
            console.log('I am ready!');
        });
    }
}

new App().login().run();