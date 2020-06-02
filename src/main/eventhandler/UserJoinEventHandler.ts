import { GuildMember } from 'discord.js';
import { EventHandler } from './EventHandler';
import { Storage } from '../storage/Storage';
import { ModDbUtils } from '../modules/moderation/ModDbUtils';

export class UserJoinEventHandler extends EventHandler {
    private member: GuildMember;

    public constructor(storage: Storage, member: GuildMember) {
        super(storage);
        this.member = member;
    }

    /**
     * This function handles the user join event. Checks if user is currently muted on the server.
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        try {
            const serverId = this.member.guild.id;
            const isMuted = ModDbUtils.isMemberMuted(serverId, this.member.id);
            if (isMuted) {
                const muteRoleId = ModDbUtils.getMuteRoleId(serverId);
                if (muteRoleId === null)
                    return;
                this.member.roles.add(muteRoleId);
            }
        } catch (err) {
            this.handleError(err);
        }
    }
}
