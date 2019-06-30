/* eslint-disable @typescript-eslint/no-unused-vars, no-restricted-syntax */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { ComplexMessageParser } from '../../../main/modules/messagechecker/parser/ComplexMessageParser';
import { Context } from '../../../main/modules/messagechecker/classes/Context';

should();

const complexMessageParser = new ComplexMessageParser().processBannedWords(['banned', 'word']);
const findContext = (contexts: Context[], context: Context): boolean => {
    for (const _context of contexts) {
        const { convertedContext } = _context;
        if (_context.equals(context) && convertedContext === context.convertedContext) return true;
    }
    return false;
};
describe('ComplexMessageParser test suite', (): void => {
    describe('getContextOfBannedWord test', (): void => {
        it('Concatenated 1', (): void => {
            const str = 'bannedword';
            const context = new Context('banned', 'bannedword', 'bannedword');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Multiple 1', (): void => {
            const str = 'bannedword bannedword';
            const context1 = new Context('banned', 'bannedword', 'bannedword');
            const context2 = new Context('word', 'bannedword', 'bannedword');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            out.length.should.be.equals(2);
            findContext(out, context1).should.be.true;
            findContext(out, context2).should.be.true;
        });
        it('In a string 1', (): void => {
            const str = 'youarebanned';
            const context = new Context('banned', 'youarebanned', 'youarebanned');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('In a string 2', (): void => {
            const str = 'you arebanned';
            const context = new Context('banned', 'arebanned', 'arebanned');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('In a string 3', (): void => {
            const str = 'you.arebanned.lol';
            const context = new Context('banned', 'arebanned', 'arebanned');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('In a string 4', (): void => {
            const str = 'you.arebanned......';
            const context = new Context('banned', 'arebanned', 'arebanned');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Multiple instances 1', (): void => {
            const str = 'you arebanned lol getbannedson';
            const context1 = new Context('banned', 'arebanned', 'arebanned');
            const context2 = new Context('banned', 'getbannedson', 'getbannedson');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context1).should.be.true;
            findContext(out, context2).should.be.true;
        });
        it('Duplicate chars 1', (): void => {
            const str = 'baanneeeeedddddd';
            const context = new Context('banned', str, str);
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Duplicate chars 2', (): void => {
            const str = 'bbbbbaannneedddd';
            const context = new Context('banned', str, str);
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Duplicate chars in string 1', (): void => {
            const str = 'you are baannneedddd HAHA';
            const context = new Context('banned', 'baannneedddd', 'baannneedddd');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Duplicate chars in string 2', (): void => {
            const str = 'you are bbbbbaannneedddd HAHA';
            const context = new Context('banned', 'bbbbbaannneedddd', 'bbbbbaannneedddd');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Non-alphanumeric chars 1', (): void => {
            const str = 'b a n n e d';
            const context = new Context('banned', str, str);
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Non-alphanumeric chars 2', (): void => {
            const str = 'b(a&n^n$e#d';
            const context = new Context('banned', str, str);
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Non-alphanumeric chars in a string 1', (): void => {
            const str = 'you are b a n n e d!!!! lol';
            const context = new Context('banned', 'b a n n e d', 'b a n n e d');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Non-alphanumeric chars in a string 2', (): void => {
            const str = 'get b(a&n^n$e#d s0n';
            const context = new Context('banned', 'b(a&n^n$e#d', 'b(a&n^n$e#d');
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Combination 1', (): void => {
            const str = 'b a   n&n e e#d';
            const context = new Context('banned', str, str);
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
        it('Combination 2', (): void => {
            const str = 'bb aaa ^^^  n&n e#ddd';
            const context = new Context('banned', str, str);
            const out: Context[] = [];
            complexMessageParser.getContextOfBannedWord(str, str, out);
            findContext(out, context).should.be.true;
        });
    });
});
