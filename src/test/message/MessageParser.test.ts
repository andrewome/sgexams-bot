import { should } from 'chai';
import { ComplexMessageParser } from '../../main/messagechecker/parser/ComplexMessageParser';
should();

const messageParser = new ComplexMessageParser();
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
    describe("isEmote Test", () => {
        it("Is an emote 1", () => {
            let content = "<:normal_emote:999999>";
            let name = "normal_emote";
            let out = messageParser.checkIsEmote(content, name);
            out.should.be.true;
        });
        it("Is an animated emote 1", () => {
            let content = "<a:animated_emote:999999>";
            let name = "animated_emote";
            let out = messageParser.checkIsEmote(content, name);
            out.should.be.true;            
        });
        it("Is not an emote 1", () => {
            let content = "Just a normal string";
            let name = "string";
            let out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
        it("Is not an emote 2", () => {
            let content = "<@34592835728323>";
            let name = "34592835728323";
            let out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
        it("Is not an emote 3", () => {
            let content = "<:normal_emote:94837363> hello!";
            let name = "hello";
            let out = messageParser.checkIsEmote(content, name);
            out.should.be.false;
        });
    })
});