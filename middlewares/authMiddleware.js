const jwt = require('jsonwebtoken');
const mysqlcon = require('../config/db')
require(`dotenv`).config();


const authMiddleware = async(req, res, next)=>{
    try{

        const{authorization} = req.headers;
        console.log("@%%%DDDD",authorization);
        
        if(!authorization){
            return res.status(400).json({
                message : `jwt not found`
            })
        }
        
        const token = authorization.replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.payload.id;
        let userdata = await mysqlcon(`SELECT * FROM tbl_user WHERE id =?`, [userId]);
        req.user = userdata[0]
        next()

    }catch(error){
        return res.status(500).json({
            message : error.message
        })
    }
}

module.exports = authMiddleware