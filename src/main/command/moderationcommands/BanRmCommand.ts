import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';
import { Command } from '../Command';
import { BanCommand } from './BanCommand';

export class BanRmCommand extends Command {
    public static readonly NAME = 'BanRM';

    public static readonly DESCRIPTION =
        'Bans a User and removes all messages sent by the user in the last 24 hours.';

    private actualCommand: BanCommand;

    constructor(args: string[]) {
        super();
        this.actualCommand = new BanCommand(args, true);
    }

    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        return this.actualCommand.execute(commandArgs);
    }
}
