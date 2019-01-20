/*
    Welcome to The Discord ChartBot. | This is ChartBot Core Script.
    const discordChartBot = 'Charts For Discord Servers' // Support En, Kr. 디스코드 서버를 위한 통계 차트! -Github Repo Description.
*/

console.log('\n\nHello, Chart!')

const fileReadAPI = require('fs')
const discordAPI = require('discord.js')

const cb = new discordAPI.Client()
const cbToken = process.env.cbToken

cb.login(cbToken)
cb.commands = new discordAPI.Collection()

fileReadAPI.readdir('./Charts', (err, files) => {
  if (err) {
    console.log(err)
  }
  let chartsFile = files.filter((f) => f.split('.').pop() === 'js')
  chartsFile.forEach((f, i) => {
    let props = require(`./Charts/${f}`)
    let Commands = f.split('.')
    let Command = Commands[0]
    for (let aliasCount = props.alias.length; aliasCount >= 0; aliasCount--) {
      cb.commands.set(props.alias[aliasCount])
    }
    console.log(`${Command} Chart Loaded!`)
  })
})

cb.on('ready', () => {
  console.log('\n\nBooted--------------------')
})

cb.on('message', (input) => {
  if (!input.author.id === cb.user.id) {
    if (!input.guild) { // ignore DM
      input.reply('Oops! ChartBot is Server-Only.\n저런! 여기는 서버가 아닌거같은데요;;').then((thismsg) => thismsg.delete(2000))
    } else {
      // Main
      input.channel.send(`Length: ${input.content.length}`)
    }
  }
})
