import { Channel } from 'discord.js';

export class RotateImageCommandData {
    public channel: Channel;

    public userId: string;

    public constructor(channel: Channel, userId: string) {
        this.channel = channel;
        this.userId = userId;
    }
}
