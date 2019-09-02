/* eslint-disable prefer-destructuring, no-shadow */
import {
 Permissions, Channel, Collection, Emoji, TextChannel, Message, MessageReaction,
 User, ReactionCollectorOptions,
} from 'discord.js';
import sharp, { Sharp } from 'sharp';
import axios from 'axios';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { RotateImageCommandData } from './RotateImageCommandData';
import { CommandArgs } from '../classes/CommandArgs';

export class RotateImageCommand extends Command {
    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private commandArgs: string[];

    private ANTICLOCKWISE = '↪';

    private CLOCKWISE = '↩';

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

    public execute(server: Server,
                   userPerms: Permissions,
                   messageReply: Function,
                   ...arg:
                    (Collection<string, Channel> |
                     Collection<string, Emoji> |
                     CommandArgs)[]): CommandResult {
        const { channel, userId } = (arg[0] as RotateImageCommandData);
        const messageId = this.commandArgs[0];

        // Check if messageId quoted is in in the channel
        (channel as TextChannel).fetchMessage(messageId)
            .then(async (message: Message): Promise<void> => {
                const { embeds, attachments } = message;

                // Attachments take precedence.
                let url = '';
                if (embeds.length !== 0) {
                    url = embeds[0].url;
                }

                if (attachments.size !== 0) {
                    url = attachments.array()[0].url;
                }

                // Set up react collector
                let img: Sharp;
                let angle = 0;
                const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                img = sharp(data);
                const buff = await img.toBuffer();
                const sentMessage = await messageReply({
                    files: [{
                        attachment: buff,
                    }],
                });
                await sentMessage.react(this.ANTICLOCKWISE);
                await sentMessage.react(this.CLOCKWISE);

                // Filter for reaction collector
                const filter = (reaction: MessageReaction, user: User): boolean => {
                    const { name } = reaction.emoji;
                    const reactionUserId = user.id;

                    // Only respond to reactions by the person who requested it.
                    if (reactionUserId !== userId) {
                        return false;
                    }

                    // If it's of the correct reactions, emit event
                    if (name === this.CLOCKWISE || name === this.ANTICLOCKWISE) {
                        return true;
                    }

                    return false;
                };

                // Options
                const options: ReactionCollectorOptions = { time: 30000, max: 1 };
                const collector = sentMessage.createReactionCollector(filter, options);
                const COLLECT = 'collect';

                // onReaction function to handle the event. This is a recursive function to
                // create a new collector because the original message is deleted after each
                // reaction. That's why max is also set to 1. Because we do not want the
                // collector to remain hanging around in the stack for too long when
                // 1 is enough.
                const onReaction = async (reaction: MessageReaction): Promise<void> => {
                    const { name } = reaction.emoji;
                    const { message } = reaction;

                    // Apparently you have to add/minus the 90's. Probably an absolute scale.
                    if (name === this.ANTICLOCKWISE) {
                        angle -= 90;
                        img = img.rotate(angle);
                    }

                    if (name === this.CLOCKWISE) {
                        angle += 90;
                        img = img.rotate(angle);
                    }

                    const buff = await img.toBuffer();

                    // Delete message and send new message.
                    // This is because attachments cannot be edited.
                    await message.delete();
                    const sentMessage = await messageReply({
                        files: [{
                            attachment: buff,
                        }],
                    });
                    await (sentMessage as Message).react(this.ANTICLOCKWISE);
                    await (sentMessage as Message).react(this.CLOCKWISE);

                    // Set up a new collector
                    const collector
                        = (sentMessage as Message).createReactionCollector(filter, options);

                    // Make it listen
                    collector.on(COLLECT, onReaction);
                };

                // Set up initial event handler.
                collector.on(COLLECT, onReaction);
            })
            .catch((err): void => {
                messageReply('Not a valid message ID.\n' +
                             'Please check if the message\n' +
                             '1) contains an image\n2) is in this channel.\n\n' +
                             '**Usage:** @bot rotate <message ID>\n');
            });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
