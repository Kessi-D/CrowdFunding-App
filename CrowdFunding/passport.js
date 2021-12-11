let config = {
    clientID: '0b7137b0a105f5a5d6cf',
    clientSecret: '4bdb4a0fc27f9e9b99411c78ba25f6398ef13396',
    callbackURL: "http://localhost:3000/auth/git"
}



let fbConfig = {
    clientID: '4577472932299413',
    clientSecret: '43e671e98c896ea0437e41eed5a667a6',
    callbackURL: "http://localhost:3000/auth/facebook/callback"

}
 let google = {
    clientID: '750957774651-51e6ueum80dgb29iopfmlrp3hkk98mue.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/google/callback"
  }
module.exports = {config, fbConfig, google};
