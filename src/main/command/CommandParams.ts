import { ListCommandsCommand } from './generalcommands/ListCommandsCommand';
import { AddWordCommand } from './messagecheckercommands/AddWordCommand';
import { GetReportChannelCommand } from './messagecheckercommands/GetReportChannelCommand';
import { GetResponseMessageCommand } from './messagecheckercommands/GetResponseMessageCommand';
import { ListWordsCommand } from './messagecheckercommands/ListWordsCommand';
import { RemoveWordCommand } from './messagecheckercommands/RemoveWordCommand';
import { SetDeleteMessageCommand } from './messagecheckercommands/SetDeleteMessageCommand';
import { SetResponseMessageCommand } from './messagecheckercommands/SetResponseMessageCommand';
import { GetStarboardChannelCommand } from './starboardcommands/GetStarboardChannelCommand';
import { GetStarboardEmojiCommand } from './starboardcommands/GetStarboardEmojiCommand';
import { GetStarboardThresholdCommand } from './starboardcommands/GetStarboardThresholdCommand';
import { SetStarboardThresholdCommand } from './starboardcommands/SetStarboardThresholdCommand';
import { SetReportChannelCommand } from './messagecheckercommands/SetReportChannelCommand';
import { SetStarboardChannelCommand } from './starboardcommands/SetStarboardChannelCommand';
import { SetStarboardEmojiCommand } from './starboardcommands/SetStarboardEmojiCommand';
import { RotateImageCommand } from './rotateimagecommands/RotateImageCommand';

export class CommandParams {
    /** Default params: server, memberperms, messageReply */
    public static requiresDefaults = [
        // General Commands
        ListCommandsCommand.name,
        // Message Checker Commands
        AddWordCommand.name,
        GetReportChannelCommand.name,
        GetResponseMessageCommand.name,
        ListWordsCommand.name,
        RemoveWordCommand.name,
        SetDeleteMessageCommand.name,
        SetResponseMessageCommand.name,
        // Starboard Commands
        GetStarboardChannelCommand.name,
        GetStarboardEmojiCommand.name,
        GetStarboardThresholdCommand.name,
        SetStarboardThresholdCommand.name,
    ]

    /** Requires Collection of Channels from Guild on top of defaults */
    public static requiresChannels = [
        // Message Checker Commands
        SetReportChannelCommand.name,
        // Starboard Commands
        SetStarboardChannelCommand.name,
    ]

    /** Requires Collection of Emojis from Guild on top of defaults */
    public static requiresEmojis = [
        SetStarboardEmojiCommand.name,
    ]

    /** Requires Channel and userId invoker on top of defaults */
    public static requiresRotateImageData = [
        RotateImageCommand.name,
    ]
}
