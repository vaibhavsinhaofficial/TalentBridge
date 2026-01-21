const express = require('express')
const app = express();
require('dotenv').config();

app.use(express.urlencoded({extended : false}))

app.use(require(`./routes/route`))
// app.use(require('./config/db'))


const port = process.env.PORT || 4000;


app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
    
})