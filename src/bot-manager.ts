const mineflayer = require('mineflayer');
const fs = require('fs');

// stores the servers that are automatically joined on startup
// TODO: fetch this from a database to be able to save this information across reloads
let servers = new Set<string>(["0b0t.org", "2b2t.org", "3b3t.co", "5b5t.org", /*"6b6t.org",*/ "7b7t.net", "8b8t.me", "9b9t.org", "constantiam.net", "eliteanarchy.org"]);
const PREFIX = "bb ";

// servers that the bot is currently in
let activeServers = new Set<string>();

// number of active players in each server the 
let activePlayers = new Map<string, number>();

// unique player usernames found during the session
let uniqueUsernames = new Set<string>();

// queue used by auto reconnect, helps avoid getting rate limited
let serverJoinQueue = Array.from(servers.values());

// connection to a given server, contains all the code that determines what the bot does, takes a server IP as parameter
function connect(serverIP:string){
    // creates the bot and connects it to the server
    const bot = mineflayer.createBot({
        host: serverIP,
        auth: 'microsoft'
    })

    // ran when the bot joins the world
    bot.once('spawn', () => {
        console.log(`Connected to ${serverIP}`)
        activeServers.add(serverIP);
        console.log(`Currently active in the following servers : ${Array.from(activeServers).join(", ")}`)
        console.log(`Waiting to join : ${serverJoinQueue.join(", ")}`)

        // moves the bot a bit so it can start chatting on certain servers
        bot.setControlState('forward', true)
        bot.setControlState('jump', true)

        setTimeout(() => {
            bot.setControlState('forward', false)
            bot.setControlState('jump', false)
        }, 2000)

    })

    // ran every time the bot gets a message
    bot.on('chat', (username:string, message:string) => {
        if (username != bot.username && message.startsWith(PREFIX)){
            switch(message.split(" ")[1]){
                default:
                    return;
            }
        }
    })

    // periodically checks for new players
    let tablistInterval = setInterval(()=>{
        try{
            activePlayers.set(serverIP, new Map(Object.entries(bot.players)).size);
            for (const username of Array.from(new Map(Object.entries(bot.players)).keys())){
                if (!uniqueUsernames.has(username)) uniqueUsernames.add(username);
            }
        } catch (_){}
    }, 5_000);

    bot.on('error', ()=>{console.log("ERROR")})

    // ran when the bot disconnects from the server
    bot.on('end', () => {
        console.log('Bot has disconnected from ' + serverIP); 
        activeServers.delete(serverIP); 
        tablistInterval.close();
        activePlayers.set(serverIP, 0)
        console.log(`Currently active in the following servers : ${Array.from(activeServers).join(", ")}`)
        setTimeout(()=>{serverJoinQueue.push(serverIP);}, 60_000) // attempts to reconnect after a minute to avoid getting rate limited
    });
}

setInterval(()=>{
    if(serverJoinQueue.length > 0) {
        let serverIP = serverJoinQueue.pop()!;
        connect(serverIP);
        activePlayers.set(serverIP, 0);
    }
}, 10_000)

// saves the unique usernames to a text file
// TODO: replace this with database queries
process.on('SIGINT', async () => {
    await fs.writeFile('uniques.txt', Array.from(uniqueUsernames).sort().join("\n"), (err: NodeJS.ErrnoException | null) => {
        if (err) throw err;
        console.log('File saved!');
    });
    
    setTimeout(()=>{process.exit(0)}, 500);
});

// getters / setters

export function getAllServers() : Set<string> {
    return servers;
}

export function getActiveServers() : Set<string> {
    return activeServers;
}

export function getActivePlayerCount() : number {
    return Array.from(activePlayers.values()).reduce((sum, players) => sum + players, 0);
}

export function addServer(serverIP : string) {
    servers.add(serverIP);
}

export function removeServer(serverIP : string) {
    servers.delete(serverIP);
}