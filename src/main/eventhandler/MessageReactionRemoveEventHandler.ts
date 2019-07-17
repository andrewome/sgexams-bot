import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { StarboardResponse } from '../modules/starboard/StarboardResponse';
import { Storage } from '../storage/Storage';
import { StarboardRemoveReactChecker } from '../modules/starboard/StarboardChecker/StarboardRemoveReactChecker';

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
        const starboardChecker = new StarboardRemoveReactChecker(starboardSettings, this.reaction);

        // Check if the reaction removal qualifies for a change
        const pair = await starboardChecker.checkRemoveReact();

        // If it does, edit the starboard message, but don't delete to prevent abuse
        if (pair !== null) {
            const starboardResponse = new StarboardResponse(starboardSettings, this.reaction);
            starboardResponse.editStarboardMessageCount(pair[0], pair[1]);
        }
    }
}
