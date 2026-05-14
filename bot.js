const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
 
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});
 
const TOKEN = process.env.TOKEN; // 🔑 Set this in Railway Variables
const FUTURE_BUYER_ROLE = '👀・ Future Buyer'; // Role name exactly as in Discord
const WELCOME_CHANNEL_ID = '1504473543516356658'; // 👋 Welcome channel
 
// ✅ RULES EMBED
function getRulesEmbed() {
  return new EmbedBuilder()
    .setTitle('📜 Vyre — Server Rules')
    .setColor(0x5865F2)
    .setDescription('Welcome to **Vyre**! Please read and follow the rules below to keep this server safe and professional.')
    .addFields(
      { name: '1️⃣  Be Respectful', value: 'Treat everyone with respect. No harassment, hate speech, or toxicity.' },
      { name: '2️⃣  No Scamming', value: 'Any attempt to scam buyers or sellers will result in an instant permanent ban.' },
      { name: '3️⃣  No Spam', value: 'Do not spam messages, emojis, or mentions in any channel.' },
      { name: '4️⃣  Use Correct Channels', value: 'Keep conversations in the right channels. Shop talk in shop channels, chat in general.' },
      { name: '5️⃣  No Advertising', value: 'Do not advertise other servers, shops, or services without staff permission.' },
      { name: '6️⃣  English Only', value: 'Please communicate in English in public channels so staff can moderate effectively.' },
      { name: '7️⃣  No Chargebacks', value: 'Initiating a chargeback after a completed deal will result in a permanent ban and report.' },
      { name: '8️⃣  Staff Word is Final', value: 'Respect all staff decisions. If you disagree, open a ticket — do not argue in public.' },
    )
    .setFooter({ text: 'Vyre • Breaking rules = ban. No exceptions.' })
    .setTimestamp();
}
 
// 🛒 HOW TO BUY EMBED
function getHowToBuyEmbed() {
  return new EmbedBuilder()
    .setTitle('🛒 How to Buy from Vyre')
    .setColor(0x57F287)
    .setDescription('Buying from **Vyre** is easy and secure. Follow the steps below:')
    .addFields(
      { name: 'Step 1 — Browse the Shop 🔍', value: 'Check out our shop channels:\n`#bedwars-shop` `#accounts` `#fflags-and-mses` `#other-games`' },
      { name: 'Step 2 — Open a Ticket 🎟️', value: 'Found something you want? Head to `#support` and open a ticket. Tell us what you want to buy.' },
      { name: 'Step 3 — Confirm the Deal ✅', value: 'A staff member will confirm availability, price, and delivery method with you in your private ticket.' },
      { name: 'Step 4 — Pay Securely 💳', value: 'We accept **PayPal F&F**, **Crypto**, and **Robux** (where applicable). Never pay outside of a ticket.' },
      { name: 'Step 5 — Receive Your Item 📦', value: 'Once payment is confirmed, your item will be delivered. Staff will log the order and verify delivery.' },
      { name: 'Step 6 — Leave a Vouch ⭐', value: 'Happy with your purchase? Drop a vouch in `#vouches` to help the community and earn the Vyre Buyer role!' },
    )
    .addFields(
      { name: '⚠️ Safety Tips', value: '> Never pay outside of a ticket\n> Never share your account password with anyone except for account purchases\n> If something feels off, ping a staff member immediately' }
    )
    .setFooter({ text: 'Vyre • Trusted. Professional. Legit.' })
    .setTimestamp();
}
 
