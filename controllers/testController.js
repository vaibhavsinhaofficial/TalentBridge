
module.exports.test = async(req, res)=>{
    try{

       console.log("ho gya");

       return res.status(200).json({
        message : `Working`
       })

    }catch(error){
        console.log(`helllllooooooooooo`);
        
        return res.status(500).json({
            message : error.message
        })
    }
}