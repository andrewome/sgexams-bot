import { should } from 'chai';
import { NaiveMessageParser } from "../../main/message/NaiveMessageParser";
import { Context } from "../../main/message/Context";
should();

const naiveMessageParser = new NaiveMessageParser();
describe("naiveMessageParser test suite", () => {
    /** Test isAlphaNumeric function */
    describe("isAlphaNumeric Tests", () => {
        it("It should return true for 0 to 9", () => {
            for(let i = "0".charCodeAt(0); i <= "9".charCodeAt(0); i++) {
                naiveMessageParser.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for lowercase alphabets", () => {
            for(let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
                naiveMessageParser.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for uppercase alphabets", () => {
            for(let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
                naiveMessageParser.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return false for punctuations and spaces", () => {
            for(let i = 0; i <= 47; i++) {
                naiveMessageParser.isAlphaNumeric(i).should.be.false;
            }
            for(let i = 58; i <= 64; i++) {
                naiveMessageParser.isAlphaNumeric(i).should.be.false;
            }
            for(let i = 91; i <= 96; i++) {
                naiveMessageParser.isAlphaNumeric(i).should.be.false;
            }
        });
    });
    /** Test checkForBannedWords function */
    describe("checkForBannedWords test", () => {
        const bannedWords = ["banned", "word"];
        it("Should detect banned word in the test string 1", () => {
            const str = "Yadiyadiyah banned! Yayayadiyadiyah";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
        });
        it("Should detect banned word in the test string 2", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 3 (normal)", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah banned";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 4 (concatenated)", () => {
            const str = "There's a bannedword here!";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.includes(bannedWords[0]).should.be.true;
            out.includes(bannedWords[1]).should.be.true;
        });
        it("Should not detect anything in the test string", () => {
            const str = "There's nothing illegal here!";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.length.should.be.equals(0);
        });
    });

    /** Test for getContextOfBannedWord function */
    describe("getContextOfBannedWord test", () => {
        const bannedWords = ["banned", "word"];
        const getOutput = (str: string, bannedWords: string[]): Context[] => {
            return naiveMessageParser
                .getContextOfBannedWord(
                    str,
                    str,
                    naiveMessageParser.checkForBannedWords(str, bannedWords));
        };
        const findContext = (contexts: Context[], context: Context): boolean => {
            for(let _context of contexts) {
                if(_context.equals(context))
                    return true;
            }
            return false;
        }
        it("Single word", () => {
            const str = "banned"
            const context = new Context("banned", "banned", "banned");
            let out = getOutput(str, bannedWords);
            findContext(out, context).should.be.true;
        });
        it("Concatenated 1", () => {
            const str = "bannedword"
            const context = new Context("banned", "bannedword", "bannedword");
            let out = getOutput(str, bannedWords);
            findContext(out, context).should.be.true;
        });
        it("Multiple 1", () => {
            const str = "bannedword bannedword"
            const context1 = new Context("banned", "bannedword", "bannedword");
            const context2 = new Context("word", "bannedword", "bannedword");
            let out = getOutput(str, bannedWords);
            out.length.should.be.equals(2);
            findContext(out, context1).should.be.true;
            findContext(out, context2).should.be.true;
        });
        it("In a string 1", () => {
            const str = "youarebanned"
            const context = new Context("banned", "youarebanned", "youarebanned");
            let out = getOutput(str, bannedWords);
            findContext(out, context).should.be.true;
        });
        it("In a string 2", () => {
            const str = "you arebanned"
            const context = new Context("banned", "arebanned", "arebanned");
            let out = getOutput(str, bannedWords);
            findContext(out, context).should.be.true;
        });
        it("In a string 3", () => {
            const str = "you.arebanned.lol"
            const context = new Context("banned", "arebanned", "arebanned");
            let out = getOutput(str, bannedWords);
            findContext(out, context).should.be.true;
        });
        it("In a string 4", () => {
            const str = "you.arebanned......"
            const context = new Context("banned", "arebanned", "arebanned");
            let out = getOutput(str, bannedWords);
            findContext(out, context).should.be.true;
        });
        it("Multiple instances 1", () => {
            const str = "you arebanned lol getbannedson";
            const context1 = new Context("banned", "arebanned", "arebanned");
            const context2 = new Context("banned", "getbannedson", "getbannedson");
            let out = getOutput(str, bannedWords);
            findContext(out, context1).should.be.true;
            findContext(out, context2).should.be.true;
        });
    });
});