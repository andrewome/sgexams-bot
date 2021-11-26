import { MessageReaction } from 'discord.js';
import { StarboardResponse } from '../modules/starboard/StarboardResponse';
import { StarboardAddReactChecker } from '../modules/starboard/StarboardChecker/StarboardAddReactChecker';
import { MessageReactionEventHandler } from './MessageReactionEventHandler';

export class MessageReactionAddEventHandler extends MessageReactionEventHandler {
    /**
     * Handles when a reaction is added to a message
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        try {
            this.reaction = await this.handlePartial();
            const server = this.getServer(this.reaction.message.guild!.id);
            const { starboardSettings } = server;
            const starboardChecker = new StarboardAddReactChecker(starboardSettings, this.reaction);

            // Check if the react qualifies to make changes.
            const numberOfReactions = await starboardChecker.checkAddReact();
            if (numberOfReactions !== null) {
                await MessageReactionAddEventHandler.queue.add(async () => {
                    const starboardResponse
                        = new StarboardResponse(starboardSettings, this.reaction as MessageReaction);
                    // Our dear race condition
                    const msgId = await starboardChecker.checkIfMessageExists();
                    // If message exists in starboard channel
                    if (msgId) {
                        // Check if emoji in channel is the same as the emoji reacted.
                        const toEdit = await starboardChecker.checkEmojiInStarboardMessage(msgId);
                        if (toEdit) {
                            await starboardResponse.editStarboardMessageCount(numberOfReactions, msgId);
                        }
                    } else if (starboardChecker.checkTimeDifference()) {
                        // If does not exist and within allowed time difference, add to Starboard.
                        await starboardResponse.addToStarboard(numberOfReactions);
                    }
                });
            }
        } catch (err) {
            this.handleError(err);
        }
    }
}
