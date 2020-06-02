import { StarboardResponse } from '../modules/starboard/StarboardResponse';
import { StarboardRemoveReactChecker } from '../modules/starboard/StarboardChecker/StarboardRemoveReactChecker';
import { MessageReactionEventHandler } from './MessageReactionEventHandler';

export class MessageReactionRemoveEventHandler extends MessageReactionEventHandler {
    /**
     * Handles when a reaction is removed from a message
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        // Will error if trying to fetch on a partial removed reaction
        try {
            await this.handlePartial();
        } catch (err) {
            return;
        }

        const server = this.getServer(this.reaction.message.guild!.id);
        const { starboardSettings } = server;
        const starboardChecker = new StarboardRemoveReactChecker(starboardSettings, this.reaction);

        // Check if the reaction removal qualifies for a change
        const pair = await starboardChecker.checkRemoveReact();

        // If it does, edit the starboard message, but don't delete to prevent abuse
        if (pair !== null) {
            const starboardResponse = new StarboardResponse(starboardSettings, this.reaction);

            // Check if emoji in channel is the same as the emoji reacted.
            const toEdit = await starboardChecker.checkEmojiInStarboardMessage(pair[1]);
            if (toEdit === true) {
                await starboardResponse.editStarboardMessageCount(pair[0], pair[1]);
            }
        }
    }
}
