import { Message, TextChannel } from "discord.js";
import { MessageCheckerResult } from "./MessageCheckerResult";
import { RichEmbed } from "discord.js";
import log from "loglevel";

export class MessageResponse {
    private message: Message;

    constructor(message: Message) {
        this.message = message;
    }

    /**
     * This function generates the response to the results from MessageChecker.
     * 
     * @param  {string|undefined} reportingChannelId Channel Id to send report to
     * @returns MessageResponse
     */
    public sendReport(result: MessageCheckerResult, reportingChannelId: string | undefined): MessageResponse {
        // If not set, don't send anything
        if(reportingChannelId === undefined) {
            return this;
        }

        const tag = this.message.author.tag;
        const username = this.message.member.nickname;
        const wordsUsed = result.contexts;
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
            let word = i.bannedWord;
            let context = i.originalContext;
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

        const reportingChannel = this.message.guild.channels.get(reportingChannelId)!;
        (reportingChannel as TextChannel).send(embed);      

        // Log it
        log.info(`Bad Word Detected in guild "${this.message.guild.name}". ${offenderStr.replace(/\*/g, "")} said "${content}" which has banned words: ${words.replace(/\n/g, " ")}`);

        return this;
    }
    /**
     * This function sends a preset message to the offending user.
     * 
     * @param  {string|undefined} message Message to send to user
     * @returns MessageResponse
     */
    public sendMessageToUser(message: string | undefined): MessageResponse {
        const channel = this.message.channel;
        const user = `<@${this.message.author.id}>`;

        // If message is undefined, don't do anything
        if(message === undefined)
            return this;
        
        // Send message
        message = message.replace(/{user}/g, user);
        log.info(`Sending response message - ${message}`);
        channel.send(message)
            .catch((err) => {
                if(err.message === "Missing Permissions")
                    log.warn("Unable to send message. Insufficient permissions.");
            });
        return this;
    }

    /**
     * Deletes the message in question.
     * 
     * @param  {boolean} deleteMessage Boolean of delete message option
     * @returns MessageResponse
     */
    public deleteMessage(deleteMessage: boolean): MessageResponse {
        if(!deleteMessage)
            return this;
        
        log.info("Deleting message...");
        this.message.delete()
            .catch((err) => {
                if(err.message === "Missing Permissions")
                    log.warn("Unable to delete message. Insufficient permissions.");
            });
        return this;
    }
}