import { GuildMember, MessageEmbed, User } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { DatabaseConnection } from '../../DatabaseConnection';

export class KickCommand extends Command {
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private commandArgs: string[];

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

    public execute(commandArgs: CommandArgs): CommandResult {
        const { deleteFunction } = commandArgs;
        deleteFunction!();

        const target = this.commandArgs[0].replace(/[<@!>]/g, '');
        const reason = this.commandArgs.splice(1).join(' ');

        try {
            const { members, messageReply, userId } = commandArgs;
            if (members && userId) {
                // Check for Member in GuildManager
                members.fetch(target).then((guildMember: GuildMember) => {
                    guildMember.kick();
                    DatabaseConnection.addModeration(
                        guildMember.id,
                        userId,
                        'Kick',
                        reason,
                    );
                    this.sendEmbed(
                        commandArgs,
                        guildMember.user,
                        reason,
                        guildMember.displayHexColor,
                    );
                }).catch(() => {
                    // Sends Error Message
                    const messageEmbed = new MessageEmbed();
                    messageEmbed.setDescription('Unable to find a GuildMember with that ID.');
                    messageReply(messageEmbed);
                });
            }
        } catch {
            // Do Nothing
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private sendEmbed(commandArgs: CommandArgs,
                      target: User,
                      reason: string,
                      colour: string): void {
        const { messageReply } = commandArgs;
        const messageEmbed = new MessageEmbed();

        const targetAvatarUrl: string = target.displayAvatarURL();

        messageEmbed
            .setTitle(`${target.tag} was warned.`)
            .addField('Reason', reason)
            .setThumbnail(targetAvatarUrl)
            .setColor(colour);

        messageReply(messageEmbed);
    }
}
