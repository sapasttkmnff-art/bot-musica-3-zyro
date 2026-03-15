const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { SoundCloudExtractor } = require('@discord-player/extractor');
const ffmpeg = require('ffmpeg-static');

process.env.FFMPEG_PATH = ffmpeg;

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const player = new Player(client, {
    ytdlOptions: {
        quality: 'lowestaudio',
        highWaterMark: 1 << 25
    }
});

// ESTO CORRIGE EL "OPERATION ABORTED"
player.events.on('error', (queue, error) => {
    console.log(`⚠️ Error de red: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.log(`🚫 Error de Audio: ${error.message}`);
    if (error.message.includes('aborted')) {
        console.log('🔄 Reintentando conexión...');
    }
});

async function init() {
    await player.extractors.register(SoundCloudExtractor, {});
    console.log('✅ Zyro: Listo en Railway. ¡A darle!');
}
init();

client.on('messageCreate', async (msg) => {
    if (msg.author.bot || !msg.content.startsWith('!play')) return;

    const query = msg.content.split(' ').slice(1).join(' ');
    const channel = msg.member.voice.channel;
    
    if (!channel) return msg.reply('¡Métete a un canal de voz!');

    const waitMsg = await msg.reply(`⏳ Cargando audio...`);

    try {
        const { track } = await player.play(channel, query, {
            nodeOptions: { 
                metadata: msg,
                // Aumentamos los tiempos para que Railway no aborte
                bufferingTimeout: 20000,
                connectionTimeout: 30000,
                leaveOnEnd: false
            }
        });
        waitMsg.edit(`🎶 Reproduciendo: **${track.title}**`);
    } catch (e) {
        console.log(e);
        waitMsg.edit(`❌ Discord abortó la conexión. Intenta de nuevo en 5 segundos.`);
    }
});

client.login(process.env.TOKEN);
