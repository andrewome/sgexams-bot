/* eslint-disable no-empty, no-unused-expressions */
import * as fs from 'fs';
import { should } from 'chai';
import { Storage } from '../../main/storage/Storage';
import { Server } from '../../main/storage/Server';
import { MessageCheckerSettings } from '../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../main/storage/StarboardSettings';

should();

const STORAGE_PATH = './TESTING.json';
class StorageTest extends Storage {
    public constructor() {
        super();
        super.setStoragePath(STORAGE_PATH);
    }
}

// Before start of test, delete json file (if exists)
before((): void => {
    try {
        fs.unlinkSync(STORAGE_PATH);
    } catch (err) {}
});

// Initialise server1 and server2 before each
let server1: Server;
let server2: Server;
beforeEach((): void => {
    server1 = new Server(
        '111',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
    server2 = new Server(
        '112',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

// Delete the json file after each
afterEach((): void => {
    try {
        fs.unlinkSync(STORAGE_PATH);
    } catch (err) {}
});

describe('Storage test suite', (): void => {
    describe('Load & Save methods test', (): void => {
        it('Create an empty file if one does not exist', (): void => {
            const storage = new StorageTest().loadServers();
            fs.existsSync(STORAGE_PATH).should.be.true;
            storage.servers.size.should.equals(0);
        });
        it('Should save and load from file successfully', (): void => {
            const storage1 = new StorageTest().loadServers();
            storage1.servers.set(server1.serverId, server1);
            storage1.servers.set(server2.serverId, server2);
            storage1.saveServers();

            // Load from json file
            const storage2 = new StorageTest().loadServers();
            storage2.servers.size.should.equals(2);
            storage2.servers.has(server1.serverId).should.be.true;
            storage2.servers.has(server2.serverId).should.be.true;

            // Server objects should equal through the saving and loading
            server1.equals(storage2.servers.get(server1.serverId)!).should.be.true;
            server2.equals(storage2.servers.get(server2.serverId)!).should.be.true;
        });
    });
});
