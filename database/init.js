/* eslint-disable */
const Database = require('better-sqlite3');
const fs = require('fs');

function migrateToVersion(
    db /* BetterSqlite3.Database */,
    versionNumber /* number */,
) {
    const { migrationStatements } = require(`./migrations/${versionNumber}`);
    for (const statement of migrationStatements) {
        db.prepare(statement).run();
    }
    db.pragma(`user_version = ${versionNumber}`);
}

function initOrMigrate(dbPath /* string */, dbConfig /* Database.Options */) {
    const isInitialStart = !fs.existsSync(dbPath);
    const db = new Database(dbPath, {
        verbose: console.log,
        ...dbConfig,
    });

    // Populate the database with pre-v0 data if it is the initial start.
    if (isInitialStart) {
        migrateToVersion(db, 0);

        // Parse json and insert to db.
        if (fs.existsSync('./database/servers.json')) {
            const servers = JSON.parse(
                fs.readFileSync('./database/servers.json', 'utf-8'),
            );
            for (const server of servers) {
                const {
                    serverId,
                    starboardSettings,
                    messageCheckerSettings,
                } = server;

                // Add serverId into db
                db.prepare(`INSERT INTO servers VALUES (?)`).run(serverId);

                // Add starboardSettings
                const { channel, emojis, threshold } = starboardSettings;
                db.prepare(
                    `INSERT INTO starboardSettings (serverId, channel, threshold) VALUES (?, ?, ?)`,
                ).run(serverId, channel, threshold);
                for (const emoji of emojis) {
                    const { name, id } = emoji;
                    db.prepare(
                        `INSERT INTO starboardEmojis (serverId, id, name) VALUES (?, ?, ?)`,
                    ).run(serverId, id, name);
                }

                // Add messageCheckerSettings
                let {
                    deleteMessage,
                    reportingChannelId,
                    responseMessage,
                    bannedWords,
                } = messageCheckerSettings;
                deleteMessage = deleteMessage === true ? 1 : 0;
                db.prepare(
                    `INSERT INTO messageCheckerSettings
                        (serverId, reportingChannelId, responseMessage, deleteMessage)
                        VALUES (?, ?, ?, ?)`,
                ).run(
                    serverId,
                    reportingChannelId,
                    responseMessage,
                    deleteMessage,
                );
                for (const bannedWord of bannedWords) {
                    db.prepare(
                        `INSERT INTO messageCheckerBannedWords (serverId, word) VALUES (?, ?)`,
                    ).run(serverId, bannedWord);
                }
            }
        }
    }

    // Migrate the database to the latest version.
    // Note: update LATEST_VERSION whenever the database schema changes!
    const LATEST_VERSION = 0;
    const curVersion = db.pragma('user_version', { simple: true });
    for (let i = curVersion + 1; i <= LATEST_VERSION; ++i) {
        migrateToVersion(db, i);
    }
}

exports.initOrMigrate = initOrMigrate;
