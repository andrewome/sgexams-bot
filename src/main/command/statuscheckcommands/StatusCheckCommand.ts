import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';
import { StatusCheckCommandData } from './StatusCheckCommandData';

export class StatusCheckCommand extends Command {

    public static EMBED_TITLE = 'Uptime Status:';

    /**
     * This method returns the uptime of the bot in hours,
     * minutes and seconds to the channel which this command
     * was called in. Hours, minutes and seconds are rounded down
     * to the nearest integer.
     * 
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
        const { uptime } = args[0] as StatusCheckCommandData;

        // Calculate hours
        const upTimeInHours = (uptime / 1000) / 3600;
        const roundedUpTimeInHours = Math.floor(upTimeInHours);

        // Calculate minutes
        const upTimeInMinutes = (upTimeInHours - roundedUpTimeInHours) * 60;
        const roundedUpTimeInMinutes = Math.floor(upTimeInMinutes);

        // Calculate seconds
        const upTimeInSeconds = (upTimeInMinutes - roundedUpTimeInMinutes) * 60;
        const roundedUpTimeInSeconds = Math.floor(upTimeInSeconds);

        // Generate and send output
        const upTimeHoursStr = `${roundedUpTimeInHours} hour` + this.addSIfPlural(roundedUpTimeInHours);
        const upTimeMinutesStr = `${roundedUpTimeInMinutes} minute` + this.addSIfPlural(roundedUpTimeInMinutes);
        const upTimeSecondsStr = `${roundedUpTimeInSeconds} second` + this.addSIfPlural(roundedUpTimeInSeconds);
        
        messageReply(
            new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR)
                .addField(StatusCheckCommand.EMBED_TITLE, `${upTimeHoursStr}, ${upTimeMinutesStr} and ${upTimeSecondsStr}`)
        );

        /* Save servers false, Check messages true */
        return new CommandResult(false, true);
    }

    /**
     * Literally returns the 's' behind if value is not 1.
     * 
     * @param  {number} value
     * @returns string
     */
    private addSIfPlural(value: number): string {
        return (value === 1) ? '' : 's';
    }
}