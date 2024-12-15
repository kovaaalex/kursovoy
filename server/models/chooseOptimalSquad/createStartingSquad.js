require('dotenv').config({ path: './server/.env' })
const { createStartingSquad} = require('./chooseSquad2')
createStartingSquad().then(squad => console.log(squad)).catch(err => console.error(err));