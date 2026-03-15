require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { SoundCloudExtractor, SpotifyExtractor } = require('@discord-player/extractor');
const ffmpeg = require('ffmpeg-static');

// Configuramos la ruta de audio para Railway
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
        highWaterMark: 1 << 25 // Buffer de 33MB para evitar cortes
    }
});

// Manejo de errores para que el bot no se caiga
player.events.on('error', (queue, error) => console.log(`⚠️ Error de red: ${error.message}`));
player.events.on('playerError', (queue, error) => {
    console.log(`🚫 Audio Error: ${error.message}`);
});

// Inicialización de motores 2026
async function boot() {
    // Usamos Youtubei con cliente de iOS para saltar el bloqueo de IP
    await player.extractors.register(YoutubeiExtractor, {
        streamOptions: { useClient: "IOS" } 
    });
    await player.extractors.register(SoundCloudExtractor, {});
    await player.extractors.register(SpotifyExtractor, {});
    
    console.log('🚀 Zyro: Motores 2026 cargados. ¡Listo para sonar!');
}

boot();

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!play')) return;

    const args = message.content.slice(6).trim(); // Captura lo que va después de !play
    if (!args) return message.reply('❌ Dime qué quieres escuchar.');

    const channel = message.member.voice.channel;
    if (!channel) return message.reply('❌ ¡Entra a un canal de voz!');

    const msg = await message.reply(`🔍 Buscando **${args}**...`);

    try {
        const { track } = await player.play(channel, args, {
            nodeOptions: {
                metadata: message,
                bufferingTimeout: 15000, // 15 segundos para cargar el audio
                connectionTimeout: 30000, // 30 segundos para conectar al canal
                leaveOnEnd: false,
                selfDeaf: true,
                volume: 80
            }
        });

        msg.edit(`🎶 Reproduciendo: **${track.title}**`);
    } catch (e) {
        console.error(e);
        msg.edit(`❌ Error: ${e.message}. Intenta con un link directo de SoundCloud si YouTube falla.`);
    }
});

client.login(process.env.TOKEN);
