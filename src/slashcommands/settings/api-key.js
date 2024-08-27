const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getSettings, setApiKey } = require('../../schemas/guild');
const { createEmbed, createFieldEmbed } = require('../../utils/Helpers');

const WARN_COLOR = '#eb4034';
const CONSTRAST_SUCCESS = '#0099ff';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('api-key')
        .setDescription('API Key management')
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Sets the api key')
                .addStringOption(option =>
                    option
                        .setName('key')
                        .setDescription('The Roblox API key to save (overwrites)')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Removes the key from the database')
        ),
    run: async ({ interaction }) => {
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

        const { guild, guildId, options } = interaction;
        const settings = await getSettings(guild);
        const sub = options.getSubcommand();
        const apiKey = options.getString('key');
        let selectedEmbed = null;

        switch(sub) {
            case 'set':
                await setApiKey(guildId, apiKey);
                selectedEmbed = createFieldEmbed('✔️ API Key Saved Successfully', [
                    { name: 'REMINDER:', value: 'Never share your API keys with anyone! Doing so may completely expose your linked experience.', inline: false }
                ], CONSTRAST_SUCCESS)
                break;
            case 'remove':
                if (settings.cloud.apiKey) {
                    settings.cloud.apiKey = null;
                    await settings.save();
                    selectedEmbed = createEmbed('✔️ API Key Removed Successfully', null, CONSTRAST_SUCCESS)
                } else {
                    selectedEmbed = createEmbed('❌ No API key configured! Did you set one?', null, WARN_COLOR)
                }
                break;
        }

        await interaction.editReply({
            embeds: [ selectedEmbed ],
            ephemeral: true
        })
    },
};