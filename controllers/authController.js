const mysqlcon = require(`../config/db`)
const bcrypt = require(`bcrypt`)
const jwt = require(`jsonwebtoken`)
const nodemailer = require('nodemailer')
const redis = require('redis')
const redisClient = redis.createClient();
require(`dotenv`).config();


// redisClient.connect().then(()=>{
//     console.log('connected to Redis Successfully')
// }).catch((error)=>{
//     console.log('Failed to connect with Redis', error);
    
// })

// const connectRedis = async()=>{
//     try{
//         await redisClient.connect();
//         console.log("Connected to Redis Successfully");
//     }catch(error){
//         console.log('Failed to connect with Redis', error);
//     }
// }

// connectRedis()

function generateOTP(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

let transport = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'vaibhavsinha840@gmail.com',
        pass : `oahp bdqu xdtp czdp`
    }
})


module.exports.register = async(req, res)=>{
    try{

        const{name, email, password, role} = req.body;

        const existingEmail = await mysqlcon(`SELECT id FROM tbl_user WHERE email = ?`,[email]);

        if(existingEmail.length > 0){
            return res.status(400).json({
                message : `user with this Email is already registered.`
            })
        }

        let hash = await bcrypt.hash(password, 10);

        let resultUserCreate = await mysqlcon(`INSERT INTO tbl_user(name, email, password, role) VALUES(?,?,?,?)`,[name, email, hash, role])

        if(resultUserCreate.insertId === 0 ){
            return res.status(400).json({
                message : `User not created`
            })
        }
        return res.status(200).json({
            message : `user created successfully at id ${resultUserCreate.insertId}`
        })

    }catch(error){
        return res.status(500).json({
            message : `error occured ${error.message}`
        })
    }
}

module.exports.login = async(req, res)=>{
    try{

        const {email, password} = req.body;

       
        let resultToLogin = await mysqlcon(`SELECT * FROM tbl_user WHERE email = ?`,[email]);
        if(resultToLogin.length == 0){
            return res.status(500).json({
                message : `Email Id is not correct`
            })
        }

        let hashedPassword = resultToLogin[0].password;
        let payload = {
            id : resultToLogin[0].id,
            userName : resultToLogin[0].email
        }

        const token = jwt.sign({payload}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRY})
       
        
        let isMatch = await bcrypt.compare(password, hashedPassword)
         console.log("keeeelkeeeo", isMatch);
        if(!isMatch){
            console.log("EEEEEEEE");
            
            return res.status(400).json({
                message : `Entered password is not matched`
            })
        }else{
              console.log("keeeelko");
            return res.status(200).json({
                message : [{
                    status : `Login Successful`,
                    id : payload.id,
                    token : token
                }]
            })
        }



    }catch(error){
         return res.satatus(500).json({
            message : error.message
        })
    }
}

module.exports.profile = async(req, res)=>{
    try{
        console.log("OOOOOOOOOOO",req.user);

        let data = {... req.user}
        data.role = data.role === 1 ? 'Admin' : data.role === 2 ? 'Employer':data.role === 3 ? 'Candidate': 'Unknown'
        
        console.log("olkiolkio",data);
        return res.status(200).json({
            message : data
        })
    }catch(error){
        return res.satatus(500).json({
            message : error.message
        })
    }
}

module.exports.forgetPasswordOne = async(req, res)=>{
    try{
        const {email} = req.body;
        let otp = generateOTP()
        let checkEmail = await mysqlcon('SELECT * FROM tbl_user Where email = ?', [email]);

        if(checkEmail.length== 0){
            return res.status(400).json(
                message = 'Entered Email is not matched with database'
            )
        }
        const expiryInSeconds = 300;
        await redisClient.setEx(email, expiryInSeconds, otp)

        const mailOptions = {
            from : 'vaibhavsinha840@gmail.com',
            to : `${email}`,
            subject : 'OTP Verification For Reseting password',
            text : `Your OTP is ${otp}, It is Valid for next 5 minutes only` 
        }

        transport.sendMail(mailOptions,(error, info) =>{
            if(error){
                return res.status(400).json({
                    message : error.message
                })
            }else{
                return res.status(200).json({
                    message : `OTP ${otp} sent successfully to email ${email}` + info.response
                })
            }
        })
    }catch(error){
         return res.satatus(500).json({
            message : error.message
        })
    }
}

module.exports.forgetPasswordTwo = async(req, res)=>{
    try{
        const{email, enteredOtp, newPassword} = req.body;

        const storedOtp = await redisClient.get(email)
        console.log("######",storedOtp);
        
        if(storedOtp != enteredOtp){
            return res.status(400).json({
                message : `Entered OTP is incorrect ❌`
            })
        }else{
            await redisClient.del(email);

            let hash = await bcrypt.hash(newPassword, 10)
            
            let changePassword = await mysqlcon(`UPDATE tbl_user SET password =? WHERE email =?`, [hash, email]);

            if(changePassword.affectedRows > 0 ){
                return res.status(200).json({
                    message : `Password Reset Successfully`
                })
            }else{
                return res.status(400).json({
                    message : 'Email not found or Password not updated'
                })
            }
        }
    }catch(error){
        return res.status(500).json({
            message : error.message
        })
    }
}