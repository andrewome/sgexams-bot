import { DatamuseApi } from "../../datamuseapi/DatamuseApi";
import { should } from 'chai';
should();

const datamuse = new DatamuseApi();
const fetchSimilarSpellings = datamuse.fetchSimilarSpellings;
describe("DatamuseApi test suite", function() {
    describe("fetchSimilarSpellings test", function() {
        it("Valid word should be a straight match 1", function() {
            const str = "hello";
            fetchSimilarSpellings(str)
                .then(res => {
                    res.data[0].word.should.be.equals("hello");
                });
        });
        it("Valid word should be a straight match 2", function() {
            const str = "redundant";
            fetchSimilarSpellings(str)
                .then(res => {
                    res.data[0].word.should.be.equals("redundant");
                });
        });
        it("Return words should be lowercase regardless of input 1", function() {
            const str = "heLLo";
            fetchSimilarSpellings(str)
                .then(res => {
                    res.data[0].word.should.be.equals("hello");
                });
        });
        it("Return words should be lowercase regardless of input 2", function() {
            const str = "reduNdAnT";
            fetchSimilarSpellings(str)
                .then(res => {
                    res.data[0].word.should.be.equals("redundant");
                });
        });
    });
})