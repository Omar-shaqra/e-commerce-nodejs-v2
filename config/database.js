const mongoose = require("mongoose");

const dbconnection = ()=>{
    mongoose.connect(process.env.DB_URL).then((conn)=>{
        console.log(`DB connected on ${conn.connection.host}`);
     }).catch((e)=>{
        console.error(`database error: ${e}`);
        process.exit(1);
     })
    
}

module.exports = dbconnection;
