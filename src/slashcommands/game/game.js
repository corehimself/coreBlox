const { ActionRowBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { ButtonKit } = require('commandkit');
const {
    convertDuration, createEmbed, createFieldEmbed, createSingleLogEmbed, formatBanDuration, handleConfirmation
} =
    require('../../utils/Helpers.js');
const { apply_restriction, get_restriction, publish_message, validateAndRetrieve } =
    require('../../utils/RobloxHelpers.js');
const { getSettings, listUniverses } = require('../../schemas/guild.js');

const WARN_COLOR = '#eb4034';
const SUCCESS_COLOR = '#00ff44';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Manage game-related actions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Warn a player in the game')
                .addStringOption(option =>
                    option
                        .setName('server')
                        .setDescription('The server to warn the user in')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('player')
                        .setDescription('The player to warn')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for warning the player')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Kick a player from the game')
                .addStringOption(option =>
                    option
                        .setName('server')
                        .setDescription('The server to kick the player from')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('player')
                        .setDescription('Kick user by Username or User ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for kicking the player')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Unbans a player from the game')
                .addStringOption(option =>
                    option
                        .setName('server')
                        .setDescription('The server to kick the player from')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option =>
                    option
                        .setName('player')
                        .setDescription('Unban user by Username or User ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for unbanning')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('internal-reason')
                        .setDescription('Interal Reason for unbanning')
                )
                .addBooleanOption(option =>
                    option
                        .setName('apply-to-universe')
                        .setDescription('Attempt to ban from all places in a universe')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Bans a player with configured options from an experience')
                .addStringOption(option =>
                    option
                        .setName('server')
                        .setDescription('The game to kick the user from')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('player')
                        .setDescription('Kick user by Username or User ID')
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option
                        .setName('duration')
                        .setDescription('How long the duration is')
                        .setRequired(true)
                        .setMinValue(0) // -1 = perm
                )
                .addStringOption(option =>
                    option
                        .setName('length')
                        .setDescription('The unit of time for the ban duration')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Minutes', value: 'Minutes' },
                            { name: 'Hours', value: 'Hours' },
                            { name: 'Days', value: 'Days' },
                            { name: 'Permanent', value: 'Permanent' },
                        )
                )
                .addStringOption(option =>
                    option
                        .setName('display-reason')
                        .setDescription('The reason shown to the user')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('internal-reason')
                        .setDescription('Internal reason for the action')
                )
                .addBooleanOption(option =>
                    option
                        .setName('exclude-alts')
                        .setDescription('Attempt to ban alt accounts')
                )
                .addBooleanOption(option =>
                    option
                        .setName('apply-to-universe')
                        .setDescription('Attempt to ban from all places in a universe')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('get-restriction')
                .setDescription('Returns a list of all saved universes')
                .addStringOption(option =>
                    option
                        .setName('server')
                        .setDescription('The universe to retrieve restrictions from')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('identifier')
                        .setDescription('Retrieve player by name/ID')
                        .setRequired(true)
                )
                .addBooleanOption(bool =>
                    bool
                        .setName('history')
                        .setDescription('Retrieve a users history')
                        .setRequired(true)
                )
        ),
    run: async ({ interaction }) => {
        if (!interaction.deferred) await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const serverSettings = await getSettings(interaction.guild);

        await handleInteraction(interaction, serverSettings, subcommand);
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getString('server');
        const choices = await listUniverses(interaction.guildId);

        const filtered = choices.filter((choice) => {
            if (typeof focusedValue === 'string') {
                return choice.universeName.toLowerCase().startsWith(focusedValue.toLowerCase());
            }
            return false;
        });

        await interaction.respond(filtered.map((choice) => ({
            name: choice.universeName,
            value: choice.universeId
        })));
    }
};

async function handleKick(interaction, apiKey, chosenServer, validatedPlayer, reason, playerThumbnail) {
    try {
        const payload = JSON.stringify({
            UserIds: [ validatedPlayer.id ],
            DisplayReason: reason,
            Method: 'Kick',
        });

        const response = await publish_message(apiKey, chosenServer, payload);
        const responseColor = response ? SUCCESS_COLOR : WARN_COLOR;
        const responseFields = [
            { name: '👤 Username', value: `${validatedPlayer.name}`, inline: true  },
            { name: '🆔 User ID', value: `${validatedPlayer.id}`, inline: true },
        ];

        const responseEmbed = createFieldEmbed(`${response ? '✔️ Kick Successful' : '❌ Kick Failed'}`, responseFields, responseColor, playerThumbnail);
        await interaction.editReply({ embeds: [responseEmbed] });
    } catch (err) {
        console.error(`Messaging Service API Failed | ${err}`);
    }
}

async function handleBan(interaction, apiKey, chosenServer, validatedPlayer, duration, displayReason, privateReason, excludeAlts, applyToUniverse, playerThumbnail) {
    const playerBanned = await isUserBanned(apiKey, chosenServer, validatedPlayer);
    if (playerBanned) {
        return await handleGetRestriction(interaction, apiKey, chosenServer, validatedPlayer, false, playerThumbnail);
    };

    try {
        const banState = await apply_restriction(apiKey, chosenServer, validatedPlayer.id, true, displayReason, privateReason, duration, excludeAlts);
        const durationString = convertDuration(duration);
        const responseColor = banState ? SUCCESS_COLOR : WARN_COLOR;
        const responseFields = [
            { name: '👤 Username', value: `${validatedPlayer.name}`, inline: true },
            { name: '🆔 User ID', value: `${validatedPlayer.id}`, inline: true },
            { name: '⏳ Duration', value: durationString, inline: true },
            { name: '📢 Display Reason', value: displayReason, inline: false },
            { name: '🔒 Private Reason', value: privateReason || "None set", inline: false },
            { name: '🚫 Exclude Alt Accounts', value: excludeAlts ? 'Yes' : 'No', inline: true },
            { name: '🌐 Apply to Universe', value: applyToUniverse ? 'Yes' : 'No', inline: true },
        ];

        const responseEmbed = createFieldEmbed(`${banState ? '✔️ Ban Successful' : '❌ Ban Failed'}`, responseFields, responseColor, playerThumbnail);
        await interaction.editReply({ embeds: [ responseEmbed ] });
    } catch (err) {
        console.error(`Ban API failed | ${err}`)
    }
}

async function isUserBanned(apiKey, chosenServer, validatedPlayer) {
    const pID = validatedPlayer.id;
    const logs = await fetchRestrictions(apiKey, chosenServer);
    const bannedUsers = logs.userRestrictions ? logs.userRestrictions.map(restriction => restriction.user.split('/')[1]) : [];

    return bannedUsers.includes(pID.toString());
}

async function fetchRestrictions(apiKey, chosenServer) {
    let logs = [];
    let pageToken = '';

    do {
        const restricts = await get_restriction(apiKey, chosenServer, pageToken);
        logs = logs.concat(restricts.logs);
        pageToken = restricts.nextPageToken;
    } while (pageToken);

    return logs;
}

async function handlePagination(interaction, validatedPlayer, userLogs, playerThumbnail) {
    let page = 0;
    let embed = createSingleLogEmbed(validatedPlayer, { currentPage: page, maxPages: userLogs.length }, userLogs[page], playerThumbnail);

    const nextPageButton = new ButtonKit()
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('next');

    const prevPageButton = new ButtonKit()
        .setEmoji('⏮️')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('prev')
        .setDisabled(true);

    const buttonRow = new ActionRowBuilder().addComponents(prevPageButton, nextPageButton);
    const message = await interaction.editReply({
        content: `Ban History for: **${validatedPlayer.name}**`,
        embeds: [embed],
        components: [buttonRow],
        fetchReply: true
    });

    nextPageButton.onClick(async (buttonInteraction) => {
        if (page < userLogs.length - 1) {
            page++;
        }

        prevPageButton.setDisabled(page === 0);
        nextPageButton.setDisabled(page === userLogs.length - 1);

        embed = createSingleLogEmbed(validatedPlayer, { currentPage: page, maxPages: userLogs.length }, userLogs[page], playerThumbnail);
        await buttonInteraction.update({
            embeds: [embed],
            components: [buttonRow],
            fetchReply: true
        });
    }, { message });

    prevPageButton.onClick(async (buttonInteraction) => {
        if (page > 0) {
            page--;
        }

        prevPageButton.setDisabled(page === 0);
        nextPageButton.setDisabled(page === userLogs.length - 1);

        embed = createSingleLogEmbed(validatedPlayer, { currentPage: page, maxPages: userLogs.length }, userLogs[page], playerThumbnail);
        await buttonInteraction.update({
            embeds: [embed],
            components: [buttonRow],
            fetchReply: true
        });
    }, { message });
}

async function handleGetRestriction(interaction, apiKey, chosenServer, validatedPlayer, getHistory, playerThumbnail) {
    const pID = validatedPlayer.id;
    const logs = await fetchRestrictions(apiKey, chosenServer);

    if (getHistory) {
        const userLogs = logs.filter(log => log.user === `users/${pID}`);
        if (userLogs.length > 0) {
            await handlePagination(interaction, validatedPlayer, userLogs, playerThumbnail);
        } else {
            const embed = createEmbed(`No Ban History for ${validatedPlayer.name}`, 'This user has no moderation history', '#00FF00', playerThumbnail);
            await interaction.editReply({ embeds: [embed] });
        }
    } else {
        const bannedUsers = logs.userRestrictions.map(restriction => restriction.user.split('/')[1]);
        const embed = createEmbed('🔨 Ban Check', `${validatedPlayer.name} is currently **${bannedUsers.includes(pID.toString()) ? 'banned' : 'not banned'}**`, '#00FF00', playerThumbnail);
        await interaction.editReply({ embeds: [embed] });
    }
}

async function handleUnban(interaction, apiKey, chosenServer, chosenReason, internalReason, validatedPlayer, applyToUniverse, playerThumbnail) {
    try {
        const banState = await apply_restriction(apiKey, chosenServer, validatedPlayer.id, false, chosenReason, internalReason);
        const responseColor = banState ? SUCCESS_COLOR : WARN_COLOR;
        const responseFields = [
            { name: '👤 Username', value: `${validatedPlayer.name}`, inline: true },
            { name: '🆔 User ID', value: `${validatedPlayer.id}`, inline: true },
            { name: '🌐 Apply to Universe', value: applyToUniverse ? 'Yes' : 'No', inline: true },
        ];
        const responseEmbed = createFieldEmbed(`${banState ? '✔️ Unban Successful' : '❌ Unban Failed'}`, responseFields, responseColor, playerThumbnail);
        await interaction.editReply({ embeds: [ responseEmbed ] });
    } catch (err) {
        console.error(`Unban API failed | ${err}`)
    }
}

async function handleWarn(interaction, apiKey, chosenServer, validatedPlayer, displayReason, playerThumbnail) {
    const payload = JSON.stringify({
        UserIds: [ validatedPlayer.id ],
        DisplayReason: displayReason,
        Method: 'Warn',
    });

    try {
        const warnResponse = await publish_message(apiKey, chosenServer, payload);
        // const { banState, banInfo } = await set_entry(apiKey, chosenServer, "DTR", `Player_${validatePlayer.id}`, payload);
    
        const responseColor = banState ? SUCCESS_COLOR : WARN_COLOR;
        const responseFields = [
            { name: '👤 Username', value: `${validatedPlayer.name}`, inline: true },
            { name: '🆔 User ID', value: `${validatedPlayer.id}`, inline: true },
            { name: '📢 Display Reason', value: displayReason, inline: false },
            { name: '⚠️ Messaging Service', value: warnResponse ? 'Warn Successful' : 'Failed', inline: false },
        ];
    
        const responseEmbed = createFieldEmbed(`${warnResponse ? '✔️ Warn Successful' : '❌ Warn Failed'}`, responseFields, responseColor, playerThumbnail);
        await interaction.editReply({ embeds: [ responseEmbed ] });
    } catch (err) {
        console.error(`Warn API failed | ${err}`)
    }
}

async function handleInteraction(interaction, settings, actionType) {
    const actionName = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;

    const { options } = interaction;
    const chosenServer = options.getString('server');
    const chosenPlayer = options.getString('player');
    const chosenReason = options.getString('reason');
    const displayReason = options.getString('display-reason');
    const internalReason = options.getString('internal-reason') ?? displayReason ?? chosenReason;
    const chosenDuration = options.getNumber('duration');
    const chosenLength = options.getString('length');
    const useHistory = options.getBoolean('history');
    const applyToUniverse = options.getBoolean('apply-to-universe') ?? false;
    const excludeAlts = options.getBoolean('exclude-alts') ?? false;

    try {
        const { apiKey, validatedPlayer, playerThumbnail } = await validateAndRetrieve(interaction, chosenPlayer);
        if (!apiKey || !validatedPlayer || !validatedPlayer.id) return;

        let confirmationMessage = '';
        let actionFunction = null;

        switch (actionType) {
            case 'ban':
                const { seconds, format } = formatBanDuration(chosenDuration, chosenLength);
                confirmationMessage = `
                Are you sure you want to ban **${validatedPlayer.name}**?
                \nDuration: **${format}**
                \nDisplay Reason: **${displayReason}**
                \nPrivate Reason: **${internalReason}
                **`;
                actionFunction = async () => handleBan(interaction, apiKey, chosenServer, validatedPlayer, seconds, displayReason, internalReason, excludeAlts, applyToUniverse, playerThumbnail);
                break;
            case 'unban':
                confirmationMessage = `Are you sure you want to unban **${validatedPlayer.name}**?`;
                actionFunction = async () => handleUnban(interaction, apiKey, chosenServer, chosenReason, internalReason, validatedPlayer, applyToUniverse, playerThumbnail);
                break;
            case 'kick':
                confirmationMessage = `Are you sure you want to kick **${validatedPlayer.name}**?\n\nReason: **${chosenReason}**`;
                actionFunction = async () => handleKick(interaction, apiKey, chosenServer, validatedPlayer, chosenReason, playerThumbnail);
                break;
            case 'warn':
                confirmationMessage = `Are you sure you want to warn **${validatedPlayer.name}**?\n\nReason: **${chosenReason}**`;
                actionFunction = async () => handleWarn(interaction, apiKey, chosenServer, validatedPlayer, chosenReason, playerThumbnail);
                break;
            case 'get-restriction':
                confirmationMessage = `Are you sure you want to retrieve restrictions for **${validatedPlayer.name}**?`;
                actionFunction = async () => handleGetRestriction(interaction, apiKey, chosenServer, validatedPlayer, useHistory, playerThumbnail);
                break;
        }

        const confirmPlayerEmbed = createEmbed(`⚠️ Confirm ${actionName}`, confirmationMessage, WARN_COLOR, playerThumbnail);
        const { reactionState } = await handleConfirmation(interaction, confirmPlayerEmbed);

        if (reactionState === true) {
            await actionFunction();
            if (settings.logging.enabled) {
                const modObject = settings.logging.log_channels.find(channel => channel.name === 'moderation');
                const logChannel = await interaction.guild.channels.fetch(modObject._id);
                if (!logChannel) return;

                const logEmbed = createEmbed(
                    `🛡️ Moderation Action: ${actionName}`,
                    `\n**👤 User:** ${validatedPlayer.name} (${validatedPlayer.id})
                    \n**📝 Action:** ${actionType}
                    \n**🔨 Moderator: ** <@${interaction.user.id}>
                    ${chosenReason ? `\n**📄 Reason:** ${chosenReason}` : null}
                    ${chosenDuration ? `\n**⏳ Duration:** ${chosenDuration}` : null}
                    ${displayReason ? `\n**📢 Display Reason:** ${displayReason}` : null}
                    ${internalReason !== displayReason ? `\n**🔒 Internal Reason:** ${internalReason}` : null}`,
                    WARN_COLOR
                );                

                await logChannel.send({ embeds: [ logEmbed ] });
            }
        } else {
            const responseFields = [
                { name: `❌ ${actionName} Cancelled`, value: `Cancelling the ${actionName} process` }
            ];
            const cancelEmbed = createFieldEmbed('❌ Discord <-> Roblox System', responseFields, WARN_COLOR);
            await interaction.editReply({ embeds: [ cancelEmbed ] });
        }
    } catch (err) {
        console.error(`${actionName} failed:`, err);
        await interaction.editReply({ content: `There was an error trying to process your ${actionName} operation. Please try again later.` });
    }
}