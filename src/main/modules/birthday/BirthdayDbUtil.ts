import { DatabaseConnection } from '../../DatabaseConnection';

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
