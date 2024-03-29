require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const token = process.env.BOT_TOKEN;
const { getJsonFile, updateJsonFile } = require("./utils");
const dayjs = require('dayjs');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsFolderPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsFolderPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsFolderPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(
            `WARNING The command at ${filePath} is missing a require "data" or "execute" property`
        );
    }
}

const carlosRole = "1096687902433476620";


client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction);

    for(let role of interaction.member._roles) {
        if(role === carlosRole) {
            await interaction.reply("KINO!")
            return;
        }
    }
    

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found`
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);

let pastDate = dayjs(Date.now()).format("M/DD/YYYY");

setInterval(async () => {
    let currentDate = dayjs(Date.now()).format("M/DD/YYYY");
    if(pastDate === currentDate) return;
    pastDate = currentDate;
    console.log(pastDate);
    const data = await getJsonFile();
    data.daysSince++;
    data.longestStreak = Math.max(data.longestStreak, data.daysSince);
    if(data.shortestStreak === data.longestStreak) {
        data.shortestStreak = Math.min(data.longestStreak, data.daysSince);
    } else {
        data.shortestStreak = Math.min(data.shortestStreak, data.daysSince);
    }
    console.log(data);
    await updateJsonFile(data);
}, 4 * 60 * 60 * 1000);
