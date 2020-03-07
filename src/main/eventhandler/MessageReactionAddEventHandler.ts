import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { StarboardResponse } from '../modules/starboard/StarboardResponse';
import { Storage } from '../storage/Storage';
import { StarboardAddReactChecker } from '../modules/starboard/StarboardChecker/StarboardAddReactChecker';

export class MessageReactionAddEventHandler extends EventHandler {
    public reaction: MessageReaction;

    public constructor(storage: Storage,
                       reaction: MessageReaction) {
        super(storage);
        this.reaction = reaction;
    }

    /**
     * Handles when a reaction is added to a message
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        const server = this.getServer(this.reaction.message.guild.id.toString());
        const { starboardSettings } = server;
        const starboardChecker = new StarboardAddReactChecker(starboardSettings, this.reaction);

        // Check if the react qualifies to make changes.
        const numberOfReactions = await starboardChecker.checkAddReact();
        if (numberOfReactions !== null) {
            const starboardResponse = new StarboardResponse(starboardSettings, this.reaction);

            const exists = starboardChecker.checkIfMessageExists();
            // If message exists in starboard channel
            if (exists) {
                // Fetch starboard id if message exists
                const starboardId = starboardChecker.fetchStarboardId();
                if (starboardId !== null) {
                    // Check if emoji in channel is the same as the emoji reacted.
                    const toEdit = await starboardChecker.checkEmojiInStarboardMessage(starboardId);
                    if (toEdit === true) {
                        starboardResponse.editStarboardMessageCount(numberOfReactions, starboardId);
                    }
                }
            } else { // If does not exist, add to Starboard.
                starboardResponse.addToStarboard(numberOfReactions);
            }
        }
    }
}
