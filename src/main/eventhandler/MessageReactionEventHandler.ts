import PQueue from 'p-queue';
import { MessageReaction } from 'discord.js';
import { EventHandler } from './EventHandler';
import { Storage } from '../storage/Storage';

/* This class is the base class for reaction events */
export abstract class MessageReactionEventHandler extends EventHandler {
    protected reaction: MessageReaction

    /* Queue to process reactions synchronously */
    protected static readonly queue = new PQueue({ concurrency: 1, autoStart: true });

    public constructor(storage: Storage, reaction: MessageReaction) {
        super(storage);
        this.reaction = reaction;
    }

    /**
     * Handles fetching of reaction if it's partial.
     *
     * @returns Promise<void>
     */
    public async handlePartial(): Promise<void> {
        if (this.reaction.partial) {
            await this.reaction.fetch();
        }
    }
}
