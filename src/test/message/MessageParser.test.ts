import { should } from 'chai';
import { MessageParser } from '../../main/messagechecker/parser/MessageParser';

should();

class MessageParser_Stub extends MessageParser {
    constructor() {
        super();
    }
}

const messageParser = new MessageParser_Stub();
describe('MessageParser test suite', () => {
    describe('isAlphabetical Tests', () => {
        it('It should return true for lowercase alphabets', () => {
            for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
                messageParser.isAlpha(i).should.be.true;
            }
        });
        it('It should return true for uppercase alphabets', () => {
            for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
                messageParser.isAlpha(i).should.be.true;
            }
        });
        it('It should return false for punctuations and spaces and digits', () => {
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
    describe('isNumeric Tests', () => {
        it('It should return true for 0 to 9', () => {
            for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++) {
                messageParser.isNumeric(i).should.be.true;
            }
        });
        it('Should return false for other chars', () => {
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

    describe('isEmote Test', () => {
        it('Is an emote 1', () => {
            const content = '<:normal_emote:999999>';
            const name = 'normal_emote';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.true;
        });
        it('Is an animated emote 1', () => {
            const content = '<a:animated_emote:999999>';
            const name = 'animated_emote';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.true;
        });
        it('Is not an emote 1', () => {
            const content = 'Just a normal string';
            const name = 'string';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
        it('Is not an emote 2', () => {
            const content = '<@34592835728323>';
            const name = '34592835728323';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
        it('Is not an emote 3', () => {
            const content = '<:normal_emote:94837363> hello!';
            const name = 'hello';
            const out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
    });
});
