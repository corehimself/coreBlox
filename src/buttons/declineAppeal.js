const { EmbedBuilder } = require('discord.js');
const { getSettings } = require('../schemas/guild');
const appealSchema = require('../schemas/appeals');
const { createEmbed } = require('../utils/Helpers');

module.exports = {
    name: 'decline-appeal',
    async run({interaction, client}) {
        const userAppeals = await appealSchema.findOne({ _id: interaction.message.id });
        const member = await interaction.guild.members.fetch({
            user: userAppeals.Data[0].interactionUser,
            force: true
        });
        const settings = await getSettings(interaction.guild);
        const appealObject = settings.logging.log_channels.find(channel => channel.name === 'appeals');
        const logChannel = client.channels.cache.get(appealObject._id);
        
        const rejectedEmbed = createEmbed('🔨 Application Status', `
            Your ban application from **${interaction.guild.name}** has been **rejected**!
            \n
            \n🪪 Moderated User: **${userAppeals.Data[0].robloxUser}**
            \n🆔 Game Link: https://roblox.com/games/${userAppeals.Data[0].chosenServer}
            `
        )

        await member.send({
            embeds: [ rejectedEmbed ]
        });

        logChannel.messages.fetch(interaction.message.id)
            .then(async message => {
                await appealSchema.findByIdAndDelete(interaction.message.id);
                message.delete();
            });
    },
};