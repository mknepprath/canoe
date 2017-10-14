const TwitterPkg = require('twitter')
const http = require('http')
const express = require('express')
const botId = process.env.BOT_ID
const twitter = new TwitterPkg({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

// Post tweets
const tweet = (status, in_reply_to_status_id) => {
  console.log(status)
  twitter.post('statuses/update', { status, in_reply_to_status_id, auto_populate_reply_metadata: true }, function (error, reply, response) {
    if (!error) {
      console.log('Replied!')
      console.log('')
    }
  })
}
// Return a random element from array
const random = (n) => {
  return n[Math.floor(Math.random() * n.length)]
}

const handleMentions = (mentions, tweets) => {
  console.log('=== LOOP THRU MENTIONS ===')
  
  for (let i in mentions) {
    const {
      full_text,
      created_at,
      id_str,
      in_reply_to_user_id_str,
      in_reply_to_status_id_str,
      user,
      entities: {
        user_mentions
      }
    } = mentions[i]
    
    // Check if replied already (one of bot's tweets was in reply to this tweet)
    const replyTweet = tweets.find(t => t.in_reply_to_status_id_str === id_str)
    
    // Check if in reply to this bot...
    const replyToBot = in_reply_to_user_id_str === botId
    
    // Check if bot was already used in this canoe (replying to a tweet that was already in bot's mentions)
    const replyToPreviousMention = mentions.find(m => m.id_str === in_reply_to_status_id_str)
    
    // console.log(full_text)
    // console.log(!!replyTweet, !!replyToBot, !!replyToPreviousMention)

    // Calculate age of tweet
    const created_date = new Date(created_at)
    const date = new Date()
    const age = (date - created_date) / 86400000
    // If tweet is over ~1 hour old, stop queueing
    if (age <= 0.042 && user_mentions.length > 1 && !replyTweet && !replyToBot && !replyToPreviousMention) {
      console.log('Mention #' + i, '@' + user.screen_name + ' tweeted "' + full_text + '" (' + age + ' days ago)')

      // Get all users mentioned (except @bout_bot)
      let users = [...user_mentions]
      const removeBot = users.findIndex(u => u.id_str === botId)
      users.splice(removeBot, 1)
      users.push(user)
      
      const winner = random(users)

      // Mentioner's screen_name goes first, then everyone else's, then winner's name
      tweet('Everyone fell out of the canoe... except ' + winner.name + '!', id_str)
    }
  }
  console.log('')
}
// Get @tip_canoe tweets (pass all mentions in here to check if they've been replied to?)
const getTimeline = (mentions) => {
  twitter.get('statuses/user_timeline', { tweet_mode: 'extended' }, function (error, tweets, response) {
    if (!error) handleMentions(mentions, tweets)
  })
}
// Get mentions of @tip_canoe
const getMentions = () => {
  twitter.get('statuses/mentions_timeline', { tweet_mode: 'extended' }, function (error, mentions, response) {
    if (!error) getTimeline(mentions)
  })
}

const app = express()
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received")
  getMentions()
  response.sendStatus(200)
})
app.listen(process.env.PORT)

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`)
}, 30000)
