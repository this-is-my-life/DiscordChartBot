/* eslint-disable no-console */
/*
  proj- Keep Typing and Nobody Explodes. The Discord Bot,

  We Don't Like Close-Source. Email: pmhstudio.pmh@gmail.com
*/

const discord = require('discord.js')
const fs = require('fs')
const superagent = require('superagent')
let guildData
superagent.get('https://api.jsonbin.io/b/5c723c9be064586e2ea3e347/latest').then((res) => {
  guildData = res.body
})

const botToken = process.env.cbToken
const bot = new discord.Client()

bot.login(botToken)
bot.commands = new discord.Collection()

fs.readdir('./Charts', (err, files) => {
  if (err) { console.log(err) }
  let moduleFile = files.filter((f) => f.split('.').pop() === 'js')
  moduleFile.forEach((f) => {
    let props = require(`./Charts/${f}`)
    for (let aliasCount = props.alias.length - 1; aliasCount >= 0; aliasCount--) {
      bot.commands.set(props.alias[aliasCount], props)
      console.log('Chart Loaded: ' + props.alias[aliasCount])
    }
  })
})

bot.on('ready', () => {
  console.log(bot.user.username + ' is Booted!')
  bot.user.setActivity("Dev | Type 'cb!messages' to Get Chart Url")
})

bot.on('message', (input) => {
  if (input.author.id === bot.user.id) { return }
  guildData[input.guild.id][input.author.id].MessageScore.TotalMessageCount++
  guildData[input.guild.id][input.author.id].MessageScore.TotalMessageCharCount += input.content.length
  superagent.put('https://api.jsonbin.io/b/5c723c9be064586e2ea3e347').send(guildData).catch((err) => console.log(err))

  // Message Caculation.
  let msgArray = input.content.split('!')
  if (msgArray[0] === 'cb' && msgArray[1]) {
    let msgWant = msgArray[1]
    let msgRunFile = bot.commands.get(msgWant)
    if (!msgRunFile) { return }
    msgRunFile.run(bot, input)
  }
})
