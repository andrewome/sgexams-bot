/**
 * Returns true if the given date string is valid.
 * A valid date string is one in the following formats:
 * - DD/MM
 *
 * @param dateString the date string to be checked.
 */
export function isDateValid(dateString: string): boolean {
    const exp = /^\d{2}\/\d{2}$/;
    return exp.test(dateString);
}

/**
 * Parses the given date string into an object containing the day and month.
 *
 * @param dateString the date string to be parsed.
 */
export function parseDate(
    dateString: string,
): { day: number; month: number } | null {
    if (!isDateValid(dateString)) return null;

    const day = parseInt(dateString.substr(0, 2), 10);
    const month = parseInt(dateString.substr(3, 2), 10);
    return { day, month };
}

/**
 * Returns true if the given channel ID string is a channel tag.
 * A channel tag is a string that is prefixed by '<#' and suffixed by '>'.
 */
export function isChannelTag(channelIdString: string): boolean {
    const exp = /^<#.*>$/;
    return exp.test(channelIdString);
}
