const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { SoundCloudExtractor } = require('@discord-player/extractor');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const player = new Player(client);

async function init() {
    await player.extractors.register(SoundCloudExtractor, {});
    console.log('✅ Zyro activo en Railway');
}
init();

client.on('messageCreate', async (msg) => {
    if (msg.content.startsWith('!play')) {
        const query = msg.content.split(' ').slice(1).join(' ');
        const channel = msg.member.voice.channel;
        if (!channel) return msg.reply('Entra al canal de voz');
        await player.play(channel, query, { nodeOptions: { metadata: msg } });
        msg.reply(`🎶 Buscando: ${query}`);
    }
});

client.login(process.env.TOKEN);
