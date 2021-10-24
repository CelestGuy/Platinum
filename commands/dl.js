const ytdl = require('ytdl-core');
const fs = require('fs');
const { search } = require('yt-getvideos');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { COOKIE } = require('../config.json');

module.exports.execute = async (bot, interaction) => {
    await interaction.reply({ content: 'Lecture de la vidéo...', ephemeral: true });

    async function downloadVideo(link) {

        var info, video, audio;

        info = await ytdl.getInfo(link, { requestOptions: { headers: { cookie: COOKIE } } });

        try {
            video = ytdl(link, {
                filter: info.videoDetails.isLiveContent ? null : "videoonly",
                quality: info.videoDetails.isLiveContent ? null : "highestvideo",
                format: "large",
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

        if (fs.readdirSync('./cache/downloaded/videos').includes(`${info.videoDetails.videoId}.mp4`)) {
            console.log("Le fichier existe déjà");
        }
        else {
            video.read();

            video.on('progress', (chunkLength, downloaded, total) => {
                const percent = downloaded / total;
                console.log(`Téléchargement vidéo de ${info.videoDetails.videoId}: ${(percent * 100).toFixed(1)}%`);
            });

            video.on('end', () => {
                console.log('Fin téléchargement de la vidéo');
                audio = ytdl(link, {
                    filter: info.videoDetails.isLiveContent ? null : "audioonly",
                    quality: info.videoDetails.isLiveContent ? null : "highestaudio",
                    format: "large",
                    dlChunkSize: 0,
                    liveBuffer: 1000,
                    isHLS: info.videoDetails.isLiveContent,
                    requestOptions: { headers: { cookie: COOKIE } }
                });

                audio.on('progress', (chunkLength, downloaded, total) => {
                    const percent = downloaded / total;
                    console.log(`Téléchargement audio de ${info.videoDetails.videoId}: ${(percent * 100).toFixed(1)}%`);
                });

                audio.on('end', () => {
                    console.log('Fin téléchargement de l\'audio');
                });

                audio.pipe(fs.createWriteStream(`./cache/downloaded/videos/${info.videoDetails.videoId}.mp3`));
            });

            video.pipe(fs.createWriteStream(`./cache/downloaded/videos/${info.videoDetails.videoId}.webm`));
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

        await interaction.editReply({ content: 'Téléchargement de la vidéo', embeds: [embedInfos] });

    }
    if (interaction.options.data[0].value.startsWith('https://www.youtube.com/watch?v=')) {
        downloadVideo(interaction.options.data[0].value);
    }
    else {
        await search(interaction.options.data[0].value).then(async result => {
            console.log(`https://www.youtube.com/watch?v=${result[0].id}`);
            await downloadVideo(`https://www.youtube.com/watch?v=${result[0].id}`);
        })
    }

};

module.exports.data = {
    name: 'dl'
}