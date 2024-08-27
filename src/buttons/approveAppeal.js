const { createEmbed, createFieldEmbed, handleConfirmation } = require('../utils/Helpers');
const { apply_restriction, getUniverseIdFromPlace, validateAndRetrieve } = require('../utils/RobloxHelpers');
const appealSchema = require('../schemas/appeals');

const WARN_COLOR = '#eb4034';
const SUCCESS_COLOR = '#00ff44';

module.exports = {
    name: 'approve-appeal',
    async run({ interaction }) {
        if (!interaction.deferred) await interaction.deferReply(); 
        const userAppeals = await appealSchema.findOne({ _id: interaction.message.id });
        const { apiKey, validatedPlayer, playerThumbnail } = await validateAndRetrieve(interaction, userAppeals.Data[0].robloxUser);
        const confirmationMessage = `Are you sure you want to unban **${validatedPlayer.name}** from **${userAppeals.Data[0].chosenServer}**?\n`;
        const confirmPlayerEmbed = createEmbed(`⚠️ Confirm Unban`, confirmationMessage, WARN_COLOR, playerThumbnail);
        const { reactionState } = await handleConfirmation(interaction, confirmPlayerEmbed);
        const placeUniverseId = await getUniverseIdFromPlace(userAppeals.Data[0].chosenServer);

        if (reactionState === true) {
            try {
                const banState = await apply_restriction(apiKey, placeUniverseId, validatedPlayer.id, false, 'Application Unban', 'Application Unban');
                const responseColor = banState ? SUCCESS_COLOR : WARN_COLOR;
                const responseFields = [
                    { name: '👤 Username', value: `${validatedPlayer.name}`, inline: true },
                    { name: '🆔 User ID', value: `${validatedPlayer.id}`, inline: true },
                    { name: '🌐 Apply to Universe', value: 'No', inline: true },
                ];
                const responseEmbed = createFieldEmbed(`${banState ? '✔️ Unban Successful' : '❌ Unban Failed'}`, responseFields, responseColor, playerThumbnail);
                await interaction.editReply({ embeds: [ responseEmbed ] });

                if (banState) {
                    const member = await interaction.guild.members.fetch({
                        user: userAppeals.Data[0].interactionUser,
                        force: true
                    });
                    const unbannedEmbed = createEmbed('🔨 Application Status', `
                        Your ban application from **${interaction.guild.name}** has been **accepted**!
                        \n
                        \n🪪 Moderated User: ${userAppeals.Data[0].robloxUser}
                        \n🆔 Game Link: https://roblox.com/games/${userAppeals.Data[0].chosenServer}
                        `
                    )

                    await member.send({
                        embeds: [ unbannedEmbed ]
                    });

                    await appealSchema.findByIdAndDelete(interaction.message.id);
                }
            } catch (err) {
                console.error(`Unban API failed | ${err}`)
            }
        } else {
            const cancelEmbed = createEmbed('❌ Application Unban Cancelled', null, WARN_COLOR);
            await interaction.editReply({
                embeds: [ cancelEmbed ]
            })
        }
    },
};