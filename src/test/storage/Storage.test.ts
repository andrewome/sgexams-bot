import * as fs from 'fs';
import { should } from 'chai';
import { Storage } from '../../main/storage/Storage';
import { Server } from '../../main/storage/Server';
import { MessageCheckerSettings } from '../../main/storage/MessageCheckerSettings';

should();

const STORAGE_PATH = './TESTING.json';
class Storage_Test extends Storage {
    public constructor() {
        super();
        super.setStoragePath(STORAGE_PATH);
    }
}

// Before start of test, delete json file (if exists)
before(() => {
    try {
        fs.unlinkSync(STORAGE_PATH);
    } catch (err) {}
});

// Initialise server1 and server2 before each
let server1: Server; let
    server2: Server;
beforeEach(() => {
    server1 = new Server('111', new MessageCheckerSettings());
    server2 = new Server('112', new MessageCheckerSettings());
});

// Delete the json file after each
afterEach(() => {
    try {
        fs.unlinkSync(STORAGE_PATH);
    } catch (err) {}
});

describe('Storage test suite', () => {
    describe('Load & Save methods test', () => {
        it('Create an empty file if one does not exist', () => {
            const storage = new Storage_Test().loadServers();
            fs.existsSync(STORAGE_PATH).should.be.true;
            storage.servers.size.should.equals(0);
        });
        it('Should save and load from file successfully', () => {
            const storage1 = new Storage_Test().loadServers();
            storage1.servers.set(server1.serverId, server1);
            storage1.servers.set(server2.serverId, server2);
            storage1.saveServers();

            // Load from json file
            const storage2 = new Storage_Test().loadServers();
            storage2.servers.size.should.equals(2);
            storage2.servers.has(server1.serverId).should.be.true;
            storage2.servers.has(server2.serverId).should.be.true;

            // Server objects should equal through the saving and loading
            server1.equals(storage2.servers.get(server1.serverId)!).should.be.true;
            server2.equals(storage2.servers.get(server2.serverId)!).should.be.true;
        });
    });
});
