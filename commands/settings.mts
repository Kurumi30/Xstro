import { registerCommand } from './_registers.mts';
import { editConfig, getConfig } from '../databases/index.mts';

registerCommand({
  name: 'setprefix',
  fromMe: true,
  desc: 'Configure a custom prefix',
  type: 'settings',
  function: async (message, match?: string) => {
    if (!match) {
      return message.send(`Usage: ${message.prefix}setprefix .,/*`);
    }
    await editConfig({ prefix: Array.from(match) });
    return message.send('Prefix Updated');
  },
});

registerCommand({
  name: 'setmode',
  fromMe: true,
  desc: 'Configure the bot to be public or private',
  type: 'settings',
  function: async (message, match) => {
    if (!match) {
      return message.send(`Usage: ${message.prefix}setmode private | public`);
    }
    if (match.includes('private')) {
      await editConfig({ mode: true });
      return message.send('Bot is now private.');
    } else if (match.includes('public')) {
      await editConfig({ mode: false });
      return message.send('Bot is now public.');
    }
    return message.send(`Usage: ${message.prefix}setmode private | public`);
  },
});

registerCommand({
  name: 'setsudo',
  fromMe: true,
  desc: 'Sudo a number',
  type: 'settings',
  function: async (message, match) => {
    const jid = message.user(match);
    if (!jid) return message.send('tag, reply or provide the user number');
    const config = await getConfig();
    if (config.sudo.includes(jid)) return message.send('Already a sudo');

    const updatedSudos = [...config.sudo, jid];
    editConfig({ sudo: updatedSudos });

    return message.send(`@${jid.split('@')[0]} is now sudo`, { mentions: [jid] });
  },
});

registerCommand({
  name: 'delsudo',
  fromMe: true,
  desc: 'Remove sudo from a number',
  type: 'settings',
  function: async (message, match) => {
    const jid = message.user(match);
    if (!jid) return message.send('tag, reply or provide the user number');
    const config = await getConfig();
    if (!config.sudo.includes(jid)) return message.send('User is not a sudo');

    const updatedSudos = config.sudo.filter((sudo) => sudo !== jid);
    editConfig({ sudo: updatedSudos });

    return message.send(`@${jid.split('@')[0]} is no longer sudo`, { mentions: [jid] });
  },
});

registerCommand({
  name: 'getsudo',
  fromMe: true,
  desc: 'List all sudo users',
  type: 'settings',
  function: async (message) => {
    const config = await getConfig();
    if (!config.sudo || config.sudo.length === 0) {
      return message.send('No sudo users found');
    }
    const sudoList = config.sudo.map((jid) => `@${jid.split('@')[0]}`).join('\n');
    return message.send(`Sudo users:\n${sudoList}`, { mentions: config.sudo });
  },
});

registerCommand({
  name: 'ban',
  fromMe: true,
  desc: 'Ban a user from using commands',
  type: 'settings',
  function: async (message, match) => {
    const jid = message.user(match);
    if (!jid) return message.send('tag, reply or provide a number');
    const db = await getConfig();
    if (db.sudo.includes(jid) || jid === message.owner)
      return message.send('You cannot ban a sudo user.');
    if (db.banned.includes(jid)) return message.send('Already banned from using bot.');
    const users = new Set([...db.banned, jid]);
    await editConfig({ banned: Array.from(users) });
    return message.send(
      `@${jid.split('@')[0]} has been banned from using bot commands, indefinetly`,
      {
        mentions: [jid],
      },
    );
  },
});

registerCommand({
  name: 'unban',
  fromMe: true,
  desc: 'Unban a user from using commands',
  type: 'settings',
  function: async (message, match) => {
    const jid = message.user(match);
    if (!jid) return message.send('tag, reply or provide a number');
    const db = await getConfig();
    if (!db.banned.includes(jid)) return message.send('User is not banned');

    const updatedBanned = db.banned.filter((bannedJid) => bannedJid !== jid);
    editConfig({ banned: updatedBanned });

    return message.send(`@${jid.split('@')[0]} has been unbanned and can now use bot commands`, {
      mentions: [jid],
    });
  },
});

