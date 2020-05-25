import {
    Permissions, MessageEmbed,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class GetWarnPunishmentsCommand extends Command {
    public static EMBED_TITLE = 'Warn Punishments';

    public static NO_SETTINGS_FOUND = 'Warn punishments not set on this server';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function gets the warn-actions from the database
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        const rows = ModDbUtils.getWarnSettings(server.serverId);

        if (!rows.length) {
            messageReply(this.generateNoSettingsFoundEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        messageReply(this.generateEmbed(rows));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This function outputs the warn punishments.
     *
     * @param  {{numWarns:number;type:ModActions;duration:number|null;}[]} rows
     * @returns void
     */
    private generateEmbed(rows: { numWarns: number; type: ModActions;
                                  duration: number|null; }[]): MessageEmbed {
        let out = '';
        for (const row of rows) {
            const { numWarns, type, duration } = row;
            out += `${numWarns} warns - ${type} `;
            out += (duration ? `${duration} seconds\n` : 'forever\n');
        }
        return this.generateGenericEmbed(
            GetWarnPunishmentsCommand.EMBED_TITLE,
            out,
            GetWarnPunishmentsCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateNoSettingsFoundEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            GetWarnPunishmentsCommand.EMBED_TITLE,
            GetWarnPunishmentsCommand.NO_SETTINGS_FOUND,
            GetWarnPunishmentsCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
