import { should } from 'chai';
import { ModUtils } from '../../../main/modules/moderation/ModUtil';

should();

describe('ModUtils test suite', (): void => {
    describe('formatDuration method test', (): void => {
        it('formats minutes only', (): void => {
            ModUtils.formatDuration(45 * ModUtils.MINUTES_IN_SECONDS).should.equal('45 minutes');
        });

        it('formats a single minute (singular)', (): void => {
            ModUtils.formatDuration(1 * ModUtils.MINUTES_IN_SECONDS).should.equal('1 minute');
        });

        it('formats hours and minutes', (): void => {
            ModUtils.formatDuration(90 * ModUtils.MINUTES_IN_SECONDS).should.equal('1 hour and 30 minutes');
        });

        it('formats days, hours and minutes', (): void => {
            const seconds = (3 * ModUtils.DAYS_IN_SECONDS)
                + (5 * ModUtils.HOURS_IN_SECONDS)
                + (10 * ModUtils.MINUTES_IN_SECONDS);
            ModUtils.formatDuration(seconds).should.equal('3 days, 5 hours and 10 minutes');
        });

        it('omits zero-valued larger units', (): void => {
            ModUtils.formatDuration(1 * ModUtils.DAYS_IN_SECONDS).should.equal('1 day');
        });

        it('omits zero minutes when days and hours are both present', (): void => {
            const seconds = (2 * ModUtils.DAYS_IN_SECONDS) + (3 * ModUtils.HOURS_IN_SECONDS);
            ModUtils.formatDuration(seconds).should.equal('2 days and 3 hours');
        });

        it('pluralises hours correctly', (): void => {
            ModUtils.formatDuration(2 * ModUtils.HOURS_IN_SECONDS).should.equal('2 hours');
        });

        it('rounds down partial minutes', (): void => {
            ModUtils.formatDuration((1 * ModUtils.MINUTES_IN_SECONDS) + 45).should.equal('1 minute');
        });
    });
});
