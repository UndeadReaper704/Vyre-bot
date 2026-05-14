const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');
 
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
});
 
const TOKEN = process.env.TOKEN;
const FUTURE_BUYER_ROLE = '👀・ Future Buyer';
const WELCOME_CHANNEL_ID = '1504473543516356658';
 
// ─── TICKET CONFIG ────────────────────────────────────────────────────────────
const TICKET_CONFIG = {
  STAFF_ROLE_ID: '1504106305768525914',         // ← Replace with your staff role ID
  TICKET_CATEGORY_ID: '1504104874835579000', // ← Replace with your ticket category ID
  LOG_CHANNEL_ID: '1504105748681064521',       // ← Replace with your log channel ID
  TRANSCRIPT_DM: true,
 
  CATEGORIES: {
    order: {
      label: '🛒 Order Support',
      description: 'Issues with a purchase or delivery',
      color: 0x57f287,
      prefix: 'order',
    },
    general: {
      label: '💬 General Support',
      description: 'Any other question or issue',
      color: 0x5865f2,
      prefix: 'general',
    },
    report: {
      label: '🚨 Report a User',
      description: 'Report a rule-breaking member',
      color: 0xed4245,
      prefix: 'report',
    },
  },
};
 
let ticketCounter = 0;
const openTickets = new Map(); // channelId -> ticket data
 
// ─── EMBEDS ───────────────────────────────────────────────────────────────────
function getRulesEmbed() {
  return new EmbedBuilder()
    .setTitle('📜 Vyre — Server Rules')
    .setColor(0x5865f2)
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
 
function getHowToBuyEmbed() {
  return new EmbedBuilder()
    .setTitle('🛒 How to Buy from Vyre')
    .setColor(0x57f287)
    .setDescription('Buying from **Vyre** is easy and secure. Follow the steps below:')
    .addFields(
      { name: 'Step 1 — Browse the Shop 🔍', value: 'Check out our shop channels:\n`#bedwars-shop` `#accounts` `#fflags-and-mses` `#other-games`' },
      { name: 'Step 2 — Open a Ticket 🎟️', value: 'Found something you want? Head to `#support` and open a ticket. Tell us what you want to buy.' },
      { name: 'Step 3 — Confirm the Deal ✅', value: 'A staff member will confirm availability, price, and delivery method with you in your private ticket.' },
      { name: 'Step 4 — Pay Securely 💳', value: 'We accept **PayPal F&F**, **Crypto**, and **Robux** (where applicable). Never pay outside of a ticket.' },
      { name: 'Step 5 — Receive Your Item 📦', value: 'Once payment is confirmed, your item will be delivered. Staff will log the order and verify delivery.' },
      { name: 'Step 6 — Leave a Vouch ⭐', value: 'Happy with your purchase? Drop a vouch in `#vouches` to help the community and earn the Vyre Buyer role!' },
      { name: '⚠️ Safety Tips', value: '> Never pay outside of a ticket\n> Never share your account password with anyone except for account purchases\n> If something feels off, ping a staff member immediately' },
    )
    .setFooter({ text: 'Vyre • Trusted. Professional. Legit.' })
    .setTimestamp();
}
 
// ─── WELCOME ──────────────────────────────────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
  const role = member.guild.roles.cache.find(r => r.name === FUTURE_BUYER_ROLE);
  if (role) {
    await member.roles.add(role).catch(console.error);
    console.log(`✅ Gave Future Buyer role to ${member.user.tag}`);
  } else {
    console.log(`⚠️ Could not find role: ${FUTURE_BUYER_ROLE}`);
  }
 
  const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!welcomeChannel) return;
 
  const welcomeEmbed = new EmbedBuilder()
    .setTitle('👋 Welcome to Vyre!')
    .setColor(0x5865f2)
    .setDescription(`Hey ${member}! Welcome to **Vyre** — the most trusted shop for game exclusives, Roblox items, Bedwars gear and more. 💎`)
    .addFields(
      { name: '📜 Rules', value: 'Read the rules in <#1503384039862833366> before doing anything else.' },
      { name: '🛒 How to Buy', value: 'Check <#1504102270755803238> to learn how to make a purchase safely.' },
      { name: '🎟️ Need Help?', value: 'Open a ticket in <#1504104874835579000> and a staff member will assist you.' },
      { name: '👀 Your Role', value: 'You have been given the **Future Buyer** role. Make a purchase to upgrade to **Vyre Buyer**!' },
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Vyre • Trusted. Professional. Legit.' })
    .setTimestamp();
 
  await welcomeChannel.send({ content: `Welcome to Vyre, ${member}! 🎉`, embeds: [welcomeEmbed] });
});
 
