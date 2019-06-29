import { should } from 'chai';
import { DatamuseApi } from '../../main/messagechecker/datamuseapi/DatamuseApi';

should();

const datamuse = new DatamuseApi();
describe('DatamuseApi test suite', function () {
    this.timeout(5000);
    describe('fetchSimilarSpellings test', () => {
        it('Valid word should be a straight match 1', async () => {
            const str = 'hello';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('hello');
        });
        it('Valid word should be a straight match 2', async () => {
            const str = 'redundant';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('redundant');
        });
        it('Return words should be lowercase regardless of input 1', async () => {
            const str = 'heLLo';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('hello');
        });
        it('Return words should be lowercase regardless of input 2', async () => {
            const str = 'reduNdAnT';
            const data = await datamuse.checkSpelling(str);
            data[0].word.should.be.equals('redundant');
        });
    });
});
