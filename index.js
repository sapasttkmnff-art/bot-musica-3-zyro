const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { SoundCloudExtractor } = require('@discord-player/extractor');
const ffmpeg = require('ffmpeg-static');

// Esta línea es la que hace que Railway encuentre el audio
process.env.FFMPEG_PATH = ffmpeg;

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const player = new Player(client);

// Registro de errores para que veas qué pasa en la consola de Railway
player.events.on('error', (queue, error) => console.log(`❌ Error: ${error.message}`));
player.events.on('playerError', (queue, error) => console.log(`🚫 Audio: ${error.message}`));

async function init() {
    // Registramos el extractor de SoundCloud (el más estable)
    await player.extractors.register(SoundCloudExtractor, {});
    console.log('✅ Zyro: Listo en Railway. ¡A darle!');
}
init();

client.on('messageCreate', async (msg) => {
    if (msg.author.bot || !msg.content.startsWith('!play')) return;

    const query = msg.content.split(' ').slice(1).join(' ');
    const channel = msg.member.voice.channel;
    
    if (!channel) return msg.reply('¡Métete a un canal de voz primero!');

    try {
        const { track } = await player.play(channel, query, {
            nodeOptions: { 
                metadata: msg,
                bufferingTimeout: 15000 
            }
        });
        msg.reply(`🎶 Reproduciendo: **${track.title}**`);
    } catch (e) {
        console.log(e);
        msg.reply(`❌ No pude cargar esa. Intenta con un link de SoundCloud.`);
    }
});

client.login(process.env.TOKEN);
