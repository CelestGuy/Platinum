const ytdl = require('ytdl-core');
const fs = require('fs');
const { search } = require('yt-getvideos');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { COOKIE } = require('../config.json');

module.exports.execute = async (bot, interaction) => {
    await interaction.reply({ content: 'Lecture de la vidéo...', ephemeral: true });

    async function playAudio(link) {

        const player = createAudioPlayer();
        var info, video;

        info = await ytdl.getInfo(link, { requestOptions: { headers: { cookie: COOKIE } } });

        try {
            video = ytdl(link, {
                filter: info.videoDetails.isLiveContent ? null : "audioonly",
                quality: info.videoDetails.isLiveContent ? null : "highestaudio",
                dlChunkSize: 0,
                liveBuffer: 1000,
                isHLS: info.videoDetails.isLiveContent,
                requestOptions: { headers: { cookie: COOKIE } }
            });
        }

        catch (error) {
            console.log(error);
            return await interaction.editReply('La vidéo n\'a pas pu être lue/trouvée');
        }

        if (fs.readdirSync('./cache/downloaded/songs').includes(`${info.videoDetails.videoId}.mp3`)) {
            console.log("Le fichier existe déjà");
        }
        else {
            video.on('progress', (chunkLength, downloaded, total) => {
                const percent = downloaded / total;
                console.log(`Téléchargement de ${info.videoDetails.videoId}: ${(percent * 100).toFixed(1)}%`);
            });

            video.on('end', () => {
                console.log('Fin de la vidéo');
            });

            video.pipe(fs.createWriteStream(`./cache/downloaded/songs/${info.videoDetails.videoId}.mp3`));
        }

        const embedInfos = new MessageEmbed()
            .setColor("#950000")
            .setAuthor(`${info.videoDetails.author.name}`, `${info.videoDetails.author.thumbnails[0].url}`, `${info.videoDetails.author.channel_url}`)
            .setTitle(`${info.videoDetails.title}`)
            .setURL(`${info.videoDetails.video_url}`)
            .setThumbnail(`${info.videoDetails.thumbnails[0].url}`)
            .setDescription(`${info.videoDetails.description.length > 10 ? info.videoDetails.description.substr(0, 350) + '\n**...**\n' : info.videoDetails.description}`)
            .addFields(
                { name: 'Vues', value: `${info.videoDetails.viewCount}` },
                { name: 'Likes', value: `${info.videoDetails.likes}`, inline: true },
                { name: 'Dislikes', value: `${info.videoDetails.dislikes}`, inline: true },
                { name: 'Family friendly ?', value: `${info.videoDetails.isFamilySafe == true ? 'Oui c\'est bon' : 'Non, regarde ça tout seul dans ta couette stp'}`, inline: true }
            )
            .setTimestamp()
            .setFooter(`demandé par ${interaction.user.tag}`, `${interaction.user.defaultAvatarURL} `)

        let connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.member.voice.channel.guild.id,
            adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
        });

        const resource = createAudioResource(video);

        player.play(resource);
        connection.subscribe(player);
        /*const default_buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('primary')
                    .setLabel('Primary')
                    .setStyle('PRIMARY'),
            );*/
        await interaction.editReply({ content: 'Lecture en cours', embeds: [embedInfos]/*, components: [default_buttons] */ });

    }

    if (interaction.member.voice.channel) {

        if (interaction.commandName == "test") {
            playAudio("https://www.youtube.com/watch?v=EtoMCsg-Rrw");
        }
        else if (interaction.options.data[0].value.startsWith('https://www.youtube.com/watch?v=')) {
            playAudio(interaction.options.data[0].value);
        }
        else {
            await search(interaction.options.data[0].value).then(async result => {
                console.log(`https://www.youtube.com/watch?v=${result[0].id}`);
                await playAudio(`https://www.youtube.com/watch?v=${result[0].id}`);
            })
        }
    }
    else {
        await interaction.reply('Veux-tu bien te connecter à un vocal Discord pour que je puisse m\'y connecter aussi stp ?!');
    }

};

module.exports.data = {
    name: 'play'
}