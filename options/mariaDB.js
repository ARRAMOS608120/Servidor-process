require('dotenv').config()

const options1 = {
    client: 'mysql',
    connection: {
      host: process.env.MDBHOST,
      user: process.env.MDBUSER,
      password: '',
      database: process.env.MDBDATABASE,
    }
  }

  
module.exports = {
    options1
}