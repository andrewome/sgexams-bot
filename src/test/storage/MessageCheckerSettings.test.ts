import { should } from 'chai';
import { MessageCheckerSettings } from "../../main/storage/MessageCheckerSettings";
should();

let messageCheckerSettings: MessageCheckerSettings;
beforeEach(() => {
    messageCheckerSettings = new MessageCheckerSettings();
});

describe("messageCheckerSettings test suite", () => {
    describe("Getter & Setters test", () => {
        it("getBannedWords test", () => {
            messageCheckerSettings.addbannedWord("test");
            messageCheckerSettings.getBannedWords().toString().should.equals(["test"].toString());
        });
        it("set & getReportingId test", () => {
            (typeof messageCheckerSettings.getReportingChannelId()).should.equals("undefined");
            messageCheckerSettings.setReportingChannelId("123");
            messageCheckerSettings.getReportingChannelId()!.should.equals("123");
        });
        it("set & responseMessage test", () => {
            (typeof messageCheckerSettings.getResponseMessage()).should.equals("undefined");
            messageCheckerSettings.setResponseMessage("123");
            messageCheckerSettings.getResponseMessage()!.should.equals("123");
        });
    });
    describe("Add & Remove Words test", () => {
        it("Add duplicate word", () => {
            messageCheckerSettings.addbannedWord("test");
            let length = messageCheckerSettings.getBannedWords().length;
            messageCheckerSettings.addbannedWord("test").should.equals(false);
            messageCheckerSettings.getBannedWords().length.should.equals(length);
        });
        it("Add word", () => {
            let length = messageCheckerSettings.getBannedWords().length;
            messageCheckerSettings.addbannedWord("testing").should.equals(true);
            messageCheckerSettings.getBannedWords().length.should.equals(length + 1);
        });
        it("Remove word", () => {
            messageCheckerSettings.addbannedWord("test");
            let length = messageCheckerSettings.getBannedWords().length;
            messageCheckerSettings.removeBannedWord("test").should.equals(true);
            messageCheckerSettings.getBannedWords().length.should.equals(length - 1);
        });
        it("Remove non existant word", () => {
            let length = messageCheckerSettings.getBannedWords().length;
            messageCheckerSettings.removeBannedWord("hmmmmmmm").should.equals(false);
            messageCheckerSettings.getBannedWords().length.should.equals(length);
        });
    });
    describe("Serialising and Deserialising tests", () => {
        it("Deserialising test 1", () => {
            messageCheckerSettings.addbannedWord("test");
            let obj = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
            obj["bannedWords"].toString().should.equals(["test"].toString());
            (obj["reportingChannelId"] === null).should.be.true;
            (obj["responseMessage"] === null).should.be.true;
        });
        it("Deserialising test 2", () => {
            messageCheckerSettings.setReportingChannelId("123")
            let obj = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
            obj["bannedWords"].toString().should.equals([].toString());
            obj["reportingChannelId"]!.should.equals("123");
            (obj["responseMessage"] === null).should.be.true;
        });
        it("Deserialising test 3", () => {
            messageCheckerSettings.setResponseMessage("response msg")
            let obj = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
            obj["bannedWords"].toString().should.equals([].toString());
            (obj["reportingChannelId"] === null).should.be.true;
            obj["responseMessage"]!.should.equals("response msg");
        });
        it("Serialising test 1", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["reportingChannelId"] = null;
            obj["responseMessage"] = "response msg";
            
            //Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            let messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            messageCheckerSettings_.getBannedWords().toString().should.equals(["test"].toString());
            messageCheckerSettings_.getResponseMessage()!.should.equals("response msg");
            (typeof messageCheckerSettings_.getReportingChannelId()).should.equals("undefined");
        });
        it("Serialising test 2", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["reportingChannelId"] = "123";
            obj["responseMessage"] = null;
            
            //Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            let messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            messageCheckerSettings_.getBannedWords().toString().should.equals(["test"].toString());
            (typeof messageCheckerSettings_.getResponseMessage()).should.equals("undefined");
            messageCheckerSettings_.getReportingChannelId()!.should.equals("123");
        });
        it("Serialising error test 1", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["reportingChannelId"] = "123";
            try {
                let messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
        it("Serialising error test 2", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["responseMessage"] = "111";
            try {
                let messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
        it("Serialising error test 3", () => {
            let obj: any = {};
            obj["responseMessage"] = "111";
            obj["reportingChannelId"] = "123";
            try {
                let messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
        it("Serialising error test 4", () => {
            let obj: any = {};
            try {
                let messageCheckerSettings_ = MessageCheckerSettings.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
    });
})