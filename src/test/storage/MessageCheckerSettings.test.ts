/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle, no-unused-expressions, no-empty, max-len */
import * as fs from 'fs';
import { should } from 'chai';
import { Storage } from '../../main/storage/Storage';
import { MessageCheckerSettings } from '../../main/storage/MessageCheckerSettings';
import { DatabaseConnection } from '../../main/DatabaseConnection';
import {
    deleteDbFile, isEmptyArray, compareArrays, TEST_STORAGE_PATH, compareWithReserialisedStorage,
} from '../TestsHelper';

should();

describe('messageCheckerSettings test suite', (): void => {
    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    let messageCheckerSettings: MessageCheckerSettings;
    let storage: Storage;
    const serverId = '69420';
    beforeEach((): void => {
        storage = new Storage().loadServers();
        storage.initNewServer(serverId);
        messageCheckerSettings = storage.servers.get(serverId)!.messageCheckerSettings;
    });

    afterEach((): void => {
        deleteDbFile();
    });

    describe('Getter & Setters test', (): void => {
        it('getBannedWords test', (): void => {
            messageCheckerSettings.addBannedWords(serverId, ['test']);
            messageCheckerSettings.getBannedWords().toString()
                .should.equals(['test'].toString());
        });
        it('set & getReportingId test', (): void => {
            (messageCheckerSettings.getReportingChannelId() === null).should.be.true;
            messageCheckerSettings.setReportingChannelId(serverId, '123');
            messageCheckerSettings.getReportingChannelId()!.should.equals('123');
        });
        it('set & responseMessage test', (): void => {
            (messageCheckerSettings.getResponseMessage() === null).should.be.true;
            messageCheckerSettings.setResponseMessage(serverId, '123');
            messageCheckerSettings.getResponseMessage()!.should.equals('123');
        });
    });
    describe('Add & Remove Words test', (): void => {
        it('Add duplicate word', (): void => {
            const input = ['test'];
            messageCheckerSettings.addBannedWords(serverId, input);
            const { length } = messageCheckerSettings.getBannedWords();

            // Add words
            const { wordsAdded, wordsNotAdded }
                = messageCheckerSettings.addBannedWords(serverId, input);
            isEmptyArray(wordsAdded).should.be.true;
            compareArrays(wordsNotAdded, input).should.be.true;
            messageCheckerSettings.getBannedWords().length.should.equals(length);
            compareWithReserialisedStorage(storage).should.be.true;
        });
        it('Add word', (): void => {
            const input = ['test'];
            const { length } = messageCheckerSettings.getBannedWords();

            // Add words
            const { wordsAdded, wordsNotAdded }
                = messageCheckerSettings.addBannedWords(serverId, input);
            compareArrays(wordsAdded, input).should.be.true;
            isEmptyArray(wordsNotAdded).should.be.true;
            messageCheckerSettings.getBannedWords().length.should.equals(length + 1);
            compareWithReserialisedStorage(storage).should.be.true;
        });
        it('Remove word', (): void => {
            const input = ['test'];
            messageCheckerSettings.addBannedWords(serverId, input);
            const { length } = messageCheckerSettings.getBannedWords();

            // Remove words
            const { wordsRemoved, wordsNotRemoved }
                = messageCheckerSettings.removeBannedWords(serverId, input);
            compareArrays(wordsRemoved, input).should.be.true;
            isEmptyArray(wordsNotRemoved).should.be.true;
            messageCheckerSettings.getBannedWords().length.should.equals(length - 1);
            compareWithReserialisedStorage(storage).should.be.true;
        });
        it('Remove non existant word', (): void => {
            const input = ['test'];
            const { length } = messageCheckerSettings.getBannedWords();

            // Remove words
            const { wordsRemoved, wordsNotRemoved }
                = messageCheckerSettings.removeBannedWords(serverId, input);
            isEmptyArray(wordsRemoved).should.be.true;
            compareArrays(wordsNotRemoved, input).should.be.true;
            messageCheckerSettings.getBannedWords().length.should.equals(length);
            compareWithReserialisedStorage(storage).should.be.true;
        });
    });
    describe('Serialising tests', (): void => {
        it('Serialising test 1', (): void => {
            let obj: any = {};
            obj.bannedWords = ['test'];
            obj.reportingChannelId = null;
            obj.responseMessage = 'response msg';

            // Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            messageCheckerSettings_.getBannedWords().toString().should.equals(['test'].toString());
            messageCheckerSettings_.getResponseMessage()!.should.equals('response msg');
            (messageCheckerSettings_.getReportingChannelId() === null).should.be.true;
        });
        it('Serialising test 2', (): void => {
            let obj: any = {};
            obj.bannedWords = ['test'];
            obj.reportingChannelId = '123';
            obj.responseMessage = null;

            // Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            messageCheckerSettings_.getBannedWords().toString().should.equals(['test'].toString());
            (messageCheckerSettings_.getResponseMessage() === null).should.true;
            messageCheckerSettings_.getReportingChannelId()!.should.equals('123');
        });
        it('Serialising error test 1', (): void => {
            const obj: any = {};
            obj.bannedWords = ['test'];
            obj.reportingChannelId = '123';
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
        it('Serialising error test 2', (): void => {
            const obj: any = {};
            obj.bannedWords = ['test'];
            obj.responseMessage = '111';
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
        it('Serialising error test 3', (): void => {
            const obj: any = {};
            obj.responseMessage = '111';
            obj.reportingChannelId = '123';
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
        it('Serialising error test 4', (): void => {
            const obj: any = {};
            try {
                const messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals('Object is not valid');
            }
        });
    });
});
