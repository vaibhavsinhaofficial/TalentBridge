const nodemailer = require('nodemailer')

function sendingGeneratedMail(){

    const mailOptions = {
        from : ``,
        to : ``,
        subject : ``,
        text : ``,
    }

    transport.sendMail(mailOptions, (error, info)=>{
        if(error){

            return res.status(500).json({
                message : error.message
            })

        }else{
            
        }
    })

}