const express = require('express')
const bots = require('./bot-manager.js')
const app = express()
const port = 3000

app.use(express.json());  
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/getActivePlayerCount', (req, res) => {
  res.send(`{"activePlayerCount":${bots.getActivePlayerCount()}}`)
})

app.get('/getServers', (req, res) => {
  res.send({activeServers:Array.from(bots.getActiveServers().keys())})
})

app.get('/getActivePlayers', (req, res) => {
  res.send(`{"activePlayers":${JSON.stringify(Object.fromEntries(bots.getActivePlayers()))}}`)
})

// example request body: {"serverIP":"0b0t.org"}
app.post('/connect', (req, res) => {
  bots.addServer(req.body.serverIP)
  res.send(``)
})

app.post('/disconnect', (req, res) => {
  bots.removeServer(req.body.serverIP)
  res.send(``)
})
