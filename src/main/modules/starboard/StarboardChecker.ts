import { MessageReaction } from 'discord.js';
import { StarboardSettings } from '../../storage/StarboardSettings';

export class StarboardChecker {
    private starboardSettings: StarboardSettings;

    private reaction: MessageReaction;

    public constructor(starboardSettings: StarboardSettings,
                       reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    public checkReacts(): boolean {
        const emoji = this.starboardSettings.getEmoji();
        const threshold = this.starboardSettings.getThreshold();
        const channel = this.starboardSettings.getChannel();

        if (emoji === null || threshold === null || channel === null) {
            return false;
        }

        if (this.reaction.emoji.id.toString() !== emoji.id.toString()) {
            return false;
        }

        if (this.reaction.count < threshold) {
            return false;
        }

        return true;
    }
}
