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
        let content = this.message.content;

        // Generate strings
        let offenderStr = "";
        if(username === null) {
            offenderStr = `**${tag}**`;
        } else {
            offenderStr = `**${username}, aka ${tag}**`;
        }
        let report = `Offender: ${offenderStr}\nMessage ID: **${id}**\nMessage link: ${url}`;
        
        // Get list of words used
        let words = "";
        let contexts = "";
        for(let i of wordsUsed) {
            let word = i[0];
            let context = i[1];
            words += `${word}\n`;
            contexts += `${context}\n`;
        }

        //Some strings may be too long, stop it at 1024 chars.
        if(content.length > 1024) {
            content = content.substr(0, 980);
            content += "... (message too long)";
        }

        if(contexts.length > 1024) {
            contexts = contexts.substr(0, 980);
            contexts += "... (message too long)";
        }

        // Make embed
        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setTitle("❌Bad Word Detected❌")
            .addField("Report", report, false)
            .addField("Word Used", words, true)
            .addField("Context", contexts, true)
            .addField("Full Message", `**${tag}:** ${content}`, false)
            .setTimestamp();
        this.message.reply(embed);
    }
}