
import { should } from 'chai';
import { NaiveMessageParser } from "../../main/messagechecker/parser/NaiveMessageParser";
import { Context } from "../../main/messagechecker/classes/Context"
should();

let naiveMessageParser: NaiveMessageParser;
beforeEach(() => {
    naiveMessageParser = new NaiveMessageParser();
});

describe("NaiveMessageParser test suite", () => {
    /** Test checkForBannedWords function */
    describe("checkForBannedWords test", () => {
        const bannedWords = ["banned", "word"];
        it("Should detect banned word in the test string 1", () => {
            const str = "Yadiyadiyah banned! Yayayadiyadiyah";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[0]).should.be.true;
        });
        it("Should detect banned word in the test string 2", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 3 (normal)", () => {
            const str = "Yadiyadiyah word Yayayadiyadiyah banned";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[0]).should.be.true;
            out.bannedWordsFound.includes(bannedWords[1]).should.be.true;
        });
        it("Should detect banned word in the test string 4 (concatenated)", () => {
            const str = "There's a bannedword here!";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[0]).should.be.true;
            out.bannedWordsFound.includes(bannedWords[1]).should.be.true;
        });
        it("Should not detect anything in the test string", () => {
            const str = "There's nothing illegal here!";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.length.should.be.equals(0);
        });
    });

    /** Test for getContextOfBannedWord function */
    describe("getContextOfBannedWord test", () => {
        const bannedWords = ["banned", "word"];
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
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it("Concatenated 1", () => {
            const str = "bannedword"
            const context = new Context("banned", "bannedword", "bannedword");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it("Multiple 1", () => {
            const str = "bannedword bannedword"
            const context1 = new Context("banned", "bannedword", "bannedword");
            const context2 = new Context("word", "bannedword", "bannedword");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context1).should.be.true;
            findContext(bannedWordsFound, context2).should.be.true;
        });
        it("In a string 1", () => {
            const str = "youarebanned"
            const context = new Context("banned", "youarebanned", "youarebanned");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it("In a string 2", () => {
            const str = "you arebanned"
            const context = new Context("banned", "arebanned", "arebanned");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it("In a string 3", () => {
            const str = "you.arebanned.lol"
            const context = new Context("banned", "arebanned", "arebanned");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it("In a string 4", () => {
            const str = "you.arebanned......"
            const context = new Context("banned", "arebanned", "arebanned");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it("Multiple instances 1", () => {
            const str = "you arebanned lol getbannedson";
            const context1 = new Context("banned", "arebanned", "arebanned");
            const context2 = new Context("banned", "getbannedson", "getbannedson");
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context1).should.be.true;
            findContext(bannedWordsFound, context2).should.be.true;
        });
    });
});