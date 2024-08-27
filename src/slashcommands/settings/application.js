const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/Helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-application')
        .setDescription('Sends your appeal application')
        .addChannelOption(channel =>
            channel
                .setName('channel')
                .setDescription('The channel to display your application in')
                .setRequired(true)
        ),
    run: async ({ interaction }) => {
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

        const { options } = interaction;
        const selectedChannel = options.getChannel('channel');
        const submitAppealButton = new ButtonBuilder()
            .setCustomId('submit-appeal')
            .setLabel('📝 Submit Appeal')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(submitAppealButton);
        const unbanEmbed = createEmbed('✏️ Unban Appeal', 'Please fill out the form below to appeal your ban', '#0099ff')

        await selectedChannel.send({
            embeds: [ unbanEmbed ],
            components: [ row ],
            fetchReply: true
        });

        await interaction.followUp({
            content: `✅ Application sent to ${selectedChannel}`,
            ephemeral: true
        });
    },
};