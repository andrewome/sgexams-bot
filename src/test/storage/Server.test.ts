import { Server } from "../../main/storage/Server";
import { should } from 'chai';
should();

let server: Server;
beforeEach(() => {
    server = new Server(["test"], "111");
});

describe("Server test suite", () => {
    describe("Getter & Setters test", () => {
        it("getServerId test", () => {
            server.getServerId().should.equals("111");
        });
        it("getBannedWords test", () => {
            server.getBannedWords().toString().should.equals(["test"].toString());
        });
        it("set & getReportingId test", () => {
            (typeof server.getReportingChannelId()).should.equals("undefined");
            server.setReportingChannelId("123");
            server.getReportingChannelId()!.should.equals("123");
        });
    });
    describe("Add & Remove Words test", () => {
        it("Add duplicate word", () => {
            let length = server.getBannedWords().length;
            server.addbannedWord("test").should.equals(false);
            server.getBannedWords().length.should.equals(length);
        });
        it("Add word", () => {
            let length = server.getBannedWords().length;
            server.addbannedWord("testing").should.equals(true);
            server.getBannedWords().length.should.equals(length + 1);
        });
        it("Remove word", () => {
            let length = server.getBannedWords().length;
            server.removeBannedWord("test").should.equals(true);
            server.getBannedWords().length.should.equals(length - 1);
        });
        it("Remove non existant word", () => {
            let length = server.getBannedWords().length;
            server.removeBannedWord("thiswordain'there").should.equals(false);
            server.getBannedWords().length.should.equals(length);
        });
    });
    describe("Serialising and Deserialising tests", () => {
        it("Deserialising test 1", () => {
            let obj = Server.convertToJsonFriendly(server);
            obj["bannedWords"].toString().should.equals(["test"].toString());
            (obj["reportingChannelId"] === null).should.be.true;
            obj["serverId"].should.equals("111");
        });
        it("Deserialising test 2", () => {
            server.setReportingChannelId("123")
            let obj = Server.convertToJsonFriendly(server);
            obj["bannedWords"].toString().should.equals(["test"].toString());
            obj["reportingChannelId"]!.should.equals("123");
            obj["serverId"].should.equals("111");
        });
        it("Serialising test 1", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["reportingChannelId"] = null;
            obj["serverId"] = "111";
            
            //Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            let server_ = Server.convertFromJsonFriendly(obj);
            server_.getBannedWords().toString().should.equals(["test"].toString());
            server_.getServerId().should.equals("111");
            (typeof server_.getReportingChannelId()).should.equals("undefined");
        });
        it("Serialising test 2", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["reportingChannelId"] = "123";
            obj["serverId"] = "111";
            
            //Turn into json string and back
            const str = JSON.stringify(obj);
            obj = JSON.parse(str);

            let server_ = Server.convertFromJsonFriendly(obj);
            server_.getBannedWords().toString().should.equals(["test"].toString());
            server_.getServerId().should.equals("111");
            server_.getReportingChannelId()!.should.equals("123");
        });
        it("Serialising error test 1", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["reportingChannelId"] = "123";
            try {
                let server_ = Server.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
        it("Serialising error test 2", () => {
            let obj: any = {};
            obj["bannedWords"] = ["test"];
            obj["serverId"] = "111";
            try {
                let server_ = Server.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
        it("Serialising error test 3", () => {
            let obj: any = {};
            obj["serverId"] = "111";
            obj["reportingChannelId"] = "123";
            try {
                let server_ = Server.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
        it("Serialising error test 4", () => {
            let obj: any = {};

            try {
                let server_ = Server.convertFromJsonFriendly(obj);
            } catch (err) {
                err.message.should.equals("Object is not valid");
            }
        });
    });
})