import { MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { isDateValid, parseDate } from '../../modules/birthday/BirthdayUtil';
import { getUserIdsWithBirthday } from '../../modules/birthday/BirthdayDbUtil';

const SUCCESSFUL_COMMANDRESULT = new CommandResult(true);
const UNSUCCESSFUL_COMMANDRESULT = new CommandResult(false);

export class ListBirthdaysCommand extends Command {
    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * Displays all the users with a birthday on the date given as an argument.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply, server } = commandArgs;

        if (this.args.length < 1) {
            await messageReply(this.generateInvalidEmbed());
            return UNSUCCESSFUL_COMMANDRESULT;
        }
        const dateString = this.args[0];

        if (!isDateValid(dateString)) {
            await messageReply(this.generateInvalidEmbed());
            return UNSUCCESSFUL_COMMANDRESULT;
        }

        // Parse the date string in the format 'DD/MM'.
        const { day, month } = parseDate(dateString)!;

        // Get all users with the given birthdate.
        const userIds = getUserIdsWithBirthday(server.serverId, day, month);
        let description;
        if (userIds.length > 0) {
            description = userIds.map((id) => `<@!${id}>`).join('\n');
        } else {
            description = 'No users have a birthday on this day.';
        }
        await messageReply(
            this.generateGenericEmbed(
                `Birthdays on ${day}/${month}`,
                description,
                Command.EMBED_DEFAULT_COLOUR,
            ),
        );

        return SUCCESSFUL_COMMANDRESULT;
    }

    private generateInvalidEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            'Invalid birthday',
            'Please input the birthday in the format "DD/MM".',
            Command.EMBED_ERROR_COLOUR,
        );
    }
}
