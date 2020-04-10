/* eslint-disable no-empty, no-unused-expressions */
import * as fs from 'fs';
import { should } from 'chai';
import { Storage } from '../../main/storage/Storage';
import { DatabaseConnection } from '../../main/DatabaseConnection';
import { deleteDbFile, TEST_STORAGE_PATH } from '../TestsHelper';

should();

describe('Storage test suite', (): void => {
    // Before start of test, delete db file (if exists)
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Delete the db file after each
    afterEach((): void => {
        deleteDbFile();
    });

    describe('loadServers test', (): void => {
        it('Create an empty file if one does not exist', (): void => {
            const storage = new Storage().loadServers();
            fs.existsSync(TEST_STORAGE_PATH).should.be.true;
            storage.servers.size.should.equals(0);
        });
    });

    describe('initEmptyServer test', (): void => {
        it('Should generate an empty server.', (): void => {
            const serverId = '69420';
            let storage = new Storage().loadServers();
            storage.initNewServer(serverId);
            const server = storage.servers.get(serverId)!;

            // Reload storage - values inserted into empty server should equals serialised value.
            storage = new Storage().loadServers();
            storage.servers.get(serverId)?.equals(server).should.be.true;
        });
    });
});
