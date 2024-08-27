const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getUniverseIdFromPlace } = require('../../utils/RobloxHelpers')
const {
    addUniverse, removeUniverse, getUniverse, listUniverses
} = require('../../schemas/guild');
const { createEmbed } = require('../../utils/Helpers');

const WARN_COLOR = '#eb4034';
const SUCCESS_COLOR = '#00ff44';
const CONSTRAST_SUCCESS = '#0099ff';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('universe')
        .setDescription('Universe management options')
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('Adds the specified universe to the database')
                .addStringOption(option =>
                    option
                        .setName('game_name')
                        .setDescription('Your server identifier')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('universe_id')
                        .setDescription('Your server universe ID')
                        .setRequired(true)
                ),
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Removes the specified universe from the database')
                .addStringOption(option =>
                    option
                        .setName('game_name')
                        .setDescription('Your server identifier')
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('Returns a list of all saved universes')
        ),
    run: async ({ interaction }) => {
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

        const { guildId, options } = interaction;
        const sub = options.getSubcommand();
        // const data = await getSettings(guild);
        const universeName = options.getString('game_name');
        const universeId = options.getInteger('universe_id');
        const keyReserved = await getUniverse(guildId, universeId);
        let selectedEmbed = null;

        switch (sub) {
            case 'add':
                if (keyReserved) {
                    selectedEmbed = createEmbed(`❌ **${universeName}** already exists!`, null, WARN_COLOR)
                } else {
                    const result = await addUniverse(guildId, universeName, universeId);
                    selectedEmbed = createEmbed(`${result ? '✔️ Universe Saved' : '❌ Universe Save Failed'}`,
                        `${result ? 'Successfully saved' : 'Failed to save'}: **${universeName}**`,
                        `${result ? SUCCESS_COLOR : WARN_COLOR}`
                    )
                }
                break;
            case 'remove':
                await removeUniverse(guildId, universeName);
                selectedEmbed = createEmbed('✔️ Universe saved', `**${universeName}** has been removed`, WARN_COLOR)
                break;
            case 'list':
                var universes = await listUniverses(guildId);
                selectedEmbed = createEmbed('📝 List of Universes', null, CONSTRAST_SUCCESS)

                if (universes.length > 0) {
                    universes.forEach(async universe => {
                        var gameLink = await getUniverseIdFromPlace(universe.universeId)
                        selectedEmbed.addFields([
                            { name: '👤 Game Name', value: universe.universeName, inline: true },
                            { name: '🆔 Universe ID', value: universe.universeId, inline: true },
                            { name: '🔗 Game Link', value: `https://roblox.com/games/${gameLink}/${universe.universeName}`, inline: true }
                        ])
                    });
                } else {
                    selectedEmbed.addFields([
                        { name: '🚀 Nothing to see here', value: 'Add a universe to get started!', inline: true }
                    ]);
                }
                break;
        }

        await interaction.editReply({
            embeds: [ selectedEmbed ],
            ephemeral: true
        });
    },

    autocomplete: async ({ interaction }) => {
        const { guildId, options } = interaction;
        const focusedValue = options.getString('game_name');
        const choices = await listUniverses(guildId);

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