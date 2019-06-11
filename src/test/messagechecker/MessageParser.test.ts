import { should } from 'chai';
import { MessageParser } from '../../main/message/MessageParser';
should();

const messageParser = new MessageParser();
describe("MessageParser test suite", () => {
    /** Test isAlphaNumeric function */
    describe("isAlphaNumeric Tests", () => {
        it("It should return true for 0 to 9", () => {
            for(let i = "0".charCodeAt(0); i <= "9".charCodeAt(0); i++) {
                messageParser.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for lowercase alphabets", () => {
            for(let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
                messageParser.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return true for uppercase alphabets", () => {
            for(let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
                messageParser.isAlphaNumeric(i).should.be.true;
            }
        });
        it("It should return false for punctuations and spaces", () => {
            for(let i = 0; i <= 47; i++) {
                messageParser.isAlphaNumeric(i).should.be.false;
            }
            for(let i = 58; i <= 64; i++) {
                messageParser.isAlphaNumeric(i).should.be.false;
            }
            for(let i = 91; i <= 96; i++) {
                messageParser.isAlphaNumeric(i).should.be.false;
            }
        });
    });
});