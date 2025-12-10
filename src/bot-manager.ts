const mineflayer = require('mineflayer');
const fs = require('fs');

let servers = new Set<string>(["0b0t.org", "2b2t.org", "3b3t.co", "5b5t.org", "6b6t.org", "7b7t.net", "8b8t.me", "9b9t.org", "constantiam.net", "eliteanarchy.org"]);
const PREFIX = "bb ";
const HELP_MESSAGE = "> I ain't add any yet >:[ be patient";

let activeServers = new Set<string>();

let activePlayers = new Map<string, number>();

let uniqueUsernames = new Set<string>();

function connect(serverIP:string){
    const bot = mineflayer.createBot({
        host: serverIP,
        port: 25565,
        username: 'riccqrdo',
        auth: 'microsoft'
    })

    bot.once('spawn', () => {
        console.log(`Connected to ${serverIP}`)
        activeServers.add(serverIP);
        console.log(`Currently active in the following servers : ${Array.from(activeServers).join(", ")}`)

        bot.setControlState('forward', true)
        bot.setControlState('jump', true)

        //bot.look(Math.random() * Math.PI * 2, 0) // random direction

        setTimeout(() => {
            bot.setControlState('forward', false)
            bot.setControlState('jump', false)
        }, 2000)

    })

    bot.on('chat', (username:string, message:string) => {
        //console.log(`[${username}] : ${message}`);
        if (username != bot.username && message.startsWith(PREFIX)){
            switch(message.split(" ")[1]){
                case "help":
                    bot.chat(HELP_MESSAGE);
                    break;
                default:
                    return;
            }
        }
    })

    let tablistInterval = setInterval(()=>{
        try{
            activePlayers.set(serverIP, new Map(Object.entries(bot.players)).size);
            for (const username of Array.from(new Map(Object.entries(bot.players)).keys())){
                if (!uniqueUsernames.has(username)) uniqueUsernames.add(username);
            }
        } catch (_){}
        
    }, 1000);

    //bot.on('error', ()=>{console.log("ERROR")})
    bot.on('end', () => {
        console.log('Bot has disconnected from ' + serverIP); 
        activeServers.delete(serverIP); 
        tablistInterval.close();
        activePlayers.set(serverIP, 0)
        console.log(`Currently active in the following servers : ${Array.from(activeServers).join(", ")}`)
        connect(serverIP);
    });
    /*
    process.stdin.on("data", (data) => {
        const message = data.toString().trim()
        if (message.length > 0) {
            bot.chat(message)
        }
    })
    */
}

let serverJoinQueue = Array.from(servers.values());

setInterval(()=>{
    if(serverJoinQueue.length > 0) {
        let serverIP = serverJoinQueue.pop()!;
        connect(serverIP);
        activePlayers.set(serverIP, 0);
    }
}, 10000)

setInterval(() => {
    const totalPlayers = Array.from(activePlayers.values()).reduce((sum, players) => sum + players, 0);

    console.log(`Currently overseeing ${totalPlayers} players.`);
}, 6000);

process.on('SIGINT', async () => {
    console.log('\b\bShutting down gracefully...');

    console.log(Array.from(uniqueUsernames).join("\n"));

    await fs.writeFile('uniques.txt', Array.from(uniqueUsernames).sort().join("\n"), (err: NodeJS.ErrnoException | null) => {
        if (err) throw err;
        console.log('File saved!');
    });
    
    setTimeout(()=>{process.exit(0)}, 500);
});

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