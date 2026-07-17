/* eslint-disable no-unused-expressions */
import { should } from 'chai';
import { EmbedBuilder } from 'discord.js';
import { ModUtils } from '../../../main/modules/moderation/ModUtil';

should();

describe('ModUtils test suite', (): void => {
    describe('buildActionNoticeEmbed method test', (): void => {
        it('kicked (no duration param) has no Duration field', (): void => {
            const embed = ModUtils.buildActionNoticeEmbed('kicked', 'Test Server', 'being loud', 'mod1');
            const { data } = embed;
            data.title!.should.equal('You were kicked in Test Server');
            data.fields!.some((f) => f.name === 'Duration').should.be.false;
            data.fields!.find((f) => f.name === 'Reason')!.value.should.equal('being loud');
            data.fields!.find((f) => f.name === 'Moderator')!.value.should.equal('<@mod1>');
        });

        it('muted with a duration shows the formatted duration', (): void => {
            const embed = ModUtils.buildActionNoticeEmbed('muted', 'Test Server', 'spam', 'mod1', 3600);
            embed.data.fields!.find((f) => f.name === 'Duration')!.value.should.equal('1 hour');
        });

        it('banned with duration undefined/null shows Permanent', (): void => {
            const embed = ModUtils.buildActionNoticeEmbed('banned', 'Test Server', 'spam', 'mod1', null);
            embed.data.fields!.find((f) => f.name === 'Duration')!.value.should.equal('Permanent');
        });

        it('empty reason shows a dash', (): void => {
            const embed = ModUtils.buildActionNoticeEmbed('kicked', 'Test Server', '', 'mod1');
            embed.data.fields!.find((f) => f.name === 'Reason')!.value.should.equal('-');
        });

        it('returns an EmbedBuilder instance', (): void => {
            ModUtils.buildActionNoticeEmbed('kicked', 'Test Server', 'reason', 'mod1')
                .should.be.instanceOf(EmbedBuilder);
        });
    });

    describe('addDmFailureNotice method test', (): void => {
        it('adds a Notified field when notified is false', (): void => {
            const embed = new EmbedBuilder();
            ModUtils.addDmFailureNotice(embed, false);
            embed.data.fields!.find((f) => f.name === 'Notified')!.value.should.equal(
                'Could not DM this user - they may have DMs disabled or have blocked the bot.',
            );
        });

        it('adds no field when notified is true', (): void => {
            const embed = new EmbedBuilder();
            ModUtils.addDmFailureNotice(embed, true);
            (embed.data.fields === undefined).should.be.true;
        });
    });

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
