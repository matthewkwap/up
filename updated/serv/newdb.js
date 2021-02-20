const Pool = require("pg").Pool;
const pool = new Pool({
    user:"postgres",
    password:"kmatthew",
    host:"localhost",
    port:5432,
    database:"account"
  
})

module.exports = pool


// SELECT * FROM tod; 
//http://localhost:3000/todos