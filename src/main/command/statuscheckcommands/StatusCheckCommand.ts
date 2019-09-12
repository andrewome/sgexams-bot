import { Permissions } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';
import { StatusCheckCommandData } from './StatusCheckCommandData';

export class StatusCheckCommand extends Command {
    public execute(server: Server,
                   userPerms: Permissions,
                   messageReply: Function,
                   ...args: CommandArgs[]): CommandResult {

        const { uptime } = args[0] as StatusCheckCommandData;
        let upTimeInHours = (uptime/1000) / 3600;
        let rupTimeInHours = Math.floor(upTimeInHours);
        let upTimeInMinutes = (upTimeInHours - rupTimeInHours) * 60;
        let rupTimeInMinutes = Math.floor(upTimeInMinutes);
        let upTimeInSeconds = (upTimeInMinutes - rupTimeInMinutes) * 60;
        let rupTimeInSeconds = Math.floor(upTimeInSeconds);
        messageReply(`Keesiao Bot has gone keesiao for ${rupTimeInHours} hours, ${rupTimeInMinutes} minutes and ${rupTimeInSeconds} seconds.`);
        return new CommandResult(false, true);
    }
}