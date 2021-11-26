/* eslint-disable prefer-destructuring, no-shadow */
import {
    Message, MessageReaction,
    User, ReactionCollectorOptions,
} from 'discord.js';
import sharp, { Sharp } from 'sharp';
import axios from 'axios';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class RotateImageCommand extends Command {
    public static readonly NAME = 'Rotate';

    public static readonly DESCRIPTION = 'Rotates an image by 90 degrees via reactions.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private commandArgs: string[];

    private ANTICLOCKWISE = '↪';

    private CLOCKWISE = '↩';

    private EMBED_TITLE = 'Rotate Command';

    private ERROR_MESSAGE = this.generateGenericEmbed(
        this.EMBED_TITLE,
        'Invalid message ID or image index provided\n' +
        'Please check if the message\n' +
        '> 1. contains an image\n> 2. is in this channel.\n' +
        'If you provided an index, please double check that it is valid\n\n' +
        '**Usage:** @bot rotate <message ID> [0 based index]\n',
        RotateImageCommand.EMBED_ERROR_COLOUR,
    );

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
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply, channel, userId } = commandArgs;
        const messageId = this.commandArgs[0];
        const idx = parseInt(this.commandArgs[1] ?? '0', 10);

        if (messageId === undefined) {
            await messageReply(this.ERROR_MESSAGE);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Check if messageId quoted is in in the channel
        try {
            channel!.sendTyping();
            const message = await channel!.messages.fetch(messageId);
            const { embeds, attachments } = message;

            // Check if index provided is legitimate
            let url = '';
            if (embeds.length <= idx && attachments.size <= idx)
                throw Error;

            // Attachments take precedence
            if (embeds.length > idx)
                url = embeds[idx].url!;

            if (attachments.size > idx)
                url = attachments.at(idx)!.url;

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
            const options: ReactionCollectorOptions = { filter, time: 10000, max: 1 };
            const collector = sentMessage.createReactionCollector(options);
            const COLLECT = 'collect';

            // onReaction function to handle the event. This is a recursive function to
            // create a new collector because the original message is deleted after each
            // reaction. That's why max is also set to 1. Because we do not want the
            // collector to remain hanging around in the stack for too long when
            // 1 is enough.
            const onReaction = async (reaction: MessageReaction): Promise<void> => {
                channel!.sendTyping();
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
                    = (sentMessage as Message).createReactionCollector(options);

                // Make it listen
                collector.on(COLLECT, onReaction);
                collector.on('end', async () => {
                    await sentMessage.reactions.removeAll();
                });
            };

            // Set up initial event handler.
            collector.on(COLLECT, onReaction);
            collector.on('end', async () => {
                await sentMessage.reactions.removeAll();
            });
        } catch (err) {
            await messageReply(this.ERROR_MESSAGE);
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
