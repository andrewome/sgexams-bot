import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { StarboardSettings } from '../storage/StarboardSettings';
import { StarboardChecker } from '../modules/starboard/StarboardChecker';
import { StarboardResponse } from '../modules/starboard/StarboardResponse';

export class MessageReactionRemoveEventHandler implements EventHandler {
    public starboardSettings: StarboardSettings;

    public reaction: MessageReaction;

    public constructor(starboardSettings: StarboardSettings,
                       reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    /**
     * Handles when a reaction is removed from a message
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        const starboardChecker
            = new StarboardChecker(this.starboardSettings, this.reaction);
        if (await starboardChecker.checkRemoveReact()) {
            const starboardResponse = new StarboardResponse(this.starboardSettings, this.reaction);
            const shouldDelete = await starboardChecker.shouldDeleteMessage();
            if (shouldDelete) {
                await starboardResponse
                    .deleteStarboardMessage(starboardChecker.messageIdInStarboardChannel!);
            } else {
                await starboardResponse.editStarboardMessageCount(
                    starboardChecker.numberOfReactions,
                    starboardChecker.messageIdInStarboardChannel!,
                );
            }
        }
    }
}