// 👋 AUTO ROLE + WELCOME MESSAGE ON JOIN
client.on('guildMemberAdd', async (member) => {
  // Give Future Buyer role
  const role = member.guild.roles.cache.find(r => r.name === FUTURE_BUYER_ROLE);
  if (role) {
    await member.roles.add(role).catch(console.error);
    console.log(`✅ Gave Future Buyer role to ${member.user.tag}`);
  } else {
    console.log(`⚠️ Could not find role: ${FUTURE_BUYER_ROLE}`);
  }
 
  // Send welcome message
  const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!welcomeChannel) return;
 
  const welcomeEmbed = new EmbedBuilder()
    .setTitle('👋 Welcome to Vyre!')
    .setColor(0x5865F2)
    .setDescription(`Hey ${member}! Welcome to **Vyre** — the most trusted shop for game exclusives, Roblox items, Bedwars gear and more. 💎`)
    .addFields(
      { name: '📜 Rules', value: 'Read the rules in <#rules> before doing anything else.' },
      { name: '🛒 How to Buy', value: 'Check <#how-to-buy> to learn how to make a purchase safely.' },
      { name: '🎟️ Need Help?', value: 'Open a ticket in <#support> and a staff member will assist you.' },
      { name: '👀 Your Role', value: 'You have been given the **Future Buyer** role. Make a purchase to upgrade to **Vyre Buyer**!' },
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Vyre • Trusted. Professional. Legit.' })
    .setTimestamp();
 
  await welcomeChannel.send({ content: `Welcome to Vyre, ${member}! 🎉`, embeds: [welcomeEmbed] });
});
 
// 🚀 COMMAND HANDLER
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;
 
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
 
  const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);
  const isStaff = message.member?.roles.cache.some(r =>
    r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('owner')
  );
 
  const staffCommands = ['sendrules','sendhowtobuy','sendall','ban','kick','mute','unmute','warn','clear','lock','unlock'];
  if (!isAdmin && !isStaff && staffCommands.includes(command)) {
    return message.reply('❌ You do not have permission to use this command.')
      .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
  }
 
  // 📜 SEND RULES
  if (command === 'sendrules') {
    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [getRulesEmbed()] });
  }
 
  // 🛒 SEND HOW TO BUY
  if (command === 'sendhowtobuy') {
    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [getHowToBuyEmbed()] });
  }
 
  // 📦 SEND ALL
  if (command === 'sendall') {
    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [getRulesEmbed()] });
    await message.channel.send({ embeds: [getHowToBuyEmbed()] });
  }
 
  // 🔨 BAN
  if (command === 'ban') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to ban.');
    if (!target.bannable) return message.reply('❌ I cannot ban this user.');
    await target.ban({ reason });
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🔨 User Banned')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Banned by', value: message.author.tag, inline: true }
      )
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  }
 
  // 👢 KICK
  if (command === 'kick') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to kick.');
    if (!target.kickable) return message.reply('❌ I cannot kick this user.');
    await target.kick(reason);
    const embed = new EmbedBuilder()
      .setColor(0xFF6600)
      .setTitle('👢 User Kicked')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Kicked by', value: message.author.tag, inline: true }
      )
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  }
 
  // 🔇 MUTE (timeout for 10 minutes)
  if (command === 'mute') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to mute.');
    await target.timeout(10 * 60 * 1000, reason);
    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle('🔇 User Muted (10 mins)')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Muted by', value: message.author.tag, inline: true }
      )
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  }
 
  // 🔊 UNMUTE
  if (command === 'unmute') {
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Please mention a user to unmute.');
    await target.timeout(null);
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🔊 User Unmuted')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Unmuted by', value: message.author.tag, inline: true }
      )
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  }
 
  // ⚠️ WARN
  if (command === 'warn') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to warn.');
    const embed = new EmbedBuilder()
      .setColor(0xFFFF00)
      .setTitle('⚠️ User Warned')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Warned by', value: message.author.tag, inline: true }
      )
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
    await target.send(`⚠️ You have been warned in **Vyre** for: ${reason}`).catch(() => {});
  }
 
  // 🧹 CLEAR
  if (command === 'clear') {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply('❌ Please provide a number between 1 and 100.');
    await message.delete().catch(() => {});
    const deleted = await message.channel.bulkDelete(amount, true).catch(() => {});
    const reply = await message.channel.send(`🧹 Deleted **${deleted?.size || amount}** messages.`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  }
 
  // 🔒 LOCK
  if (command === 'lock') {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🔒 Channel Locked')
      .setDescription(`${message.channel} has been locked by ${message.author.tag}`)
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  }
 
  // 🔓 UNLOCK
  if (command === 'unlock') {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🔓 Channel Unlocked')
      .setDescription(`${message.channel} has been unlocked by ${message.author.tag}`)
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  }
 
});
 
client.once('ready', () => {
  console.log(`✅ Vyre Bot is online as ${client.user.tag}`);
  client.user.setActivity('Vyre Shop 🛒', { type: 3 });
});
 
client.login(TOKEN);
