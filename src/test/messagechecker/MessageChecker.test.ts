import { should } from 'chai';
import { MessageChecker }from "../../main/message/MessageChecker";
should();

const messageChecker = new MessageChecker();
describe("MessageChecker test suite", () => {
    /** Test for checkmessage function */
    describe("checkMessage test", async function() {
        this.timeout(10000);
        const bannedWords = ["coon", "test", "banned", "word"];
        it("No instance of banned words", async () => {
            const str = "This is a string without anything illegal";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it("Instance of banned words 1", async () => {
            const str = "This is a string with coon";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it("Instance of banned words 2", async () => {
            const str = "This is a string with coon and test";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(2);
        });
        it("Instance of mixed banned words 3", async () => {
            const str = "This is a string with coon and test and banned and word";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(4);
        });
        it("Instance of intentionally masked banned word 1", async () => {
            const str = "This is a string with xXcoonXx";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it("Instance of false positive (actual string containing banned word) 1", async () => {
            const str = "This is a string with raccoon";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it("Instance of close words 1", async () => {
            const str = "This is a string with words";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it("Instance of close words 2", async () => {
            const str = "This is a string with coons";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it("Instance of close words 3", async () => {
            const str = "This is a string with tests";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it("Match with an emote that is named similarly 1", async () => {
            const str = "<:testing:5983237282386>";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.contexts.length.should.be.equals(0);
        });
        it("Instance of leetspeech 1", async () => {
            const str = "c00n lmao";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(1);
        });
        it("Instance of leetspeech 2", async () => {
            const str = "c00nb4nn3d lmao";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.contexts.length.should.be.equals(2);
        });
    });
});