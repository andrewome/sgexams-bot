import { MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { deleteBirthday } from '../../modules/birthday/BirthdayDbUtil';

const SUCCESSFUL_COMMANDRESULT = new CommandResult(true);
const UNSUCCESSFUL_COMMANDRESULT = new CommandResult(false);

export class DeleteBirthdayCommand extends Command {
    public static readonly NAME = 'DeleteBirthday';

    public static readonly DESCRIPTION = "Deletes the user's birthday.";

    /**
     * Displays all the users with a birthday on the date given as an argument.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { userId, messageReply, server } = commandArgs;

        if (!userId) {
            await messageReply(this.generateInvalidEmbed());
            return UNSUCCESSFUL_COMMANDRESULT;
        }

        deleteBirthday(server.serverId, userId);

        await messageReply(
            this.generateGenericEmbed(
                'Birthday deleted',
                'Your birthday has been successfully deleted.',
                Command.EMBED_DEFAULT_COLOUR,
            ),
        );

        return SUCCESSFUL_COMMANDRESULT;
    }

    private generateInvalidEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            'Invalid user',
            'Please try again',
            Command.EMBED_ERROR_COLOUR,
        );
    }
}
