import { Emoji } from 'discord.js';

export class StarboardSettings {
    private emoji: Emoji | null;

    private channel: string | null;

    private threshold: number | null;

    public constructor(channel: string | null, emoji: Emoji | null, threshold: number | null) {
        this.channel = channel;
        this.emoji = emoji;
        this.threshold = threshold;
    }

    /* Getter & Setters */
    public getEmoji(): Emoji | null {
        return this.emoji;
    }

    public setEmoji(value: Emoji | null): void {
        this.emoji = value;
    }

    public getChannel(): string | null {
        return this.channel;
    }

    public setChannel(channel: string | null): void {
        this.channel = channel;
    }

    public getThreshold(): number | null {
        return this.threshold;
    }

    public setThreshold(threshold: number | null): void {
        this.threshold = threshold;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public static convertFromJsonFriendly(obj: any): StarboardSettings {
        // Check attributes
        if (!(obj.hasOwnProperty('emoji')
            && obj.hasOwnProperty('channel')
            && obj.hasOwnProperty('threshold'))) {
            throw new Error('Object is not valid');
        }

        const { emoji, channel, threshold } = obj;
        return new StarboardSettings(channel, emoji, threshold);
    }
}
