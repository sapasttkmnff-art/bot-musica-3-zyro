require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { SoundCloudExtractor, SpotifyExtractor } = require('@discord-player/extractor');

const client = new Client({ 
    intents: [3276799] 
});

const player = new Player(client);

// CONFIGURACIÓN DEL NODO EXTERNO (El "Cerebro")
async function boot() {
    await player.extractors.loadDefault();
    
    // Aquí registramos el nodo externo para que Railway no tenga que procesar nada
    // Este es un nodo público; si falla, solo hay que cambiar la host
    await player.nodes.create({
        host: 'lavalink.lexis.host', // Nodo público activo 2026
        port: 443,
        password: 'lexishostlavalink',
        secure: true
    });

    console.log('🚀 Zyro: Conectado al cerebro externo (Lavalink).');
}
boot();

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!play')) return;

    const query = message.content.slice(6).trim();
    const channel = message.member.voice.channel;
    
    if (!channel) return message.reply('¡Entra a un canal de voz!');

    const msg = await message.reply(`📡 Pidiendo audio al servidor externo...`);

    try {
        const { track } = await player.play(channel, query, {
            nodeOptions: {
                metadata: message,
                leaveOnEnd: false,
            }
        });
        msg.edit(`🎶 ¡Sonando!: **${track.title}**`);
    } catch (e) {
        console.error(e);
        msg.edit(`❌ El servidor externo no respondió. Intenta de nuevo.`);
    }
});

client.login(process.env.TOKEN);

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
