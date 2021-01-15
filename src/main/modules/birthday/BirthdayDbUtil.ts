import { DatabaseConnection } from '../../DatabaseConnection';

export function getLastAnnouncedDate(
    serverId: string,
): { day: number; month: number; year: number } {
    const db = DatabaseConnection.connect();
    const res = db
        .prepare(
            `SELECT lastAnnouncedDay, lastAnnouncedMonth, lastAnnouncedYear
                    FROM birthdaySettings
                    WHERE serverId = ?`,
        )
        .get(serverId);
    db.close();
    return {
        day: res?.lastAnnouncedDay ?? 0,
        month: res?.lastAnnouncedMonth ?? 0,
        year: res?.lastAnnouncedYear ?? 0,
    };
}

export function getBirthdayChannelId(serverId: string): string | undefined {
    const db = DatabaseConnection.connect();
    const channelId = db
        .prepare('SELECT channelId FROM birthdaySettings WHERE serverId = ?')
        .get(serverId);
    db.close();
    return channelId?.channelId;
}

export function setLastAnnouncedDate(
    serverId: string,
    day: number,
    month: number,
    year: number,
): void {
    const db = DatabaseConnection.connect();
    db.prepare(
        `INSERT INTO birthdaySettings(serverId, lastAnnouncedDay, lastAnnouncedMonth, lastAnnouncedYear)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(serverId) DO UPDATE SET
                    lastAnnouncedDay=excluded.lastAnnouncedDay,
                    lastAnnouncedMonth=excluded.lastAnnouncedMonth,
                    lastAnnouncedYear=excluded.lastAnnouncedYear`,
    ).run(serverId, day, month, year);
    db.close();
}
export function getUserIdsWithBirthday(
    serverId: string,
    day: number,
    month: number,
): string[] {
    const db = DatabaseConnection.connect();
    const userIds = db
        .prepare(
            'SELECT userId FROM birthdays WHERE serverId=? AND day=? AND month=?',
        )
        .all(serverId, day, month);
    db.close();
    return userIds.map((userId) => userId.userId);
}

/**
 * Assigns the channel with the given ID as the
 * birthday announcement channel for the server with the given ID.
 *
 * @param serverId The ID of the server.
 * @param channelId The ID of the channel.
 */
export function setBirthdayChannel(
    serverId: string,
    channelId: string | null,
): void {
    const db = DatabaseConnection.connect();
    db.prepare(
        `INSERT INTO birthdaySettings(serverId, channelId)
        VALUES(?, ?)
        ON CONFLICT(serverId) DO UPDATE SET
            channelId=excluded.channelId`,
    ).run(serverId, channelId);
    db.close();
}

export function setBirthday(
    serverId: string,
    userId: string,
    day: number,
    month: number,
): void {
    const db = DatabaseConnection.connect();
    db.prepare(
        `INSERT INTO birthdays(serverId, userId, day, month)
            VALUES(?, ?, ?, ?)
            ON CONFLICT(serverId, userId) DO UPDATE SET
                day=excluded.day,
                month=excluded.month`,
    ).run(serverId, userId, day, month);
    db.close();
}
