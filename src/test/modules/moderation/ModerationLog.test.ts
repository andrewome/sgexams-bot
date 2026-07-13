/* eslint-disable no-unused-expressions, @typescript-eslint/no-empty-function */
import { should } from 'chai';
import { ModerationLog } from '../../../main/modules/moderation/ModerationLog';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';

should();

describe('ModerationLog test suite', (): void => {
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    const serverId = '69420';
    beforeEach((): void => {
        new Storage().loadServers().initNewServer(serverId);
    });

    afterEach((): void => {
        deleteDbFile();
    });

    describe('record / entries', (): void => {
        it('persists an entry with an incrementing caseId and emits MODLOG_UPDATE', (): void => {
            let emitted: unknown;
            const emit = (event: string, modLog: unknown): void => { emitted = { event, modLog }; };

            const first = ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 100, emit, 'reason1');
            const second = ModerationLog.record(serverId, 'mod1', 'user2', ModActions.KICK, 200, emit, 'reason2');

            first.caseId.should.equal(1);
            second.caseId.should.equal(2);
            (emitted as { event: string }).event.should.equal('modLogUpdate');
            (emitted as { modLog: { caseId: number } }).modLog.caseId.should.equal(2);
        });

        it('records null reason as null, not empty string', (): void => {
            const entry = ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 100, (): void => {}, '');
            (entry.reason === null).should.be.true;
        });

        it('entries() with no filter returns all entries newest-first', (): void => {
            ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 100, (): void => {});
            ModerationLog.record(serverId, 'mod1', 'user2', ModActions.KICK, 200, (): void => {});

            const entries = ModerationLog.entries(serverId);
            entries.length.should.equal(2);
            entries[0].type.should.equal(ModActions.KICK);
            entries[1].type.should.equal(ModActions.WARN);
        });

        it('entries() filters by userId and type', (): void => {
            ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 100, (): void => {});
            ModerationLog.record(serverId, 'mod1', 'user1', ModActions.KICK, 200, (): void => {});
            ModerationLog.record(serverId, 'mod1', 'user2', ModActions.WARN, 300, (): void => {});

            ModerationLog.entries(serverId, { userId: 'user1' }).length.should.equal(2);
            ModerationLog.entries(serverId, { type: ModActions.WARN }).length.should.equal(2);
            ModerationLog.entries(serverId, { userId: 'user1', type: ModActions.WARN }).length.should.equal(1);
        });
    });

    describe('warnCount / deleteWarnEntry', (): void => {
        it('warnCount counts only WARN entries for that user', (): void => {
            ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 100, (): void => {});
            ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 200, (): void => {});
            ModerationLog.record(serverId, 'mod1', 'user1', ModActions.KICK, 300, (): void => {});
            ModerationLog.record(serverId, 'mod1', 'user2', ModActions.WARN, 400, (): void => {});

            ModerationLog.warnCount(serverId, 'user1').should.equal(2);
        });

        it('deleteWarnEntry removes the entry and returns true; false if not found', (): void => {
            const entry = ModerationLog.record(serverId, 'mod1', 'user1', ModActions.WARN, 100, (): void => {});

            ModerationLog.deleteWarnEntry(serverId, entry.caseId).should.be.true;
            ModerationLog.entries(serverId).length.should.equal(0);
            ModerationLog.deleteWarnEntry(serverId, entry.caseId).should.be.false;
        });
    });

    describe('warn settings', (): void => {
        it('warnRuleFor returns null when no rule is set', (): void => {
            (ModerationLog.warnRuleFor(serverId, 5) === null).should.be.true;
        });

        it('setWarnRule / warnRuleFor / warnRules / clearWarnRules round-trip', (): void => {
            ModerationLog.setWarnRule(serverId, 5, ModActions.MUTE, 3600);
            ModerationLog.setWarnRule(serverId, 7, ModActions.BAN, null);

            ModerationLog.warnRuleFor(serverId, 5)!.type.should.equal(ModActions.MUTE);
            ModerationLog.warnRuleFor(serverId, 5)!.duration!.should.equal(3600);
            ModerationLog.warnRules(serverId).length.should.equal(2);

            ModerationLog.clearWarnRules(serverId);
            ModerationLog.warnRules(serverId).length.should.equal(0);
        });
    });

    describe('log channel', (): void => {
        it('logChannel returns null when unset, then the set value', (): void => {
            (ModerationLog.logChannel(serverId) === null).should.be.true;

            ModerationLog.setLogChannel(serverId, 'channel1');
            ModerationLog.logChannel(serverId)!.should.equal('channel1');
        });
    });
});
