import { should } from 'chai';
import { ModerationTimeouts } from '../../../main/modules/moderation/ModerationTimeouts';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';

should();

describe('ModerationTimeouts test suite', (): void => {
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

    it('schedule then allOpen returns the row', (): void => {
        ModerationTimeouts.schedule(100, 200, 'user1', ModActions.BAN, serverId, 42);

        const open = ModerationTimeouts.allOpen();
        open.length.should.equal(1);
        open[0].userId.should.equal('user1');
        open[0].type.should.equal(ModActions.BAN);
        open[0].timerId.should.equal(42);
    });

    it('schedule upserts on conflict of (serverId, userId, type), keeping one row', (): void => {
        ModerationTimeouts.schedule(100, 200, 'user1', ModActions.BAN, serverId, 1);
        ModerationTimeouts.schedule(100, 300, 'user1', ModActions.BAN, serverId, 2);

        const open = ModerationTimeouts.allOpen();
        open.length.should.equal(1);
        open[0].timerId.should.equal(2);
    });

    it('cancel removes the row and returns its timerId', (): void => {
        ModerationTimeouts.schedule(100, 200, 'user1', ModActions.MUTE, serverId, 7);

        ModerationTimeouts.cancel('user1', ModActions.MUTE, serverId).should.equal(7);
        ModerationTimeouts.allOpen().length.should.equal(0);
    });

    it('cancel returns 0 when there is nothing to cancel', (): void => {
        ModerationTimeouts.cancel('user1', ModActions.MUTE, serverId).should.equal(0);
    });
});
