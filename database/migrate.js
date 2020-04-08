const Database = require('better-sqlite3');
const fs = require('fs');

// eslint-disable-next-line
const db = new Database('servers.db', { verbose: console.log });

const servers = JSON.parse(fs.readFileSync('./servers.json', 'utf-8'));

for (const server of servers) {
    const { serverId, starboardSettings, messageCheckerSettings } = server;

    // Add serverId into db
    db.prepare(`INSERT INTO servers VALUES (?)`).run(serverId);

    // Add starboardSettings
    const { channel, emojis, threshold } = starboardSettings;
    db.prepare(`INSERT INTO starboardSettings (serverId, channel, threshold) VALUES (?, ?, ?)`)
        .run(serverId, channel, threshold);
    for (const emoji of emojis) {
        const { name, id } = emoji;
        db.prepare(`INSERT INTO starboardEmojis (serverId, id, name) VALUES (?, ?, ?)`)
            .run(serverId, id, name);
    }

    // Add messageCheckerSettings
    let { deleteMessage, reportingChannelId, responseMessage, bannedWords } = messageCheckerSettings;
    if (deleteMessage === true) deleteMessage = 1;
    else deleteMessage = 0;
    db.prepare(`INSERT INTO messageCheckerSettings (serverId, reportingChannelId, responseMessage, deleteMessage) VALUES (?, ?, ?, ?)`)
        .run(serverId, reportingChannelId, responseMessage, deleteMessage);
    for (const bannedWord of bannedWords) {
        db.prepare(`INSERT INTO messageCheckerBannedWords (serverId, word) VALUES (?, ?)`)
            .run(serverId, bannedWord);
    }
}