/* eslint-disable @typescript-eslint/no-unused-vars */
import { should } from 'chai';
import { CharacterSubstitutor } from '../../../main/messagechecker/charactersubstitutor/CharacterSubstitutor';

should();

const characterSubstitutor = new CharacterSubstitutor();
describe('CharacterSubstitutor test suite', (): void => {
    describe('convertText test', (): void => {
        it('1 to 1 conversion 1', (): void => {
            const str = '@30!5$';
            const out = characterSubstitutor.convertText(str);
            out.includes('aeoiss').should.be.true;
            out.length.should.be.equals(1);
        });
        it('1 to 1 conversion 2', (): void => {
            const str = 'd@t 3gg 0ffer!ng5';
            const out = characterSubstitutor.convertText(str);
            out.includes('dat egg offerings').should.be.true;
            out.length.should.be.equals(1);
        });
        it('Many to 1 conversion 1', (): void => {
            const str = 'st|ck';
            const out = characterSubstitutor.convertText(str);
            out.includes('stick').should.be.true;
            out.includes('stlck').should.be.true;
            out.length.should.be.equals(2);
        });
        it('Many to 1 conversion 2', (): void => {
            const str = 'm4pp1ng';
            const out = characterSubstitutor.convertText(str);
            out.includes('mapping').should.be.true;
            out.includes('mupplng').should.be.true;
            out.includes('mupping').should.be.true;
            out.includes('mapplng').should.be.true;
            out.length.should.be.equals(4);
        });
        it('Many to 1 conversion 3', (): void => {
            const str = 'm4pp1ng|';
            const out = characterSubstitutor.convertText(str);
            out.includes('mappingl').should.be.true;
            out.includes('mupplngl').should.be.true;
            out.includes('muppingl').should.be.true;
            out.includes('mapplngl').should.be.true;
            out.includes('mappingi').should.be.true;
            out.includes('mupplngi').should.be.true;
            out.includes('muppingi').should.be.true;
            out.includes('mapplngi').should.be.true;
            out.length.should.be.equals(8);
        });
        it('Many to 1 conversion 4', (): void => {
            const str = 'm4pp1ng|7';
            const out = characterSubstitutor.convertText(str);
            out.includes('mappinglt').should.be.true;
            out.includes('mupplnglt').should.be.true;
            out.includes('muppinglt').should.be.true;
            out.includes('mapplnglt').should.be.true;
            out.includes('mappingit').should.be.true;
            out.includes('mupplngit').should.be.true;
            out.includes('muppingit').should.be.true;
            out.includes('mapplngit').should.be.true;
            out.includes('mappingll').should.be.true;
            out.includes('mupplngll').should.be.true;
            out.includes('muppingll').should.be.true;
            out.includes('mapplngll').should.be.true;
            out.includes('mappingil').should.be.true;
            out.includes('mupplngil').should.be.true;
            out.includes('muppingil').should.be.true;
            out.includes('mapplngil').should.be.true;
            out.length.should.be.equals(16);
        });
        it('Combined 1', (): void => {
            const str = 'm4pp!1ng|7';
            const out = characterSubstitutor.convertText(str);
            out.includes('mappiinglt').should.be.true;
            out.includes('muppilnglt').should.be.true;
            out.includes('muppiinglt').should.be.true;
            out.includes('mappilnglt').should.be.true;
            out.includes('mappiingit').should.be.true;
            out.includes('muppilngit').should.be.true;
            out.includes('muppiingit').should.be.true;
            out.includes('mappilngit').should.be.true;
            out.includes('mappiingll').should.be.true;
            out.includes('muppilngll').should.be.true;
            out.includes('muppiingll').should.be.true;
            out.includes('mappilngll').should.be.true;
            out.includes('mappiingil').should.be.true;
            out.includes('muppilngil').should.be.true;
            out.includes('muppiingil').should.be.true;
            out.includes('mappilngil').should.be.true;
            out.length.should.be.equals(16);
        });
    });
});
