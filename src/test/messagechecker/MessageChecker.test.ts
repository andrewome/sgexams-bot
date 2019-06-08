import { should } from 'chai';
import { MessageChecker }from "../../main/message/MessageChecker";
should();

const messageChecker = new MessageChecker();
describe("MessageChecker test suite", () => {

    /** Test isAlphaNumeric function */
    describe("isAlphaNumeric Tests", () => {
        it("It should return true for 0 to 9", () => {
            for(let i = "0".charCodeAt(0); i <= "9".charCodeAt(0); i++) {
                messageChecker.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for lowercase alphabets", () => {
            for(let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
                messageChecker.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for uppercase alphabets", () => {
            for(let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
                messageChecker.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return false for punctuations and spaces", () => {
            for(let i = 0; i <= 47; i++) {
                messageChecker.isAlphaNumeric(i).should.be.false;
            }
            for(let i = 58; i <= 64; i++) {
                messageChecker.isAlphaNumeric(i).should.be.false;
            }
            for(let i = 91; i <= 96; i++) {
                messageChecker.isAlphaNumeric(i).should.be.false;
            }
        });
    });
    /** Test checkForBannedWords function */
    describe("checkForBannedWords test", () => {
        const bannedWords = ["banned", "word"];
        it("Should detect banned word in the test string 1", () => {
            const str = "Yadiyadiyah banned! Yayayadiyadiyah";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
        });
        it("Should detect banned word in the test string 2", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 3 (normal)", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah banned";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 4 (concatenated)", () => {
            const str = "There's a bannedword here!";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 5 (upper and lowercase)", () => {
            const str = "There's a baNneD woRd here!";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 6 (upper and lowercase concatenated)", () => {
            const str = "There's a baNneDwoRd here!";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should not detect anything in the test string", () => {
            const str = "There's nothing illegal here!";
            const out = messageChecker.checkForBannedWords(str, bannedWords);
            out.length.should.be.equals(0);
        });
    });

    /** This function checks an array of tuples if the tuple exists within it */
    const findTuple = (out: [string, string][], toFind: [string, string]): boolean => {
        for(let tuple of out) {
            if(tuple[0] === toFind[0] && tuple[1] === toFind[1]) {
                return true;
            }
        }
        return false;
    }
    /** Test for getContextOfBannedWord function */
    describe("getContextOfBannedWord test", () => {
        const bannedWords = ["banned", "word"];
        const getOutput = (str: string, bannedWords: string[]): [string, string][] => {
            return messageChecker.getContextOfBannedWord(str, messageChecker.checkForBannedWords(str, bannedWords));
        };
        it("Single word", () => {
            const str = "banned"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "banned"]).should.be.true;
        });
        it("Concatenated", () => {
            const str = "bannedword"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "bannedword"]).should.be.true;
        });
        it("In a string 1", () => {
            const str = "youarebanned"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "youarebanned"]).should.be.true;
        });
        it("In a string 2", () => {
            const str = "you arebanned"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "arebanned"]).should.be.true;
        });
        it("In a string 3", () => {
            const str = "you.arebanned.lol"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "arebanned"]).should.be.true;
        });
        it("In a string 4", () => {
            const str = "you.arebanned......"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "arebanned"]).should.be.true;
        });
        it("Multiple instances 1", () => {
            const str = "you arebanned lol getbannedson"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "arebanned"]).should.be.true;
            findTuple(out, ["banned", "getbannedson"]).should.be.true;
        });
        it("Multiple instances 2", () => {
            const str = "you arebanned lol getbannedson myword! lolword"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "arebanned"]).should.be.true;
            findTuple(out, ["banned", "getbannedson"]).should.be.true;
            findTuple(out, ["word", "myword"]).should.be.true;
            findTuple(out, ["word", "lolword"]).should.be.true;
        });
        it("Mix of upper and lowercase", () => {
            const str = "you arEbanNed lol getBannedson myworD! lolword"
            let out = getOutput(str, bannedWords);
            findTuple(out, ["banned", "arEbanNed"]).should.be.true;
            findTuple(out, ["banned", "getBannedson"]).should.be.true;
            findTuple(out, ["word", "myworD"]).should.be.true;
            findTuple(out, ["word", "lolword"]).should.be.true;            
        })
    });
    /** Test for checkmessage function */
    describe("checkMessage test", async function() {
        //this.timeout(5000)
        const bannedWords = ["coon", "test", "banned", "word"];
        it("No instance of banned words", async () => {
            const str = "This is a string without anything illegal";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.bannedWordsUsed.length.should.be.equals(0);
        });
        it("Instance of banned words 1", async () => {
            const str = "This is a string with coon";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(1);
            findTuple(result.bannedWordsUsed, ["coon", "coon"]).should.be.true;
        });
        it("Instance of banned words 2", async () => {
            const str = "This is a string with coon and test";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(2);
            findTuple(result.bannedWordsUsed, ["coon", "coon"]).should.be.true;
            findTuple(result.bannedWordsUsed, ["test", "test"]).should.be.true;
        });
        it("Instance of mixed banned words 3", async () => {
            const str = "This is a string with coon and test and banned and word";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(4);
            findTuple(result.bannedWordsUsed, ["coon", "coon"]).should.be.true;
            findTuple(result.bannedWordsUsed, ["test", "test"]).should.be.true;
            findTuple(result.bannedWordsUsed, ["banned", "banned"]).should.be.true;
            findTuple(result.bannedWordsUsed, ["word", "word"]).should.be.true;
        });
        it("Instance of intentionally masked banned word 1", async () => {
            const str = "This is a string with xXcoonXx";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(1);
            findTuple(result.bannedWordsUsed, ["coon", "xXcoonXx"]).should.be.true;
        });
        it("Instance of false positive (actual string containing banned word) 1", async () => {
            const str = "This is a string with raccoon";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.bannedWordsUsed.length.should.be.equals(0);
        });
        it("Instance of close words 1", async () => {
            const str = "This is a string with ban";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(1);
        });
        it("Instance of close words 2", async () => {
            const str = "This is a string with coons";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(1);
        });
        it("Instance of close words 3", async () => {
            const str = "This is a string with testing";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.true;
            result.bannedWordsUsed.length.should.be.equals(1);
        });
    });
});