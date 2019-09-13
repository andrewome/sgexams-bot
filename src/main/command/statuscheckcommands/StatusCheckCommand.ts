import { Permissions } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';
import { StatusCheckCommandData } from './StatusCheckCommandData';

export class StatusCheckCommand extends Command {
    /**
     * This function executes the statuscheck command.
     * @param  {Server} server
     * @param  {Permissions} userPerms
     * @param  {Function} messageReply
     * @param  {CommandArgs[]} ...args
     * @returns CommandResult
     */
    public execute(server: Server,
                   userPerms: Permissions,
                   messageReply: Function,
                   ...args: CommandArgs[]): CommandResult {
        //Calculation For Bot Uptime In Hours, Minutes and Seconds
        const { uptime } = args[0] as StatusCheckCommandData;
        //Hours
        const upTimeInHours = (uptime / 1000) / 3600;
        let rupTimeInHours = Math.floor(upTimeInHours);
        //Minutes
        let upTimeInMinutes = (upTimeInHours - rupTimeInHours) * 60;
        let rupTimeInMinutes = Math.floor(upTimeInMinutes);
        //Seconds
        let upTimeInSeconds = (upTimeInMinutes - rupTimeInMinutes) * 60;
        let rupTimeInSeconds = Math.floor(upTimeInSeconds);
        //Days
        let upTimeInDays = (upTimeInHours / 24);
        let rupTimeInDays = Math.floor(upTimeInDays);
        //Output
        messageReply(`Uptime: ${rupTimeInDays} days, ${rupTimeInHours} hours, ${rupTimeInMinutes} minutes and ${rupTimeInSeconds} seconds.`);

        return new CommandResult(false, true);
    }
}