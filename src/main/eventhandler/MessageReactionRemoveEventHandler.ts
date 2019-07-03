import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { StarboardChecker } from '../modules/starboard/StarboardChecker';
import { StarboardResponse } from '../modules/starboard/StarboardResponse';
import { Storage } from '../storage/Storage';

export class MessageReactionRemoveEventHandler extends EventHandler {
    public static EVENT_NAME = 'messageReactionRemove';

    public reaction: MessageReaction;

    public constructor(storage: Storage,
                       reaction: MessageReaction) {
        super(storage);
        this.reaction = reaction;
    }

    /**
     * Handles when a reaction is removed from a message
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        const server = this.getServer(this.reaction.message.guild.id.toString());
        const { starboardSettings } = server;
        const starboardChecker = new StarboardChecker(starboardSettings, this.reaction);
        const shouldMakeChanges = await starboardChecker.checkRemoveReact();
        if (shouldMakeChanges) {
            const starboardResponse = new StarboardResponse(starboardSettings, this.reaction);
            starboardResponse.editStarboardMessageCount(
                starboardChecker.numberOfReactions,
                starboardChecker.messageIdInStarboardChannel!,
            );
        }
    }
}
