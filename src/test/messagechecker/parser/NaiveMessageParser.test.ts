/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle, no-unused-expressions, no-restricted-syntax */
import { should } from 'chai';
import { NaiveMessageParser } from '../../../main/modules/messagechecker/parser/NaiveMessageParser';
import { Context } from '../../../main/modules/messagechecker/classes/Context';

should();

let naiveMessageParser: NaiveMessageParser;
beforeEach((): void => {
    naiveMessageParser = new NaiveMessageParser();
});

describe('NaiveMessageParser test suite', (): void => {
    /** Test checkForBannedWords function */
    describe('checkForBannedWords test', (): void => {
        const bannedWords = ['banned', 'word'];
        it('Should detect banned word in the test string 1', (): void => {
            const str = 'Yadiyadiyah banned! Yayayadiyadiyah';
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[0]).should.be.true;
        });
        it('Should detect banned word in the test string 2', (): void => {
            const str = 'Yadiyadiyah word Yayayadiyadiyah';
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[1]).should.be.true;
        });
        it('Should detect banned word in the test string 3 (normal)', (): void => {
            const str = 'Yadiyadiyah word Yayayadiyadiyah banned';
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[0]).should.be.true;
            out.bannedWordsFound.includes(bannedWords[1]).should.be.true;
        });
        it('Should detect banned word in the test string 4 (concatenated)', (): void => {
            const str = "There's a bannedword here!";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.includes(bannedWords[0]).should.be.true;
            out.bannedWordsFound.includes(bannedWords[1]).should.be.true;
        });
        it('Should not detect anything in the test string', (): void => {
            const str = "There's nothing illegal here!";
            const out = naiveMessageParser.checkForBannedWords(str, bannedWords);
            out.bannedWordsFound.length.should.be.equals(0);
        });
    });

    /** Test for getContextOfBannedWord function */
    describe('getContextOfBannedWord test', (): void => {
        const bannedWords = ['banned', 'word'];
        const findContext = (contexts: Context[], context: Context): boolean => {
            for (const _context of contexts) {
                if (_context.equals(context)) return true;
            }
            return false;
        };
        it('Single word', (): void => {
            const str = 'banned';
            const context = new Context('banned', 'banned', 'banned');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it('Concatenated 1', (): void => {
            const str = 'bannedword';
            const context = new Context('banned', 'bannedword', 'bannedword');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it('Multiple 1', (): void => {
            const str = 'bannedword bannedword';
            const context1 = new Context('banned', 'bannedword', 'bannedword');
            const context2 = new Context('word', 'bannedword', 'bannedword');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context1).should.be.true;
            findContext(bannedWordsFound, context2).should.be.true;
        });
        it('In a string 1', (): void => {
            const str = 'youarebanned';
            const context = new Context('banned', 'youarebanned', 'youarebanned');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it('In a string 2', (): void => {
            const str = 'you arebanned';
            const context = new Context('banned', 'arebanned', 'arebanned');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it('In a string 3', (): void => {
            const str = 'you.arebanned.lol';
            const context = new Context('banned', 'arebanned', 'arebanned');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it('In a string 4', (): void => {
            const str = 'you.arebanned......';
            const context = new Context('banned', 'arebanned', 'arebanned');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context).should.be.true;
        });
        it('Multiple instances 1', (): void => {
            const str = 'you arebanned lol getbannedson';
            const context1 = new Context('banned', 'arebanned', 'arebanned');
            const context2 = new Context('banned', 'getbannedson', 'getbannedson');
            const bannedWordsFound: Context[] = [];
            naiveMessageParser
                .checkForBannedWords(str, bannedWords)
                .getContextOfBannedWord(str, str, bannedWordsFound);
            findContext(bannedWordsFound, context1).should.be.true;
            findContext(bannedWordsFound, context2).should.be.true;
        });
    });
});
