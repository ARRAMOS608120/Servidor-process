require('dotenv').config()

const options = {
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLFILENAME
    },
    useNullAsDefault: true
  }
  
 
 module.exports = {
    options
}