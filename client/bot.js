const discord = require('discord.js')
const bot = new discord.Client()
const superagent = require('superagent')

let chartData
superagent.get('https://api.myjson.com/bins/14qzec').then((response) => {
  chartData = response.body
}).catch((err) => {
  console.log(err)
})

bot.on('ready', () => {
  bot.user.setActivity('Dev | "cb!"를 입력해 차트를 렌더링!', { "type": "PLAYING" })
  setInterval(() => {
    detectCycle()
  }, 5000)
  
})

bot.on('message', (message) => {
  let length = message.content.length
  console.log(message.author.username + ' typed ' + length + ' letters.')
  chartData.guilds[message.guild.id].totalMessage++
  chartData.guilds[message.guild.id].totalLetter += length
  chartData.guilds[message.guild.id].channels[message.channel.id].totalMessage++
  chartData.guilds[message.guild.id].channels[message.channel.id].totalLetter += length
  chartData.guilds[message.guild.id].channels[message.channel.id].usersMessage[message.author.id].totalMessage++
  chartData.guilds[message.guild.id].channels[message.channel.id].usersMessage[message.author.id].totalLetter += length
  chartData.guilds[message.guild.id].members[message.author.id].totalMessage++
  chartData.guilds[message.guild.id].members[message.author.id].totalLetter += length

  if (message.content.startsWith('cb!')) {
    let guildId = message.content.split('!')[1].split('|')[0] || message.guild.id
    let channelId = message.content.split('!')[1].split('|')[1] || message.channel.id
    let userId = message.content.split('!')[1].split('|')[2] || message.author.id
    let urlEmb = new discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setThumbnail(message.guild.iconURL)
      .setTitle('여기를 눌러 찻봇 통계 사이트로 이동합니다')
      .setURL('http://chartbot.kro.kr/?guild=' + guildId + '&channel=' + channelId + '&user=' + userId)
      .setDescription('사용법: cb!<서버ID>|<채널ID>|<유저ID>')
    message.channel.send(urlEmb)
  }
})

bot.login(process.env.Token)

function detectCycle () {
  let starts = JSON.stringify(chartData).length
  if (!chartData.guilds) {
    chartData.guilds = {

    }
  }
  bot.guilds.array().forEach((eachGuild) => {
    if (!chartData.guilds[eachGuild.id]) {
      chartData.guilds[eachGuild.id] = {
        name: eachGuild.name,
        users: eachGuild.memberCount,
        totalMessage: 0,
        totalLetter: 0,
        channels: {

        },
        members: {

        }
      }
    }
    eachGuild.channels.array().forEach((eachChannel) => {
      if (!chartData.guilds[eachGuild.id].channels[eachChannel.id]) {
        chartData.guilds[eachGuild.id].channels[eachChannel.id] = {
          name: eachChannel.name,
          totalMessage: 0,
          totalLetter: 0,
          usersMessage: {

          }
        }
      }
      eachGuild.members.array().forEach((eachUser) => {
        if (!chartData.guilds[eachGuild.id].channels[eachChannel.id].usersMessage[eachUser.id]) {
          chartData.guilds[eachGuild.id].channels[eachChannel.id].usersMessage[eachUser.id] = {
            name: eachUser.user.username,
            totalMessage: 0,
            totalLetter: 0
          }
        }
      })
    })
    eachGuild.members.array().forEach((eachMember) => {
      if (!chartData.guilds[eachGuild.id].members[eachMember.id]) {
        chartData.guilds[eachGuild.id].members[eachMember.id] = {
          name: eachMember.user.username,
          totalMessage: 0,
          totalLetter: 0
        }
      }
    })
  })
  let ends = JSON.stringify(chartData).length
  superagent.put('https://api.myjson.com/bins/14qzec')
    .send(chartData)
    .catch((err) => console.log(err))
  console.log('detectCycle Finished (+' + (ends - starts) + ')')
}