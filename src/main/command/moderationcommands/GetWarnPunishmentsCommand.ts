import {
    Permissions,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class GetWarnPunishmentsCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS']);

    private NO_SETTINGS_FOUND = 'Warn punishments not set on this server';

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

        if (!rows) {
            messageReply(this.NO_SETTINGS_FOUND);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        this.generateReply(rows, messageReply);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This function outputs the warn punishments.
     *
     * @param  {{numWarns:number;type:ModActions;duration:number|null;}[]} rows
     * @param  {Function} messageReply
     * @returns void
     */
    private generateReply(rows: { numWarns: number; type: ModActions;
                                  duration: number|null; }[],
                          messageReply: Function): void {
        let out = '';
        for (const row of rows) {
            const { numWarns, type, duration } = row;
            out += `${numWarns} warns - ${type} `;
            out += (duration ? `${duration} seconds\n` : 'forever\n');
        }
        messageReply(out);
    }
}
