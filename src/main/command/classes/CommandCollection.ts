import { ListBirthdaysCommand } from '../birthdaycommands/ListBirthdaysCommand';
import { SetBirthdayChannelCommand } from '../birthdaycommands/SetBirthdayChannelCommand';
import { SetBirthdayCommand } from '../birthdaycommands/SetBirthdayCommand';
import { BirthdayHelpCommand } from '../helpcommands/BirthdayHelpCommand';
import { HelpCommand } from '../helpcommands/HelpCommand';
import { MiscCommandHelpCommand } from '../helpcommands/MiscCommandHelpCommand';
import { ModerationHelpCommand } from '../helpcommands/ModerationHelpCommand';
import { MsgCheckerHelpCommand } from '../helpcommands/MsgCheckerHelpCommand';
import { StarboardHelpCommand } from '../helpcommands/StarboardHelpCommand';
import { MsgCheckerAddWordCommand } from '../messagecheckercommands/MsgCheckerAddWordCommand';
import { MsgCheckerGetReportChannelCommand } from '../messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { MsgCheckerGetResponseMessageCommand } from '../messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { MsgCheckerListWordsCommand } from '../messagecheckercommands/MsgCheckerListWordsCommand';
import { MsgCheckerRemoveWordCommand } from '../messagecheckercommands/MsgCheckerRemoveWordCommand';
import { MsgCheckerSetDeleteMessageCommand } from '../messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { MsgCheckerSetReportChannelCommand } from '../messagecheckercommands/MsgCheckerSetReportChannelCommand';
import { MsgCheckerSetResponseMessageCommand } from '../messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { OkBoomerCommand } from '../misccommands/OkBoomerCommand';
import { OkZoomerCommand } from '../misccommands/OkZoomerCommand';
import { RotateImageCommand } from '../misccommands/RotateImageCommand';
import { UptimeCheckCommand } from '../misccommands/UptimeCheckCommand';
import { BanCommand } from '../moderationcommands/BanCommand';
import { BanRmCommand } from '../moderationcommands/BanRmCommand';
import { GetModLogChannelCommand } from '../moderationcommands/GetModLogChannelCommand';
import { GetMuteRoleCommand } from '../moderationcommands/GetMuteRoleCommand';
import { GetWarnPunishmentsCommand } from '../moderationcommands/GetWarnPunishmentsCommand';
import { KickCommand } from '../moderationcommands/KickCommand';
import { ModLogsCommand } from '../moderationcommands/ModLogsCommand';
import { MuteCommand } from '../moderationcommands/MuteCommand';
import { PurgeCommand } from '../moderationcommands/PurgeCommand';
import { SetModLogChannelCommand } from '../moderationcommands/SetModLogChannelCommand';
import { SetMuteRoleCommand } from '../moderationcommands/SetMuteRoleCommand';
import { SetWarnPunishmentsCommand } from '../moderationcommands/SetWarnPunishmentsCommand';
import { UnbanCommand } from '../moderationcommands/UnbanCommand';
import { UnmuteCommand } from '../moderationcommands/UnmuteCommand';
import { UnwarnCommand } from '../moderationcommands/UnwarnCommand';
import { WarnCommand } from '../moderationcommands/WarnCommand';
import { StarboardAddEmojiCommand } from '../starboardcommands/StarboardAddEmojiCommand';
import { StarboardGetChannelCommand } from '../starboardcommands/StarboardGetChannelCommand';
import { StarboardGetEmojiCommand } from '../starboardcommands/StarboardGetEmojiCommand';
import { StarboardGetThresholdCommand } from '../starboardcommands/StarboardGetThresholdCommand';
import { StarboardRemoveEmojiCommand } from '../starboardcommands/StarboardRemoveEmojiCommand';
import { StarboardSetChannelCommand } from '../starboardcommands/StarboardSetChannelCommand';
import { StarboardSetThresholdCommand } from '../starboardcommands/StarboardSetThresholdCommand';
import { DeleteBirthdayCommand } from '../birthdaycommands/DeleteBirthdayCommand';

export abstract class CommandCollection {
    /** Message Checker Commands */
    public static readonly MSGCHECKER_COMMANDS = [
        MsgCheckerListWordsCommand,
        MsgCheckerAddWordCommand,
        MsgCheckerRemoveWordCommand,
        MsgCheckerSetReportChannelCommand,
        MsgCheckerGetReportChannelCommand,
        MsgCheckerSetResponseMessageCommand,
        MsgCheckerGetResponseMessageCommand,
        MsgCheckerSetDeleteMessageCommand,
    ];

    /** Starboard Commands */
    public static readonly STARBOARD_COMMANDS = [
        StarboardSetChannelCommand,
        StarboardGetChannelCommand,
        StarboardAddEmojiCommand,
        StarboardRemoveEmojiCommand,
        StarboardGetEmojiCommand,
        StarboardSetThresholdCommand,
        StarboardGetThresholdCommand,
    ];

    /** Misc Commands */
    public static readonly MISC_COMMANDS = [
        RotateImageCommand,
        UptimeCheckCommand,
        OkBoomerCommand,
        OkZoomerCommand,
    ];

    /** Help Commands */
    public static readonly HELP_COMMANDS = [
        HelpCommand,
        MsgCheckerHelpCommand,
        StarboardHelpCommand,
        MiscCommandHelpCommand,
        ModerationHelpCommand,
        BirthdayHelpCommand,
    ];

    /** Moderation Commands */
    public static readonly MODERATION_COMMANDS = [
        KickCommand,
        BanCommand,
        BanRmCommand,
        UnbanCommand,
        MuteCommand,
        UnmuteCommand,
        WarnCommand,
        UnwarnCommand,
        PurgeCommand,
        SetMuteRoleCommand,
        GetMuteRoleCommand,
        SetWarnPunishmentsCommand,
        GetWarnPunishmentsCommand,
        SetModLogChannelCommand,
        GetModLogChannelCommand,
        ModLogsCommand,
    ];

    /** Birthday commands */
    public static readonly BIRTHDAY_COMMANDS = [
        SetBirthdayCommand,
        SetBirthdayChannelCommand,
        ListBirthdaysCommand,
        DeleteBirthdayCommand,
    ];
}