registerCommand({
  name: 'getban',
  fromMe: true,
  desc: 'List all banned users',
  type: 'settings',
  function: async (message) => {
    const db = await getConfig();
    if (!db.banned || db.banned.length === 0) {
      return message.send('No banned users found');
    }

    const banList = db.banned.map((jid) => `@${jid.split('@')[0]}`).join('\n');
    return message.send(`Banned users:\n${banList}`, { mentions: db.banned });
  },
});

registerCommand({
  name: 'enablegc',
  fromMe: true,
  desc: 'Enable bot to run in Group Chat',
  type: 'settings',
  function: async (message) => {
    if (!(await getConfig()).disablegc)
      return message.send(`_Bot is already enabled for group chats_`);
    await editConfig({ disablegc: false });
    return message.send(`_Bot is now enabled for Group Chats._`);
  },
});

registerCommand({
  name: 'disablegc',
  fromMe: true,
  desc: 'Disable bot from running in Group Chat',
  type: 'settings',
  function: async (message) => {
    if ((await getConfig()).disablegc)
      return message.send(`_Already disabled bot for group chats_`);
    await editConfig({ disablegc: true });
    return message.send(`_Bot is now disabled for Group Chats_`);
  },
});

registerCommand({
  name: 'savestatus',
  fromMe: true,
  desc: 'Settings to automatically save status updates',
  type: 'settings',
  function: async (message, match: 'on' | 'off') => {
    if (!match || (match?.toLowerCase()?.trim() !== 'on' && match?.toLowerCase()?.trim() !== 'off'))
      return message.send(`_Usage: ${message.prefix[0]}autosavestatus on | off._`);
    const db = (await getConfig()).savebroadcast;
    if (match === 'on' && db) return message.send('_Autosave Status is Already on._');
    if (match === 'off' && !db) return message.send('_Autosave Status is Already off._');
    await editConfig({ savebroadcast: match === 'on' ? true : match === 'off' ? false : false });
    return await message.send(`_AutoSave Status is now ${match}._`);
  },
});

registerCommand({
  name: 'autoread',
  fromMe: true,
  desc: 'Settings to automatically read messages',
  type: 'settings',
  function: async (message, match: 'on' | 'off') => {
    if (!match || (match?.toLowerCase()?.trim() !== 'on' && match?.toLowerCase()?.trim() !== 'off'))
      return message.send(`_Usage: ${message.prefix[0]}autoread on | off._`);
    const db = (await getConfig()).autoRead;
    if (match === 'on' && db) return message.send('_AutoRead is Already on._');
    if (match === 'off' && !db) return message.send('_AutoRead is Already off._');
    await editConfig({ autoRead: match === 'on' ? true : match === 'off' ? false : false });
    return await message.send(`_Autoread messages is now ${match}._`);
  },
});

registerCommand({
  name: 'cmdread',
  fromMe: true,
  desc: 'Settings to automatically read command messages',
  type: 'settings',
  function: async (message, match: 'on' | 'off') => {
    if (!match || (match?.toLowerCase()?.trim() !== 'on' && match?.toLowerCase()?.trim() !== 'off'))
      return message.send(`_Usage: ${message.prefix[0]}cmdread on | off._`);
    const db = (await getConfig()).cmdRead;
    if (match === 'on' && db) return message.send('_AutoReadCommand is Already on._');
    if (match === 'off' && !db) return message.send('_AutoReadCommandis Already off._');
    await editConfig({ cmdRead: match === 'on' ? true : match === 'off' ? false : false });
    return await message.send(`_AutoReadCommand messages is now ${match}._`);
  },
});

registerCommand({
  name: 'cmdreact',
  fromMe: true,
  desc: 'Settings to automatically react to command messages',
  type: 'settings',
  function: async (message, match: 'on' | 'off') => {
    if (!match || (match?.toLowerCase()?.trim() !== 'on' && match?.toLowerCase()?.trim() !== 'off'))
      return message.send(`_Usage: ${message.prefix[0]}cmdreact on | off._`);
    const db = (await getConfig()).cmdReact;
    if (match === 'on' && db) return message.send('_AutoRead is Already on._');
    if (match === 'off' && !db) return message.send('_AutoRead is Already off._');
    await editConfig({ cmdReact: match === 'on' ? true : match === 'off' ? false : false });
    return await message.send(`_AutoCommand React messages is now ${match}._`);
  },
});
