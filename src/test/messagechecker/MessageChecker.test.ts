import { should } from 'chai';
import { MessageChecker }from "../../messagechecker/MessageChecker";
should();

const messageChecker = new MessageChecker();

const isAlphaNumeric = messageChecker.isAlphaNumeric;
const checkForBannedWords = messageChecker.checkForBannedWords;
const getContextOfBannedWord = messageChecker.getContextOfBannedWord;
const checkMessage = messageChecker.checkMessage;

describe("MessageChecker test suite", () => {
    describe("isAlphaNumeric Tests", () => {
        it("It should return true for 0 to 9", () => {
            for(let i = "0".charCodeAt(0); i <= "9".charCodeAt(0); i++) {
                isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for lowercase alphabets", () => {
            for(let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
                isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for uppercase alphabets", () => {
            for(let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
                isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return false for punctuations and spaces", () => {
            for(let i = 0; i <= 47; i++) {
                isAlphaNumeric(i).should.be.false;
            }
            for(let i = 58; i <= 64; i++) {
                isAlphaNumeric(i).should.be.false;
            }
            for(let i = 91; i <= 96; i++) {
                isAlphaNumeric(i).should.be.false;
            }
        });
    });
    describe("checkForBannedWords test", () => {
        const bannedWords = ["banned", "word"];
        it("Should detect banned word in the test string 1", () => {
            const str = "Yadiyadiyah banned! Yayayadiyadiyah";
            const out = checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
        });
        it("Should detect banned word in the test string 2", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah";
            const out = checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 3 (normal)", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah banned";
            const out = checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 4 (concatenated)", () => {
            const str = "There's a bannedword here!";
            const out = checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 5 (upper and lowercase)", () => {
            const str = "There's a baNneD woRd here!";
            const out = checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 6 (upper and lowercase concatenated)", () => {
            const str = "There's a baNneDwoRd here!";
            const out = checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should not detect anything in the test string", () => {
            const str = "There's nothing illegal here!";
            const out = checkForBannedWords(str, bannedWords);
            out.length.should.be.equals(0);
        });
    });
    describe("getContextOfBannedWord test", () => {
        const bannedWords = ["banned", "word"];
        const getOutput = (str: string, bannedWords: string[]): string[] => {
            return messageChecker.getContextOfBannedWord(str, messageChecker.checkForBannedWords(str, bannedWords));
        };
        it("Single word", () => {
            const str = "banned"
            let out = getOutput(str, bannedWords);
            out.includes("banned").should.be.true;
        });
        it("Concatenated", () => {
            const str = "bannedword"
            let out = getOutput(str, bannedWords);
            out.includes("bannedword").should.be.true;
        });
        it("In a string 1", () => {
            const str = "youarebanned"
            let out = getOutput(str, bannedWords);
            out.includes("youarebanned").should.be.true;
        });
        it("In a string 2", () => {
            const str = "you arebanned"
            let out = getOutput(str, bannedWords);
            out.includes("arebanned").should.be.true;
        });
        it("In a string 3", () => {
            const str = "you.arebanned.lol"
            let out = getOutput(str, bannedWords);
            out.includes("arebanned").should.be.true;
        });
        it("In a string 4", () => {
            const str = "you.arebanned......"
            let out = getOutput(str, bannedWords);
            out.includes("arebanned").should.be.true;
        });
        it("Multiple instances 1", () => {
            const str = "you arebanned lol getbannedson"
            let out = getOutput(str, bannedWords);
            out.includes("arebanned").should.be.true;
            out.includes("getbannedson").should.be.true;
        });
        it("Multiple instances 2", () => {
            const str = "you arebanned lol getbannedson myword! lolword"
            let out = getOutput(str, bannedWords);
            out.includes("arebanned").should.be.true;
            out.includes("getbannedson").should.be.true;
            out.includes("myword").should.be.true;
            out.includes("lolword").should.be.true;
        });
        it("Mix of upper and lowercase", () => {
            const str = "you arEbanNed lol getBannedson myworD! lolword"
            let out = getOutput(str, bannedWords);
            out.includes("arEbanNed").should.be.true;
            out.includes("getBannedson").should.be.true;
            out.includes("myworD").should.be.true;
            out.includes("lolword").should.be.true;            
        })
    });
    describe("checkMessage test", async () => {
        const bannedWords = ["coon"];
        it("No instance of banned words", async () => {
            const str = "This is a string without any banned words";
            let result = await messageChecker.checkMessage(str, bannedWords);
            result.guilty.should.be.false;
            result.bannedWordsUsed.length.should.be.equals(0);
            result.content.should.be.equals(str);
        });
    });
});