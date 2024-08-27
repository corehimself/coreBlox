const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getSettings } = require('../../schemas/guild');
const { createEmbed } = require('../../utils/Helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logging')
        .setDescription('Manage logging channels')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Sets the logging channels for moderation actions')
                .addChannelOption(option =>
                    option
                        .setName('ban-appeals')
                        .setDescription('Your ban appeal channel')
                )
                .addChannelOption(option =>
                    option
                        .setName('moderation')
                        .setDescription('Your moderation channel')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes the logging channels for moderation actions')
                .addStringOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel to remove (ban-appeals or moderation)')
                        .addChoices(
                            { name: '📝 Ban Appeals', value: 'appeals' },
                            { name: '🔨 Moderation Actions', value: 'moderation' },
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('enabled')
                .setDescription('Logging system management')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable/disable logging actions')
                        .setRequired(true)
                )
        ),
    
    run: async ({ interaction }) => {
        if (!interaction.deferred) await interaction.deferReply();

        const { guild, options } = interaction;
        const settings = await getSettings(guild);
        const sub = options.getSubcommand();

        const banAppealsChannel = options.getChannel('ban-appeals');
        const modActionsChannel = options.getChannel('moderation');
        const appealObject = settings.logging.log_channels.find(channel => channel.name === 'appeals');
        const modObject = settings.logging.log_channels.find(channel => channel.name === 'moderation');

        let selectedEmbed = null;

        switch (sub) {
            case 'set':
                if (banAppealsChannel) {
                    if (appealObject) {
                        selectedEmbed = createEmbed(`❌ Logging Ban Appeals to ${banAppealsChannel}`)
                        break;
                    }
                    settings.logging.log_channels.push({
                        _id: banAppealsChannel.id,
                        name: 'appeals'
                    });
                    selectedEmbed = createEmbed(`✅ Logging ban appeals to ${banAppealsChannel}`)
                }
                if (modActionsChannel) {
                    if (modObject) {
                        selectedEmbed = createEmbed(`❌ Logging Ban Appeals to ${banAppealsChannel}`)
                        break;
                    }
                    settings.logging.log_channels.push({
                        _id: modActionsChannel.id,
                        name: 'moderation'
                    });
                    selectedEmbed = createEmbed(`✅ Logging moderation actions to ${modActionsChannel}`);
                }

                await settings.save();
                break;
            case 'remove':
                if (banAppealsChannel) {
                    if (!appealObject) selectedEmbed = createEmbed(`❌ There is currently no ban appeal channel set!`);
                    break;
                }
                if (modActionsChannel) {
                    if (!modObject) selectedEmbed = createEmbed(`❌ There is currently no moderation channel set!`);
                    break;
                }
                const channelToRemove = options.get('channel');
                const fetchedChannel = await guild.channels.fetch(
                    channelToRemove === 'moderation'
                    ? modObject._id
                    : appealObject._id)

                selectedEmbed = createEmbed(`✅ ${fetchedChannel} has been removed`)
                if (channelToRemove === 'moderation') settings.logging.log_channels.moderation = null;
                if (channelToRemove === 'appeals') settings.logging.log_channels.appeals = null;

                await settings.save();
                break;
            case 'enabled':
                const enabledState = options.getBoolean('enabled');
                settings.logging.enabled = enabledState;
                await settings.save();

                selectedEmbed = createEmbed(`✅ Logging is now: ${enabledState === true ? 'Enabled' : 'Disabled'}`)
                break;
        }

        await interaction.editReply({
            embeds: [ selectedEmbed ]
        });
    },
};