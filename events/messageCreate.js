module.exports = {
	name: 'messageCreate',
	once: false,
	execute(bot, message) {
		const { prefix } = require("../config.json")
		let args = message.content.slice(`${prefix}`.length).trim().split(/ +/g);

		let cmd = bot.commands.get(args[0]);

		if (cmd) {
			cmd.execute(bot, message);
		}
	},
};