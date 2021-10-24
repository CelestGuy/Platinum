module.exports.execute = async (bot, message) => {
    let ping = 0
    const debut = Date.now();

    if (message.commandName) {
        await message.reply(`Pong`).then(async () =>
            await message.editReply(`Pong: ${ping = Date.now() - debut} ms`)
        );
    }
    else {
        message.channel.send('Pong').then(async (m) => await m.edit(`Pong: ${ping = Date.now() - debut} ms`));
    }
};

module.exports.data = {
    name: 'ping'
}