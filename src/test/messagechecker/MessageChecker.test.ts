/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { MessageChecker } from '../../main/modules/messagechecker/MessageChecker';

should();

const messageChecker = new MessageChecker();
describe('MessageChecker test suite', (): void => {
    /** Test for checkmessage function */
    describe('checkMessage test', async function (): Promise<void> {
        this.timeout(5000);
        const bannedWords = ['coon', 'test', 'banned', 'word'];
        it('No instance of banned words', async (): Promise<void> => {
            const str = 'This is a string without anything illegal';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it('Instance of banned words 1', async (): Promise<void> => {
            const str = 'This is a string with coon';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Instance of banned words 2', async (): Promise<void> => {
            const str = 'This is a string with coon and test';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(2);
        });
        it('Instance of mixed banned words 3', async (): Promise<void> => {
            const str = 'This is a string with coon and test and banned and word';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(4);
        });
        it('Instance of intentionally masked banned word 1', async (): Promise<void> => {
            const str = 'This is a string with xXcoonXx';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Instance of false positive (actual string containing banned word) 1', async (): Promise<void> => {
            const str = 'This is a string with raccoon';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it('Instance of close words 1', async (): Promise<void> => {
            const str = 'This is a string with words';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Instance of close words 2', async (): Promise<void> => {
            const str = 'This is a string with coons';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Instance of close words 3', async (): Promise<void> => {
            const str = 'This is a string with tests';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Match with an emote that is named similarly 1', async (): Promise<void> => {
            const str = '<:testing:5983237282386>';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it('Match with an emote that is named similarly 2', async (): Promise<void> => {
            const str = '<a:testing:5983237282386>';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it('Instance of leetspeech 1', async (): Promise<void> => {
            const str = 'c00n lmao';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Instance of leetspeech 2', async (): Promise<void> => {
            const str = 'c00nb4nn3d lmao';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(2);
        });
        it('Diacritic characters 1', async (): Promise<void> => {
            const str = 'you are bB̃b̃bÀÄ̌âÄ̌nneÉ̤Ê̩dddḌ́d HAHA';
            const result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it('Multiple queries 1', async (): Promise<void> => {
            let _bannedWords = bannedWords;
            _bannedWords = _bannedWords.concat(['the', 'lazy', 'dog', 'is', 'jumping', 'around', 'the', 'quick', 'fox']);
            const str = 'the1 lazy1 dog1 is1 jumping1 around1 the1 quick1 fox1 coon1 banned1 word1 test1';
            const result = await messageChecker.checkMessage(str, _bannedWords);
            result.guilty.should.be.true;
        });
        it('False positive 1', async (): Promise<void> => {
            const _bannedWords = ['negro'];
            const str = 'one group';
            const result = await messageChecker.checkMessage(str, _bannedWords);
            result.guilty.should.be.false;
        });
        it('False positive 2', async (): Promise<void> => {
            const _bannedWords = ['nig'];
            const str = 'can i get';
            const result = await messageChecker.checkMessage(str, _bannedWords);
            result.guilty.should.be.false;
        });
    });
});
