import { Permissions } from 'discord.js';
import Jimp from 'jimp';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class RotateImageCommand extends Command {
    public static COMMAND_NAME = 'Rotate';

    public static COMMAND_NAME_LOWER_CASE = RotateImageCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Rotates an image by 90 degrees CCW or CW';

    private COUNTERCLOCKWISE = 'ccw';

    private CLOCKWISE = 'cw';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    public execute(server: Server,
                   userPerms: Permissions,
                   messageReply: Function): CommandResult {
        const dir = this.args[0].toLowerCase();
        const link = this.args[1];

        // Checks if is either ccw or cw.
        if (dir !== this.COUNTERCLOCKWISE && dir !== this.CLOCKWISE) {
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Check if it is a URL
        if (!(/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(link))) {
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }


        // Process image
        Jimp.read(link).then((img): void => {
            let resultImg;

            // rotate image
            if (dir === this.CLOCKWISE) {
                resultImg = img.rotate(270);
            } else {
                resultImg = img.rotate(90);
            }

            // Convert to buffer
            resultImg.getBufferAsync(resultImg.getMIME())
                .then((buff: Buffer): void => {
                    // Send buffer
                    messageReply({
                        files: [{
                            attachment: buff,
                        }],
                    });
            });
        })
        .catch((err): void => {
            // do nothing
        });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
