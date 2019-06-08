import { Message } from "discord.js";
import { MessageCheckerResult } from "./MessageCheckerResult";
import { RichEmbed } from "discord.js";

export class ResponseFormatter {
    private message: Message;
    private result: MessageCheckerResult;

    constructor(message: Message, result: MessageCheckerResult) {
        this.message = message;
        this.result = result;
    }

    public sendResult() {
        const tag = this.message.author.tag;
        const username = this.message.member.nickname;
        const wordsUsed = this.result.bannedWordsUsed;
        const id = this.message.id;
        const url = this.message.url;

        // Generate strings
        const content = `**${username}:** ${this.message.content}`;
        let report = `Offender: **${username}** aka **${tag}**\nMessage ID: **${id}**\nMessage link: ${url}`;
        // Get list of words used
        let words = "";
        let contexts = "";
        for(let i of wordsUsed) {
            let word = i[0];
            let context = i[1];
            words += `${word}\n`;
            contexts += `${context}\n`;
        }

        // Make embed
        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setTitle("❌Bad Word Detected❌")
            .addField("Report", report, false)
            .addField("Word Used", words, true)
            .addField("Context", contexts, true)
            .addField("Full Message", content, false)
            .setTimestamp();
        this.message.reply(embed);
    }
}