import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { StarboardSettings } from '../storage/StarboardSettings';
import { StarboardChecker } from '../modules/starboard/StarboardChecker';
import { StarboardResponse } from '../modules/starboard/StarboardResponse';

export class MessageReactionAddEventHandler implements EventHandler {
    public starboardSettings: StarboardSettings;

    public reaction: MessageReaction;

    public constructor(starboardSettings: StarboardSettings,
                       reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    /**
     * Handles when a reaction is added to a message
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        const starboardChecker
            = new StarboardChecker(this.starboardSettings, this.reaction);
        if (await starboardChecker.checkAddReact()) {
            const starboardResponse = new StarboardResponse(this.starboardSettings, this.reaction);
            const exists = await starboardChecker.checkIfMessageExists();
            if (exists) {
                await starboardResponse.editStarboardMessageCount(
                    starboardChecker.numberOfReactions,
                    starboardChecker.messageIdInStarboardChannel!,
                );
            } else {
                await starboardResponse.addToStarboard(starboardChecker.numberOfReactions);
            }
        }
    }
}
