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

    public async handleEvent(): Promise<void> {
        const serverId = this.member.guild.id;
        const isMuted = ModDbUtils.isMemberMuted(serverId, this.member.id);
        if (isMuted) {
            const muteRoleId = ModDbUtils.getMuteRoleId(serverId);
            if (muteRoleId === null)
                return;
            this.member.roles.add(muteRoleId);
        }
    }
}
