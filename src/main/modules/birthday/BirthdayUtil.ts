interface DateObj {
    day: number;
    month: number;
}

/**
 * Parses the given date string into an object containing the day and month.
 * Returns null if the date string is invalid.
 *
 * A valid date string is one in the following formats:
 * - DD/MM
 * - DD/M
 * - D/MM
 * - D/M
 *
 * @param dateString the date string to be checked.
 *
 */
export function parseDate(dateString: string): DateObj | null {
    // Check if the date conforms to D{1,2}/M{1,2}.
    const exp = /^(\d{1,2})\/(\d{1,2})$/;
    const found = dateString.match(exp);
    if (!found) {
        return null;
    }

    const day = +found[1];
    const month = +found[2];
    // Assume a leap year to allow 29 Feb.
    // Subtract 1 from the month as months start from 0 for Date.
    const date = new Date(2000, month - 1, day);
    if (date.getFullYear() !== 2000
        || date.getMonth() !== month - 1
        || date.getDate() !== day) {
        return null;
    }

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

/**
 * Converts a DateObj into a human-readable date string.
 *
 * @param date DateObj the date to convert.
 */
export function prettifyDate(date: DateObj): string {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.day} ${MONTHS[date.month - 1]}`;
}
