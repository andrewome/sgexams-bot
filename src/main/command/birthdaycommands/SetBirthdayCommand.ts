import { MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { prettifyDate, parseDate } from '../../modules/birthday/BirthdayUtil';
import { setBirthday } from '../../modules/birthday/BirthdayDbUtil';

const SUCCESSFUL_COMMANDRESULT = new CommandResult(true);
const UNSUCCESSFUL_COMMANDRESULT = new CommandResult(false);

export class SetBirthdayCommand extends Command {
    public static readonly NAME = 'SetBirthday';

    public static readonly DESCRIPTION = 'Sets your birthday announcement to the specified date.';

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This method executes the ok zoomer command.
     * It reacts ok zoomer onto a specified message.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { userId, messageReply, server } = commandArgs;

        if (this.args.length < 1) {
            await messageReply(this.generateInvalidEmbed());
            return UNSUCCESSFUL_COMMANDRESULT;
        }
        const dateString = this.args[0];
        const date = parseDate(dateString);

        if (!userId || !date) {
            await messageReply(this.generateInvalidEmbed());
            return UNSUCCESSFUL_COMMANDRESULT;
        }
        const { day, month } = date;

        // Store birthday into database
        setBirthday(server.serverId, userId, day, month);
        await messageReply(
            this.generateGenericEmbed(
                'Birthday set',
                `I'll announce your birthday on ${prettifyDate(date)}.`,
                Command.EMBED_DEFAULT_COLOUR,
            ),
        );

        return SUCCESSFUL_COMMANDRESULT;
    }

    private generateInvalidEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            'Invalid birthday',
            'Please input a valid date in the format "DD/MM".',
            Command.EMBED_ERROR_COLOUR,
        );
    }
}
