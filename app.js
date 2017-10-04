const TwitterPackage = require('twitter')
const bout_bot_id = '3016652708'
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

const handleMentions = (mentions) => {
  console.log('LOOP THRU MENTIONS')
  console.log('==================')

  for (let i in mentions) {
    // Get user_id, created_id for current mention
    // TODO: delete text, screen_name
    const {
      text,
      created_at,
      user: {
        id_str: current_id,
        screen_name
      },
      entities: {
        user_mentions
      }
    } = mentions[i]

    // Calculate age of tweet in days
    const created_date = new Date(created_at)
    const date = new Date()
    const age = Math.floor(((date - created_date) / 86400000))
    // If tweet is over 1 week old, stop queueing
    if (age > 7) break

    console.log('Mention #' + i, '@' + screen_name + ' tweeted "' + text + '" (' + age + ' days ago)')

    // Get all users mentioned (except @bout_bot)
    let _users = [current_id]
    if (user_mentions.length > 1) {
      for (let m in user_mentions) {
        const { id_str } = user_mentions[m]
        if (id_str !== bout_bot_id) {
          _users.push(id_str)
        }
      }
      console.log('---')
    }
  }
  console.log('')

  setTimeout(function () {
    client.end(function (err) {
      if (err) throw err
    })
  }, 300)
}

// Get mentions of @bout_bot
const getMentions = () => {
  twitter.get('statuses/mentions_timeline', function (error, mentions, response) {
    if (!error) {
      handleMentions(mentions)
    } else {
      // Getting mentions from Twitter failed
      console.log(error)
    }
  })
}

// getMentions()
