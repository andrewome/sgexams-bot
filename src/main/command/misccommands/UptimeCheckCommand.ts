import { Command } from '../Command';
import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';

export class UptimeCheckCommand extends Command {
    public static EMBED_TITLE = 'Uptime';

    /**
     * This method returns the uptime of the bot in days, hours,
     * minutes and seconds to the channel which this command
     * was called in. Days, hours, minutes and seconds are rounded
     * down to the nearest integer.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;
        let uptime = commandArgs.uptime!;
        const oneSecondInMs = 1000;
        const oneMinuteInMs = oneSecondInMs * 60;
        const oneHourInMs = oneMinuteInMs * 60;
        const oneDayInMs = oneHourInMs * 24;

        // Calculate days
        const upTimeInDays = Math.floor(uptime / oneDayInMs);
        uptime -= upTimeInDays * oneDayInMs;

        // Calculate hours
        const upTimeInHours = Math.floor(uptime / oneHourInMs);
        uptime -= upTimeInHours * oneHourInMs;

        // Calculate minutes
        const upTimeInMinutes = Math.floor(uptime / oneMinuteInMs);
        uptime -= upTimeInMinutes * oneMinuteInMs;

        // Calculate seconds
        const upTimeInSeconds = Math.floor(uptime / oneSecondInMs);

        // Generate and send output
        const upTimeDaysStr = `${upTimeInDays} day${this.addSIfPlural(upTimeInDays)}`;
        const upTimeHoursStr = `${upTimeInHours} hour${this.addSIfPlural(upTimeInHours)}`;
        const upTimeMinutesStr = `${upTimeInMinutes} minute${this.addSIfPlural(upTimeInMinutes)}`;
        const upTimeSecondsStr = `${upTimeInSeconds} second${this.addSIfPlural(upTimeInSeconds)}`;

        messageReply(this.generateGenericEmbed(
            UptimeCheckCommand.EMBED_TITLE,
            `${upTimeDaysStr}, ${upTimeHoursStr}, ${upTimeMinutesStr} and ${upTimeSecondsStr}`,
            UptimeCheckCommand.EMBED_DEFAULT_COLOUR,
        ));

        /* Check messages true */
        return new CommandResult(true);
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
