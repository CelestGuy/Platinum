const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildIds, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('play').setDescription('Jouer de la musique via YouTube')
		.addStringOption(option =>
			option.setName('arg')
				.setDescription('Lien ou titre d\'une vidéo')
				.setRequired(true)),
	new SlashCommandBuilder().setName('dl').setDescription('Télécharger une vidéo YouTube')
		.addStringOption(option =>
			option.setName('arg')
				.setDescription('Lien ou titre d\'une vidéo')
				.setRequired(true)),
	new SlashCommandBuilder().setName('ping').setDescription('Verif ping du bot'),
	new SlashCommandBuilder().setName('test').setDescription('Joue "Let\'s Go Skying" pour tester le bot')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

for (const guild of guildIds) {
	rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
}