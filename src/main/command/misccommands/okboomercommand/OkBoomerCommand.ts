import { TextChannel, Message } from 'discord.js';
import { Command } from '../../Command';
import { CommandResult } from '../../classes/CommandResult';
import { CommandArgs } from '../../classes/CommandArgs';

export class OkBoomerCommand extends Command {
	/** SaveServer: false, CheckMessage: true */
	private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);
	
	private commandArgs: string[];

	private emojiSequence = ['646591672276353034', '🇧','646589200195518464', '🇴', '🇲', '🇪', '🇷'];

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

	public execute(commandArgs: CommandArgs): CommandResult {
		const { messageReply, channel, userId } = commandArgs;
		const messageId = this.commandArgs[0];
		
		(channel as TextChannel).fetchMessage(messageId)
			.then(async (message: Message): Promise<void> => {
				for (let emoji of this.emojiSequence) {
					await message.react(emoji);
				};
			})
			.catch((err): void => {}); // Do nothing
		
		return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
	}
}