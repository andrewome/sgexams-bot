import { should } from 'chai';
import { ComplexMessageParser } from "../../main/message/ComplexMessageParser";
import { Context } from "../../main/message/Context";
should();

const complexMessageParser = new ComplexMessageParser().processBannedWords(["banned", "word"]);
const findContext = (contexts: Context[], context: Context): boolean => {
    for(let _context of contexts) {
        if(_context.equals(context))
            return true;
    }
    return false;
}
describe("ComplexMessageParser test suite", () => {
    describe("getContextOfBannedWord test", () => {
        it("Concatenated 1", () => {
            const str = "bannedword"
            const context = new Context("banned", "bannedword", "bannedword");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Multiple 1", () => {
            const str = "bannedword bannedword"
            const context1 = new Context("banned", "bannedword", "bannedword");
            const context2 = new Context("word", "bannedword", "bannedword");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            out.length.should.be.equals(2);
            findContext(out, context1).should.be.true;
            findContext(out, context2).should.be.true;
        });
        it("In a string 1", () => {
            const str = "youarebanned"
            const context = new Context("banned", "youarebanned", "youarebanned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("In a string 2", () => {
            const str = "you arebanned"
            const context = new Context("banned", "arebanned", "arebanned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("In a string 3", () => {
            const str = "you.arebanned.lol"
            const context = new Context("banned", "arebanned", "arebanned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("In a string 4", () => {
            const str = "you.arebanned......"
            const context = new Context("banned", "arebanned", "arebanned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Multiple instances 1", () => {
            const str = "you arebanned lol getbannedson";
            const context1 = new Context("banned", "arebanned", "arebanned");
            const context2 = new Context("banned", "getbannedson", "getbannedson");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context1).should.be.true;
            findContext(out, context2).should.be.true;
        });
        it("Duplicate chars 1", () => {
            const str = "baanneeeeedddddd";
            let context = new Context("banned", str, str);
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Duplicate chars 2", () => {
            const str = "bbbbbaannneedddd";
            let context = new Context("banned", str, str);
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Duplicate chars in string 1", () => {
            const str = "you are baannneedddd HAHA";
            let context = new Context("banned", "baannneedddd", "baannneedddd");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Duplicate chars in string 2", () => {
            const str = "you are bbbbbaannneedddd HAHA";
            let context = new Context("banned", "bbbbbaannneedddd", "bbbbbaannneedddd");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars 1", () => {
            const str = "b a n n e d";
            let context = new Context("banned", str, "banned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars 2", () => {
            const str = "b(a&n^n$e#d";
            let context = new Context("banned", str, "banned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars in a string 1", () => {
            const str = "you are b a n n e d!!!! lol";
            let context = new Context("banned", "b a n n e d", "banned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars in a string 2", () => {
            const str = "get b(a&n^n$e#d s0n";
            let context = new Context("banned", "b(a&n^n$e#d", "banned");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Combination 1", () => {
            const str = "b a   n&n e e#d";
            let context = new Context("banned", str, "banneed");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it("Combination 2", () => {
            const str = "bb aaa ^^^  n&n e#ddd";
            let context = new Context("banned", str, "bbaaanneddd");
            let out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
    });
});
