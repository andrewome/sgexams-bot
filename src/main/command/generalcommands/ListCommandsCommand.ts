import { Permissions, Message, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandParser } from '../CommandParser';

export class ListCommandsCommand extends Command {
    public static COMMAND_NAME = 'help';

    public static DESCRIPTION = 'Displays all the available commands that this bot listens to.';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private commands: string[];

    private descriptions: string[];

    /**
     * @param  {Set<string>} commands List of available commands
     * @param  {string[]} descriptions List of descriptions
     */
    public constructor() {
        super();
        this.commands = Array.from(CommandParser.commands);
        this.descriptions = CommandParser.descriptions;
    }

    /**
     * This function lists out the commands that the bot will respond to.
     *
     * @param  {Server} server
     * @param  {Message} message
     * @returns CommandResult
     */
    public execute(server: Server, message: Message): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, message.member.permissions)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Generate embed and send
        message.channel.send(this.generateEmbed());
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed to be sent back to user.
     *
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        let curTitle;
        let output = "";
        for (let i = 0; i < this.commands.length; i++) {
            if (this.descriptions[i] === CommandParser.EMPTY_STRING) {
                if (output !== "")
                    embed.addField(curTitle, output);
                curTitle = this.commands[i];
                output = "";
            } else {
                output += (this.descriptions[i] !== '\u200b')
                          ? `**${this.commands[i]}** - ${this.descriptions[i]}\n`
                          : '\n';
            }
        }
        embed.addField(curTitle, output);
        return embed;
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    public changeServerSettings(server: Server, ...args: any): void {
        throw new Error(Command.THIS_METHOD_SHOULD_NOT_BE_CALLED);
    }
    /* eslint-enable class-methods-use-this */
}