// ─── TICKET HELPERS ───────────────────────────────────────────────────────────
function escHtml(str = '') {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
 
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}
 
function generateTranscript(ticket, messages) {
  const rows = messages.map((msg) => {
    const time = new Date(msg.createdTimestamp).toLocaleString();
    const attachments = msg.attachments.map(a => `<a href="${a.url}">[attachment]</a>`).join(' ');
    return `
    <div class="msg">
      <img class="avatar" src="${msg.author.displayAvatarURL({ size: 32 })}" onerror="this.style.display='none'"/>
      <div class="body">
        <span class="author" style="color:${msg.member?.displayHexColor || '#fff'}">${escHtml(msg.author.tag)}</span>
        <span class="time">${time}</span>
        <div class="content">${escHtml(msg.content)} ${attachments}</div>
      </div>
    </div>`;
  }).join('');
 
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Transcript — ${escHtml(ticket.categoryLabel)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#313338;color:#dbdee1;font-family:'gg sans','Noto Sans',sans-serif;padding:24px}
  h1{font-size:1.2rem;color:#fff;margin-bottom:4px}
  .meta{font-size:.8rem;color:#949ba4;margin-bottom:20px}
  .msg{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid #3f4147}
  .avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0}
  .author{font-weight:700;margin-right:8px}
  .time{font-size:.75rem;color:#949ba4}
  .content{margin-top:4px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
  a{color:#00a8fc}
</style>
</head>
<body>
<h1>🎮 Vyre — ${escHtml(ticket.categoryLabel)}</h1>
<p class="meta">
  Opened by ${escHtml(ticket.openerTag)} &nbsp;|&nbsp;
  Claimed by ${ticket.claimedByTag ? escHtml(ticket.claimedByTag) : 'Unclaimed'} &nbsp;|&nbsp;
  ${messages.length} messages
</p>
${rows}
</body></html>`;
}
 
// ─── COMMAND HANDLER ──────────────────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;
 
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
 
  const isAdmin = message.member?.permissions.has(PermissionFlagsBits.Administrator);
  const isStaff = message.member?.roles.cache.some(r =>
    r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('owner')
  );
 
  const staffCommands = ['sendrules', 'sendhowtobuy', 'sendall', 'ban', 'kick', 'mute', 'unmute', 'warn', 'clear', 'lock', 'unlock', 'ticketpanel'];
  if (!isAdmin && !isStaff && staffCommands.includes(command)) {
    return message.reply('❌ You do not have permission to use this command.')
      .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
  }
 
  if (command === 'sendrules') {
    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [getRulesEmbed()] });
  }
 
  if (command === 'sendhowtobuy') {
    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [getHowToBuyEmbed()] });
  }
 
  if (command === 'sendall') {
    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [getRulesEmbed()] });
    await message.channel.send({ embeds: [getHowToBuyEmbed()] });
  }
 
  // 🎟️ TICKET PANEL
  if (command === 'ticketpanel') {
    await message.delete().catch(() => {});
 
    const embed = new EmbedBuilder()
      .setTitle('🎮 Vyre Support')
      .setDescription(
        'Need help? Select a category below to open a ticket.\n\n' +
        '🛒 **Order Support** — Purchase issues, missing items\n' +
        '💬 **General Support** — Questions, feedback, other\n' +
        '🚨 **Report a User** — Report rule violations'
      )
      .setColor(0x2b2d31)
      .setFooter({ text: 'Vyre Gaming Shop • One ticket per category' })
      .setThumbnail(message.guild.iconURL({ dynamic: true }));
 
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_open')
      .setPlaceholder('Choose a category…')
      .addOptions(
        Object.entries(TICKET_CONFIG.CATEGORIES).map(([value, cat]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.label)
            .setDescription(cat.description)
            .setValue(value)
        )
      );
 
    await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
  }
 
  if (command === 'ban') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to ban.');
    if (!target.bannable) return message.reply('❌ I cannot ban this user.');
    await target.ban({ reason });
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('🔨 User Banned').addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Reason', value: reason, inline: true }, { name: 'Banned by', value: message.author.tag, inline: true }).setTimestamp()] });
  }
 
  if (command === 'kick') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to kick.');
    if (!target.kickable) return message.reply('❌ I cannot kick this user.');
    await target.kick(reason);
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0xff6600).setTitle('👢 User Kicked').addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Reason', value: reason, inline: true }, { name: 'Kicked by', value: message.author.tag, inline: true }).setTimestamp()] });
  }
 
  if (command === 'mute') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to mute.');
    await target.timeout(10 * 60 * 1000, reason);
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0xffa500).setTitle('🔇 User Muted (10 mins)').addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Reason', value: reason, inline: true }, { name: 'Muted by', value: message.author.tag, inline: true }).setTimestamp()] });
  }
 
  if (command === 'unmute') {
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Please mention a user to unmute.');
    await target.timeout(null);
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('🔊 User Unmuted').addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Unmuted by', value: message.author.tag, inline: true }).setTimestamp()] });
  }
 
  if (command === 'warn') {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('❌ Please mention a user to warn.');
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0xffff00).setTitle('⚠️ User Warned').addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Reason', value: reason, inline: true }, { name: 'Warned by', value: message.author.tag, inline: true }).setTimestamp()] });
    await target.send(`⚠️ You have been warned in **Vyre** for: ${reason}`).catch(() => {});
  }
 
  if (command === 'clear') {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply('❌ Please provide a number between 1 and 100.');
    await message.delete().catch(() => {});
    const deleted = await message.channel.bulkDelete(amount, true).catch(() => {});
    const reply = await message.channel.send(`🧹 Deleted **${deleted?.size || amount}** messages.`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  }
 
  if (command === 'lock') {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('🔒 Channel Locked').setDescription(`${message.channel} has been locked by ${message.author.tag}`).setTimestamp()] });
  }
 
  if (command === 'unlock') {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('🔓 Channel Unlocked').setDescription(`${message.channel} has been unlocked by ${message.author.tag}`).setTimestamp()] });
  }
});
 
// ─── INTERACTION HANDLER (tickets) ────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
 
  // Open ticket via select menu
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_open') {
    const categoryKey = interaction.values[0];
    const cat = TICKET_CONFIG.CATEGORIES[categoryKey];
    if (!cat) return;
 
    await interaction.deferReply({ ephemeral: true });
 
    const { guild, member } = interaction;
 
    const existing = [...openTickets.entries()].find(
      ([, t]) => t.opener === member.id && t.category === categoryKey
    );
    if (existing) {
      return interaction.editReply({ content: `❌ You already have an open **${cat.label}** ticket: <#${existing[0]}>` });
    }
 
    ticketCounter++;
    const channelName = `${cat.prefix}-${String(ticketCounter).padStart(4, '0')}`;
 
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: TICKET_CONFIG.TICKET_CATEGORY_ID,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
        { id: TICKET_CONFIG.STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.AttachFiles] },
      ],
      topic: `${cat.label} | Opened by ${member.user.tag} | Ticket #${ticketCounter}`,
    });
 
    openTickets.set(channel.id, {
      opener: member.id,
      openerTag: member.user.tag,
      category: categoryKey,
      categoryLabel: cat.label,
      claimedBy: null,
      claimedByTag: null,
      openedAt: Date.now(),
    });
 
    const ticketEmbed = new EmbedBuilder()
      .setTitle(`${cat.label} — Ticket #${ticketCounter}`)
      .setDescription(`Hey ${member}, welcome to your support ticket!\n\nPlease describe your issue in as much detail as possible.\nA staff member will assist you shortly.`)
      .setColor(cat.color)
      .addFields(
        { name: 'Opened by', value: `${member}`, inline: true },
        { name: 'Category', value: cat.label, inline: true },
        { name: 'Status', value: '🟢 Open — unclaimed', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'Vyre Gaming Shop' });
 
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim_${channel.id}`).setLabel('Claim Ticket').setStyle(ButtonStyle.Primary).setEmoji('🙋'),
      new ButtonBuilder().setCustomId(`ticket_close_${channel.id}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
    );
 
    await channel.send({ content: `${member} | <@&${TICKET_CONFIG.STAFF_ROLE_ID}>`, embeds: [ticketEmbed], components: [row] });
    await interaction.editReply({ content: `✅ Your ticket has been opened: ${channel}` });
  }
 
  // Claim ticket
  if (interaction.isButton() && interaction.customId.startsWith('ticket_claim_')) {
    const channelId = interaction.customId.replace('ticket_claim_', '');
    const ticket = openTickets.get(channelId);
    if (!ticket) return interaction.reply({ content: 'Ticket not found.', ephemeral: true });
 
    if (!interaction.member.roles.cache.has(TICKET_CONFIG.STAFF_ROLE_ID)) {
      return interaction.reply({ content: '❌ Only staff can claim tickets.', ephemeral: true });
    }
    if (ticket.claimedBy) {
      return interaction.reply({ content: `❌ Already claimed by <@${ticket.claimedBy}>.`, ephemeral: true });
    }
 
    ticket.claimedBy = interaction.user.id;
    ticket.claimedByTag = interaction.user.tag;
 
    await interaction.message.edit({
      embeds: [EmbedBuilder.from(interaction.message.embeds[0]).spliceFields(2, 1, { name: 'Status', value: `🟡 Claimed by ${interaction.user}`, inline: true })],
    });
 
    await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`🙋 **${interaction.user.tag}** has claimed this ticket and will assist you.`).setColor(0xfee75c)] });
  }
 
  // Close ticket
  if (interaction.isButton() && interaction.customId.startsWith('ticket_close_')) {
    const channelId = interaction.customId.replace('ticket_close_', '');
    const ticket = openTickets.get(channelId);
    if (!ticket) return interaction.reply({ content: 'Ticket not found.', ephemeral: true });
 
    const isStaff = interaction.member.roles.cache.has(TICKET_CONFIG.STAFF_ROLE_ID);
    const isOpener = interaction.user.id === ticket.opener;
    if (!isStaff && !isOpener) return interaction.reply({ content: "❌ You can't close this ticket.", ephemeral: true });
 
    await interaction.deferReply();
 
    const channel = interaction.channel;
    const guild = interaction.guild;
 
    const fetched = await channel.messages.fetch({ limit: 100 });
    const sorted = [...fetched.values()].reverse();
    const transcript = generateTranscript(ticket, sorted);
    const transcriptBuffer = Buffer.from(transcript, 'utf-8');
 
    const logChannel = guild.channels.cache.get(TICKET_CONFIG.LOG_CHANNEL_ID);
    const logEmbed = new EmbedBuilder()
      .setTitle(`📋 Ticket Closed — ${channel.name}`)
      .addFields(
        { name: 'Opened by', value: `<@${ticket.opener}> (${ticket.openerTag})`, inline: true },
        { name: 'Category', value: ticket.categoryLabel, inline: true },
        { name: 'Claimed by', value: ticket.claimedBy ? `<@${ticket.claimedBy}> (${ticket.claimedByTag})` : 'Unclaimed', inline: true },
        { name: 'Closed by', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
        { name: 'Duration', value: formatDuration(Date.now() - ticket.openedAt), inline: true },
      )
      .setColor(0xed4245)
      .setTimestamp();
 
    if (logChannel) {
      await logChannel.send({ embeds: [logEmbed], files: [{ attachment: transcriptBuffer, name: `${channel.name}-transcript.html` }] });
    }
 
    if (TICKET_CONFIG.TRANSCRIPT_DM) {
      try {
        const opener = await guild.members.fetch(ticket.opener);
        await opener.send({ content: `📋 Your ticket **${channel.name}** has been closed. Here's your transcript:`, files: [{ attachment: transcriptBuffer, name: `${channel.name}-transcript.html` }] });
      } catch { /* DMs disabled */ }
    }
 
    openTickets.delete(channelId);
    await interaction.editReply({ content: '🔒 Ticket closed. Deleting in 5 seconds…' });
    setTimeout(() => channel.delete().catch(() => {}), 5000);
  }
});
 
// ─── READY ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ Vyre Bot is online as ${client.user.tag}`);
  client.user.setActivity('Vyre Shop 🛒', { type: 3 });
});
 
client.login(TOKEN);
