/* eslint-disable @typescript-eslint/no-unused-vars, no-useless-constructor */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { MessageParser } from '../../../main/modules/messagechecker/parser/MessageParser';

should();

class MessageParserStub extends MessageParser {
    public constructor() {
        super();
    }
}

const messageParser = new MessageParserStub();
describe('MessageParser test suite', (): void => {
    describe('isAlphabetical Tests', (): void => {
        it('It should return true for lowercase alphabets', (): void => {
            for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
                messageParser.isAlpha(i).should.be.true;
            }
        });
        it('It should return true for uppercase alphabets', (): void => {
            for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
                messageParser.isAlpha(i).should.be.true;
            }
        });
        it('It should return false for punctuations and spaces and digits', (): void => {
            for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) {
                messageParser.isAlpha(i).should.be.false;
            }
            for (let i = 0; i <= 47; i++) {
                messageParser.isAlpha(i).should.be.false;
            }
            for (let i = 58; i <= 64; i++) {
                messageParser.isAlpha(i).should.be.false;
            }
            for (let i = 91; i <= 96; i++) {
                messageParser.isAlpha(i).should.be.false;
            }
        });
    });
    describe('isNumeric Tests', (): void => {
        it('It should return true for 0 to 9', (): void => {
            for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) {
                messageParser.isNumeric(i).should.be.true;
            }
        });
        it('Should return false for other chars', (): void => {
            for (let i = 0; i <= 47; i++) {
                messageParser.isNumeric(i).should.be.false;
            }
            for (let i = 58; i <= 64; i++) {
                messageParser.isNumeric(i).should.be.false;
            }
            for (let i = 91; i <= 96; i++) {
                messageParser.isNumeric(i).should.be.false;
            }
            for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
                messageParser.isNumeric(i).should.be.false;
            }
            for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
                messageParser.isNumeric(i).should.be.false;
            }
        });
    });

    describe('isEmote Test', (): void => {
        it('Is an emote 1', (): void => {
            const content = '<:normal_emote:999999>';
            const name = 'normal_emote';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.true;
        });
        it('Is an animated emote 1', (): void => {
            const content = '<a:animated_emote:999999>';
            const name = 'animated_emote';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.true;
        });
        it('Is not an emote 1', (): void => {
            const content = 'Just a normal string';
            const name = 'string';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
        it('Is not an emote 2', (): void => {
            const content = '<@34592835728323>';
            const name = '34592835728323';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
        it('Is not an emote 3', (): void => {
            const content = '<:normal_emote:94837363> hello!';
            const name = 'hello';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
    });
});
