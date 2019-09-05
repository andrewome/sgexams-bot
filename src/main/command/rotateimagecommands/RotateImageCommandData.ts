import { Channel } from 'discord.js';
import { CommandArgs } from '../classes/CommandArgs';

export class RotateImageCommandData implements CommandArgs {
    public channel: Channel;

    public userId: string;

    public constructor(channel: Channel, userId: string) {
        this.channel = channel;
        this.userId = userId;
    }
}
