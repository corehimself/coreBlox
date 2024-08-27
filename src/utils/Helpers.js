const { EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
require('dotenv/config');

// Encryption settings
const CRYPTO_ALGO = "aes-256-cbc";
const CRYPTO_CIPHER_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

const colorToCode = {
    red: '#eb4034',
    green: '#0099ff',
};

const encrypt = (passedText) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(CRYPTO_ALGO, CRYPTO_CIPHER_KEY, iv);
    let encrypted = cipher.update(passedText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
};

const decrypt = (passedText) => {
    const textParts = passedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'base64');
    const encryptedText = Buffer.from(textParts.join(':'), 'base64');
    const decipher = crypto.createDecipheriv(CRYPTO_ALGO, CRYPTO_CIPHER_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

function createEmbed(title, description, color, thumbnail = '', footer) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setTimestamp();

    if (description) {
        embed.setDescription(description);
    }
    
    if (color) {
        embed.setColor(color);
    }

    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    if (footer) {
        embed.setFooter(footer)
    }

    return embed;
}

function createFieldEmbed(title, fields, color, thumbnail, footer, desc) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setTimestamp();

    if (color) {
        embed.setColor(color);
    }

    fields.forEach(field => {
        embed.addFields(field);
    });
    
    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    if (footer) {
        embed.setFooter(footer);
    }

    return embed;
}

function createSingleLogEmbed(validatedPlayer, pageData, log, playerThumbnail) {
    const { currentPage, maxPages } = pageData;
    const { durationText, startTime, endTime } = convertDurationAndCalculateEndTime(log);
    const embed = createEmbed(`📅 Ban Date: ${startTime}`, null, null, playerThumbnail);

    embed.addFields(
        { name: '⏳ Ban Duration', value: `${log.duration ? durationText : 'Permanent'}`, inline: true },
        { name: '⏰ Ban End', value: `${log.duration ? endTime : 'Never'}`, inline: true },
        { name: '📋 Display Reason', value: `${log.displayReason || 'N/A'}`, inline: true },
        { name: '🔒 Private Reason', value: `${log.privateReason || 'N/A'}`, inline: true },
    );
    embed.setFooter({ text: `📃 Moderation Log ${currentPage + 1} of ${maxPages}`});
    return embed;
}

function convertDuration(duration) {
    if (duration > 60) {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        let minString = `${minutes > 1 && 'minute(s)' || 'minute'}`;
        let convertedSeconds = seconds !== 0 ? seconds + ` seconds(s)` : null
        return `${minutes}${minString} ${convertedSeconds}`;
    } else if (duration === -1)  {
        return "Permanent";
    } else {
        return `${duration} second(s)`;
    }
}

function formatBanDuration(duration, length) {
    let totalSeconds = duration;
    if (length === 'Minutes') {
        totalSeconds *= 60;
    } else if (length === 'Hours') {
        totalSeconds *= 3600;
    } else if (length === 'Days') {
        totalSeconds *= 86400;
    } else if (length === 'Permanent') {
        return { seconds: -1, format: 'Permanent'};
    }

    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (days > 0) result += `${days} day(s) `;
    if (hours > 0) result += `${hours} hour(s) `;
    if (minutes > 0) result += `${minutes} minute(s) `;
    if (seconds > 0) result += `${seconds} second(s) `;

    return { seconds: totalSeconds, format: result.trim() };
}

function convertDurationAndCalculateEndTime(data) {
    const startTime = new Date(data.createTime ? data.createTime : data.startTime);
    const discordStartTime = `<t:${Math.floor(startTime.getTime() / 1000)}:f>`;

    if (!data.duration) {
        return { durationText: 'N/A', startTime: discordStartTime, endTime: 'Never' };
    }

    const durationInSeconds = parseInt(data.duration.replace('s', ''), 10);
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    let durationString = '';
    if (hours > 0) {
        durationString += `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        if (durationString) durationString += ' and ';
        durationString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (seconds > 0) {
        if (durationString) durationString += ' and ';
        durationString += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    const endTime = new Date(startTime.getTime() + durationInSeconds * 1000);
    const discordEndTime = `<t:${Math.floor(endTime.getTime() / 1000)}:f>`;

    return { durationText: durationString, startTime: discordStartTime, endTime: discordEndTime };
}

async function handleConfirmation(interaction, embedMessage, followUp) {
    const message = 
    followUp ? await interaction.followUp({
        embeds: [ embedMessage ], fetchReply: true
    }) : await interaction.editReply({
        embeds: [ embedMessage ],
        fetchReply: true
    });
    await message.react('👍');
    await message.react('👎');

    return handleReactionAsync(interaction, message);
}

async function handleReactionAsync(interaction, messageObj) {
    return new Promise((resolve, reject) => {
        const collectorFilter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        };
        
        const collector = messageObj.createReactionCollector({ filter: collectorFilter, max: 1, time: 60000, errors: ['time'] });
        collector.on('collect', (reaction, user) => {
            try {
                if (reaction.emoji.name === '👍') {
                    resolve({ reaction, user, reactionState: true });
                } else {
                    resolve({ reaction, user, reactionState: false });
                }
            } catch (err) {
                reject(`Error during reaction collection: ${err}`);
            }
        });

        collector.on('end',()  => {
            try {
                messageObj.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            } catch (err) {
                reject(`Error during reaction removal: ${err}`);
            }
        });
    });
}

module.exports = { createSingleLogEmbed, convertDuration,  formatBanDuration, handleConfirmation, createEmbed, createFieldEmbed, decrypt, encrypt, handleReactionAsync }