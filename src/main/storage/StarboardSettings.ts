import { DatabaseConnection } from '../DatabaseConnection';

export interface SimplifiedEmojiObj {
    id: string;
    name: string;
}

export interface StarboardSettingsObj {
    channel: string;
    threshold: number;
    emojis: SimplifiedEmojiObj[];
}


export class SimplifiedEmoji {
    public name: string;

    public id: string;

    public constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    /**
     * This method compares if one simplified emoji is the same
     * as another simplified emoji object.
     *
     * @param  {SimplifiedEmoji} other
     * @returns boolean
     */
    public equals(other: SimplifiedEmoji): boolean {
        const { name, id } = other;
        return !!((name === this.name && id === this.id));
    }
}

export class StarboardSettings {
    private emojis: SimplifiedEmoji[];

    private channel: string | null;

    private threshold: number | null;

    public constructor(channel: string | null,
                       emojis: SimplifiedEmoji[] | null,
                       threshold: number | null) {
        this.channel = channel;
        this.threshold = threshold;

        if (emojis === null) {
            this.emojis = new Array<SimplifiedEmoji>();
        } else {
            this.emojis = emojis;
        }
    }

    /**
     * Returns index of an emoji in the emojis array matching index
     * Returns -1 if emoji is not found.
     *
     * @param  {string} id
     * @returns number
     */
    private getEmojiIdxById(id: string): number {
        for (let i = 0; i < this.emojis.length; i++) {
            if (id === this.emojis[i].id) return i;
        }
        return -1;
    }

    /**
     * Returns emoji by idx. Returns null if id not found.
     *
     * @param  {string} id
     * @returns SimplifiedEmoji
     */
    public getEmojiById(id: string): SimplifiedEmoji | null {
        const idx = this.getEmojiIdxById(id);
        if (idx === -1) return null;
        return this.emojis[idx];
    }

    /**
     * Compares if there contains an emoji in the emojis array
     *
     * @param  {SimplifiedEmoji} emoji
     * @returns boolean
     */
    public hasEmoji(emoji: SimplifiedEmoji): boolean {
        const idx = this.getEmojiIdx(emoji);
        if (idx === -1) return false;
        return true;
    }

    /**
     * Compares if there contains an emoji by id in the emojis array
     *
     * @param  {string} id
     * @returns boolean
     */
    public hasEmojiById(id: string): boolean {
        const idx = this.getEmojiIdxById(id);
        if (idx === -1) return false;
        return true;
    }

    /**
     * Returns index of an emoji in the emojis array.
     * Returns -1 if emoji is not found.
     *
     * @param  {SimplifiedEmoji} emoji
     * @returns number
     */
    private getEmojiIdx(emoji: SimplifiedEmoji): number {
        for (let i = 0; i < this.emojis.length; i++) {
            if (emoji.equals(this.emojis[i])) return i;
        }
        return -1;
    }

    /**
     * This function adds an emoji to the emojis array
     *
     * @param  {SimplifiedEmoji} emoji emoji to be added
     * @returns boolean indicating if the add was a success
     */
    public addEmoji(serverId: string, emoji: SimplifiedEmoji): boolean {
        if (this.hasEmoji(emoji)) return false;
        this.emojis.push(emoji);
        this.insertEmojiToDb(serverId, emoji);
        return true;
    }

    private insertEmojiToDb(serverId: string, emoji: SimplifiedEmoji): void {
        const db = DatabaseConnection.connect();
        const insert = db.prepare(
            'INSERT INTO starboardEmojis (serverId, id, name) VALUES (?, ?, ?)',
        );
        insert.run(serverId, emoji.id, emoji.name);
        db.close();
    }

    /**
     * This function removes an emoji to the emojis array
     *
     * @param  {SimplifiedEmoji} emoji emoji to be removed
     * @returns boolean indicating if the removal was a success
     */
    public removeEmoji(emoji: SimplifiedEmoji): boolean {
        if (!this.hasEmoji(emoji)) return false;

        // Get index, then splice.
        const idx = this.getEmojiIdx(emoji);
        this.emojis.splice(idx, 1);
        return true;
    }

    /**
     * This function removes an emoji to the emojis array by its id
     *
     * @param  {SimplifiedEmoji} emoji emoji to be removed
     * @returns boolean indicating if the removal was a success
     */
    public removeEmojiById(serverId: string, emojiId: string): boolean {
        if (!this.hasEmojiById(emojiId)) return false;

        // Get index, then splice.
        const idx = this.getEmojiIdxById(emojiId);
        this.emojis.splice(idx, 1);
        this.deleteEmojiFromDb(serverId, emojiId);
        return true;
    }

    private deleteEmojiFromDb(serverId: string, emojiId: string): void {
        const db = DatabaseConnection.connect();
        const del = db.prepare(
            'DELETE FROM starboardEmojis WHERE serverId = (?) AND id = (?)',
        );
        del.run(serverId, emojiId);
        db.close();
    }

    /* Getter & Setters */
    public getEmoji(): SimplifiedEmoji[] {
        return this.emojis;
    }

    public getChannel(): string | null {
        return this.channel;
    }

    public setChannel(serverId: string, channel: string | null): void {
        this.channel = channel;
        this.updateChannelInDb(serverId, channel);
    }

    private updateChannelInDb(serverId: string, channel: string | null): void {
        const db = DatabaseConnection.connect();
        const update = db.prepare(
            'UPDATE starboardSettings SET channel = (?) WHERE serverId = (?)',
        );
        update.run(channel, serverId);
        db.close();
    }

    public getThreshold(): number | null {
        return this.threshold;
    }

    public setThreshold(serverId: string, threshold: number | null): void {
        this.threshold = threshold;
        this.updateThresholdInDb(serverId, threshold);
    }

    private updateThresholdInDb(serverId: string, threshold: number | null): void {
        const db = DatabaseConnection.connect();
        const update = db.prepare(
            'UPDATE starboardSettings SET threshold = (?) WHERE serverId = (?)',
        );
        update.run(threshold, serverId);
        db.close();
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public static convertFromJsonFriendly(obj: any): StarboardSettings {
        // Check attributes
        if (!(obj.hasOwnProperty('emojis')
            && obj.hasOwnProperty('channel')
            && obj.hasOwnProperty('threshold'))) {
            throw new Error('Object is not valid');
        }

        const { emojis, channel, threshold } = obj;
        return new StarboardSettings(channel, emojis, threshold);
    }
}
