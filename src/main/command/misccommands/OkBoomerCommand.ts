import { Message, TextChannel } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class OkBoomerCommand extends Command {
    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private commandArgs: string[];

    /** Emoji IDs/Unicode Emojis */
    private emojiSequence = ['🆗', '🇧', '🅾️', '🇴', '🇲', '🇪', '🇷'];

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

    /**
     * This method executes the ok boomer command.
     * It reacts ok boomer onto a specified message.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { channel, deleteFunction } = commandArgs;
        const messageId = this.commandArgs[0];

        // Delete message that sent this command to prevent spam.
        deleteFunction!();

        (channel as TextChannel).messages.fetch(messageId)
            .then(async (message: Message): Promise<void> => {
                for (const emoji of this.emojiSequence) {
                    // eslint-disable-next-line no-await-in-loop
                    await message.react(emoji);
                }
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch((err): void => {}); // Do nothing

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
