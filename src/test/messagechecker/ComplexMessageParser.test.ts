import { should } from 'chai';
import { ComplexMessageParser } from "../../main/message/ComplexMessageParser";
import { Context } from "../../main/message/Context";
should();

const complexMessageParser = new ComplexMessageParser().processBannedWords(["banned"]);
const findContext = (contexts: Context[], context: Context): boolean => {
    for(let _context of contexts) {
        if(_context.equals(context))
            return true;
    }
    return false;
}
describe("ComplexMessageParser test suite", () => {
    describe("getContextOfBannedWord test", () => {
        it("Duplicate chars 1", () => {
            const str = "baanneeeeedddddd";
            let context = new Context("banned", str, str);
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Duplicate chars 2", () => {
            const str = "bbbbbaannneedddd";
            let context = new Context("banned", str, str);
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Duplicate chars in string 1", () => {
            const str = "you are baannneedddd HAHA";
            let context = new Context("banned", "baannneedddd", "baannneedddd");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Duplicate chars in string 2", () => {
            const str = "you are bbbbbaannneedddd HAHA";
            let context = new Context("banned", "bbbbbaannneedddd", "bbbbbaannneedddd");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars 1", () => {
            const str = "b a n n e d";
            let context = new Context("banned", str, "banned");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars 2", () => {
            const str = "b(a&n^n$e#d";
            let context = new Context("banned", str, "banned");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars in a string 1", () => {
            const str = "you are b a n n e d!!!! lol";
            let context = new Context("banned", "b a n n e d", "banned");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Non-alphanumeric chars in a string 2", () => {
            const str = "get b(a&n^n$e#d s0n";
            let context = new Context("banned", "b(a&n^n$e#d", "banned");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Combination 1", () => {
            const str = "b a   n&n e e#d";
            let context = new Context("banned", str, "banneed");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
        it("Combination 2", () => {
            const str = "bb aaa ^^^  n&n e#ddd";
            let context = new Context("banned", str, "bbaaanneddd");
            let out = complexMessageParser.getContextOfBannedWord(str, str);
            findContext(out, context).should.be.true;
        });
    });
});
