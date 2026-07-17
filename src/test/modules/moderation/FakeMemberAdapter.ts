import {
    DiscordMemberPort, MemberActionResult, BanOptions, DmOptions,
} from '../../../main/modules/moderation/DiscordMemberPort';

export interface RecordedCall {
    method: 'lookup' | 'ban' | 'unban' | 'kick' | 'timeout' | 'dm';
    userId: string;
    args: unknown[];
}

/**
 * Test double for DiscordMemberPort. lookup/ban/unban/kick/timeout return whatever
 * `nextResult` is currently set to (default: success); dm() has its own `nextDmResult`
 * (default: success) so a test can make the main action succeed while the DM fails, or
 * vice versa. Every call is recorded for assertions.
 */
export class FakeMemberAdapter implements DiscordMemberPort {
    public nextResult: MemberActionResult = { ok: true, tag: 'TestUser#0001' };

    public nextDmResult: MemberActionResult = { ok: true, tag: 'TestUser#0001' };

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

    public async dm(userId: string, options: DmOptions): Promise<MemberActionResult> {
        this.calls.push({ method: 'dm', userId, args: [options] });
        return this.nextDmResult;
    }
}
