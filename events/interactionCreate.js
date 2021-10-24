module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(bot, interaction) {
		if (!interaction.isCommand()) return;

		let command = bot.commands.get(interaction.commandName);

		if (!command && !interaction.commandName == "test") return;

		try {
			if (interaction.commandName == "test") {
				bot.commands.get('play').execute(bot, interaction);
			}
			else {
				await command.execute(bot, interaction);
			}
		} catch (e) {
			return console.error(e);
		}
	}
};