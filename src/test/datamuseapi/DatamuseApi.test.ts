import { DatamuseApi } from "../../main/message/datamuseapi/DatamuseApi";
import { should } from 'chai';
should();

const datamuse = new DatamuseApi();
describe("DatamuseApi test suite", function() {
    this.timeout(5000);
    describe("fetchSimilarSpellings test", () => {
        it("Valid word should be a straight match 1", async () => {
            const str = "hello";
            let data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals("hello");
        });
        it("Valid word should be a straight match 2", async () => {
            const str = "redundant";
            let data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals("redundant");
        });
        it("Return words should be lowercase regardless of input 1", async () => {
            const str = "heLLo";
            let data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals("hello");
        });
        it("Return words should be lowercase regardless of input 2", async () => {
            const str = "reduNdAnT";
            let data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals("redundant");
        });
    });
});