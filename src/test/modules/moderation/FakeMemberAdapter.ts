import {
    DiscordMemberPort, MemberActionResult, BanOptions,
} from '../../../main/modules/moderation/DiscordMemberPort';

export interface RecordedCall {
    method: 'lookup' | 'ban' | 'unban' | 'kick' | 'timeout';
    userId: string;
    args: unknown[];
}

/**
 * Test double for DiscordMemberPort. Every method returns whatever `nextResult` is currently
 * set to (default: a successful lookup) and records the call for assertions.
 */
export class FakeMemberAdapter implements DiscordMemberPort {
    public nextResult: MemberActionResult = { ok: true, tag: 'TestUser#0001' };

    public calls: RecordedCall[] = [];

    public async lookup(userId: string): Promise<MemberActionResult> {
        this.calls.push({ method: 'lookup', userId, args: [] });
        return this.nextResult;
    }

    public async ban(userId: string, options: BanOptions): Promise<MemberActionResult> {
        this.calls.push({ method: 'ban', userId, args: [options] });
        return this.nextResult;
    }

    public async unban(userId: string): Promise<MemberActionResult> {
        this.calls.push({ method: 'unban', userId, args: [] });
        return this.nextResult;
    }

    public async kick(userId: string, reason?: string): Promise<MemberActionResult> {
        this.calls.push({ method: 'kick', userId, args: [reason] });
        return this.nextResult;
    }

    public async timeout(userId: string, durationMs: number | null, reason?: string): Promise<MemberActionResult> {
        this.calls.push({ method: 'timeout', userId, args: [durationMs, reason] });
        return this.nextResult;
    }
}
