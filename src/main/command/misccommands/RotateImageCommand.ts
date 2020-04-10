/* eslint-disable prefer-destructuring, no-shadow */
import {
    TextChannel, Message, MessageReaction,
    User, ReactionCollectorOptions,
} from 'discord.js';
import sharp, { Sharp } from 'sharp';
import axios from 'axios';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class RotateImageCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private commandArgs: string[];

    private ANTICLOCKWISE = '↪';

    private CLOCKWISE = '↩';

    private ERROR_MESSAGE = 'Not a valid message ID.\n' +
                            'Please check if the message\n' +
                            '1) contains an image\n2) is in this channel.\n\n' +
                            '**Usage:** @bot rotate <message ID>\n'

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

    /**
     * This method executes the rotate image command.
     * It fetches the image, and sends it back in the channel.
     * A reaction collector is set up to respond to ↪ ↩ reacts
     * which will rotate the image accordingly.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { messageReply, channel, userId } = commandArgs;
        const messageId = this.commandArgs[0];

        if (messageId === undefined) {
            messageReply(this.ERROR_MESSAGE);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Check if messageId quoted is in in the channel
        (channel as TextChannel).startTyping();
        (channel as TextChannel).messages.fetch(messageId)
            .then(async (message: Message): Promise<void> => {
                const { embeds, attachments } = message;

                // Attachments take precedence.
                let url = '';
                if (embeds.length !== 0) {
                    url = embeds[0].url!;
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
                (channel as TextChannel).stopTyping(true);

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
                    (channel as TextChannel).startTyping();
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
                    (channel as TextChannel).stopTyping(true);

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
                messageReply(this.ERROR_MESSAGE);
                (channel as TextChannel).stopTyping(true);
            });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
