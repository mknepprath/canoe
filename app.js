const TwitterPackage = require('twitter')
const botId = '915942223698710529'
const {
  CONSUMER_KEY: consumer_key,
  CONSUMER_SECRET: consumer_secret,
  ACCESS_TOKEN_KEY: access_token_key,
  ACCESS_TOKEN_SECRET: access_token_secret
} = process.env

// Initialize Twitter
const twitter = new TwitterPackage({
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret
})

// Post tweets
const tweet = (status, in_reply_to_status_id) => {
  twitter.post('statuses/update', { status, in_reply_to_status_id }, function (error, reply, response) {
    console.log(error || 'Replied: ' + reply.text)
  })
}
// Return a random item from array
const random = (n) => {
  return n[Math.floor(Math.random() * n.length)]
}

const handleMentions = (mentions, tweets) => {
  console.log('=== LOOP THRU MENTIONS ===')

  for (let i in mentions) {
    // Get user_id, created_id for current mention
    // TODO: delete text, screen_name
    const {
      text,
      created_at,
      id_str,
      user,
      user: {
        id_str: current_id,
        screen_name,
        name
      },
      entities: {
        user_mentions
      }
    } = mentions[i]
    
    // Check if replied already
    const replyTweet = tweets.find(t => t.in_reply_to_status_id_str === id_str)

    // Calculate age of tweet in days
    const created_date = new Date(created_at)
    const date = new Date()
    const age = Math.floor(((date - created_date) / 86400000))
    // If tweet is over 1 week old, stop queueing
    if (age > 7 || !!replyTweet || user_mentions.length < 2) break

    console.log('Mention #' + i, '@' + user.screen_name + ' tweeted "' + text + '" (' + age + ' days ago)')
    
    // Get all users mentioned (except @bout_bot)
    let mentioned = []
    for (let m in user_mentions) {
      const { id_str } = user_mentions[m]
      if (id_str !== botId) {
        mentioned.push(user_mentions[m])
      }
    }
    
    // Get a winner
    const _pool = [...mentioned]
    _pool.push(user)
    const winner = random(_pool)
    
    // Mentioner's screen_name goes first, then everyone else's, then winner's name
    tweet('@' + user.screen_name + ' @' + mentioned.map((m) => m.screen_name).join(' @') + ' Everyone fell out of the canoe... except ' + winner.name + '!', id_str)
  }
  console.log('')
}
// Get @tip_canoe tweets (pass all mentions in here to check if they've been replied to?)
const getTimeline = (mentions) => {
  twitter.get('statuses/user_timeline', function (error, tweets, response) {
    if (!error) handleMentions(mentions, tweets)
  })
}
// Get mentions of @tip_canoe
const getMentions = () => {
  twitter.get('statuses/mentions_timeline', function (error, mentions, response) {
    if (!error) {
      getTimeline(mentions)
    } else {
      // Getting mentions from Twitter failed
      console.log(error)
    }
  })
}

getMentions()
