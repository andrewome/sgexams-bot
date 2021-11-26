import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { deleteBirthday } from '../../modules/birthday/BirthdayDbUtil';

const SUCCESSFUL_COMMANDRESULT = new CommandResult(true);

export class DeleteBirthdayCommand extends Command {
    public static readonly NAME = 'DeleteBirthday';

    public static readonly DESCRIPTION = "Deletes the user's birthday.";

    /**
     * Deletes user's birthday from bot database.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { userId, messageReply, server } = commandArgs;

        deleteBirthday(server.serverId, userId!);

        await messageReply({
            embeds: [this.generateGenericEmbed(
                'Birthday deleted',
                'Your birthday has been successfully deleted.',
                Command.EMBED_DEFAULT_COLOUR,
            )],
        });

        return SUCCESSFUL_COMMANDRESULT;
    }
}
