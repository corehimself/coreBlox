const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getSettings } = require('../../schemas/guild');
const { createEmbed, createFieldEmbed } = require('../../utils/Helpers');

// const WARN_COLOR = '#eb4034';
// const SUCCESS_COLOR = '#00ff44';
const CONSTRAST_SUCCESS = '#0099ff';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-role')
        .setDescription('Manage authorized roles')
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Sets the assigned role as a bot executor')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to bind')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Removes the assigned role from bot executor')
        ),
    
    run: async ({ interaction, client }) => {
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

        const { guild, options } = interaction;
        const sub = options.getSubcommand();
        const data = await getSettings(guild);
        const selectedRole = options.getRole('role');
        let selectedEmbed = null;

        switch (sub) {
            case 'set':
                if (data.botExecutor) {
                    selectedEmbed = createEmbed('❌ Bot Settings Failed to Update', `${interaction.guild.roles.cache.find(role => role.id === data.botExecutor)} is currently set as the bot executor`)
                } else {
                    selectedEmbed = createFieldEmbed('✅ Bot Settings Updated', [
                        { name: '🪪 Role', value: `${selectedRole}`, inline: true },
                        { name: '🆔 Role ID', value: `${selectedRole.id}`, inline: true }
                    ], CONSTRAST_SUCCESS, guild.iconURL(), { text: 'Bot Settings', iconURL: client.user.avatarURL() }, `The bot executor role has been updated to ${selectedRole}`)

                    data.botExecutor = selectedRole.id;
                    await data.save();
                }
                break;
            case 'remove':
                if (data.botExecutor) {
                    selectedEmbed = createEmbed('✅ Bot Settings Updated', `${interaction.guild.roles.cache.find(role => role.id === data.botExecutor)} has been removed as the bot executor role`)

                    data.botExecutor = null;
                    await data.save();
                } else {
                    selectedEmbed = createEmbed('❌ There is currently no role assigned as bot executor')

                }
                break;
        }

        await interaction.editReply({
            embeds: [ selectedEmbed ],
            ephemeral: true
        });
    },
};