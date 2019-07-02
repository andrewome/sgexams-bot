import {
 Client, TextChannel, Message, Emoji,
} from 'discord.js';
import { EventHandler } from './EventHandler';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RawEventHandler implements EventHandler {
    public packet: any;

    public bot: Client;

    public static EVENTS = ['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'];

    public static MESSAGE_REACTION_ADD_EVENT = 'messageReactionAdd';

    public static MESSAGE_REACTION_REMOVE_EVENT = 'messageReactionRemove';

    public static MESSAGE_REACTION_DELETED_EVENT = 'messageReactionDeleted';

    public constructor(bot: Client, packet: any) {
        this.bot = bot;
        this.packet = packet;
    }

    /**
     * Handles the raw event.
     * Looks out for reaction events that are not cached (for older messages)
     * and emits the event as required.
     * @returns void
     */
    public handleEvent(): void {
        const {
            EVENTS,
            MESSAGE_REACTION_ADD_EVENT,
            MESSAGE_REACTION_REMOVE_EVENT,
            MESSAGE_REACTION_DELETED_EVENT,
        } = RawEventHandler;

        // Checks if the packet contains what I want.
        if (!EVENTS.includes(this.packet.t)) return;
        const channel = this.bot.channels.get(this.packet.d.channel_id)!;
        if (channel === undefined) return;
        if (channel.type !== 'text') return;
        if ((channel as TextChannel).messages.has(this.packet.d.channel_id)) return;

        (channel as TextChannel).fetchMessage(this.packet.d.message_id)
            .then((message: Message): void => {
                const emoji = this.packet.d.emoji.id
                                ? `${this.packet.d.emoji.name}:${this.packet.d.emoji.id}`
                                : this.packet.d.emoji.name;
                const reaction = message.reactions.get(emoji);

                // It can be undefined if the emoji was removed from the message
                // Hence it is no longer there anymore.
                if (reaction !== undefined) {
                    reaction.users.set(
                        this.packet.d.user_id,
                        this.bot.users.get(this.packet.d.user_id)!,
                    );

                    if (this.packet.t === EVENTS[1]) {
                        this.bot.emit(
                            MESSAGE_REACTION_REMOVE_EVENT,
                            reaction,
                            this.bot.users.get(this.packet.d.user_id),
                        );
                    }
                } else if (this.packet.t === EVENTS[1]) {
                        const removedEmoji = new Emoji(message.guild, this.packet.d.emoji);
                        this.bot.emit(MESSAGE_REACTION_DELETED_EVENT, message, removedEmoji);
                    }

                if (this.packet.t === EVENTS[0]) {
                    this.bot.emit(
                        MESSAGE_REACTION_ADD_EVENT,
                        reaction,
                        this.bot.users.get(this.packet.d.user_id),
                    );
                }
            });
    }
}
