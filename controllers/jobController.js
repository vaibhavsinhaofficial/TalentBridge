const mysqlcon = require(`../config/db`)


module.exports.createJob = async(req, res)=>{
    try{
        const {title, description, location, salary} = req.body;
        let EmployerId = req.user.id;

        if(EmployerId === 1 || EmployerId === 3){
            return res.status(400).json({
                message : `You are not allowed to post the Job.`
            })
        }

        let resultCreateJob = await mysqlcon(`INSERT INTO tbl_jobs(title, description, location, salary, employer_id) VALUES(?,?,?,?,?)`,[title, description, location, salary, EmployerId]);
        
        if(resultCreateJob.insertId == 0){
            return res.status(400).json({
                message : `Job not created`
            })
        }

        return res.status(201).json({
            message : `Job Created at Id ${resultCreateJob.insertId}`
        })

    }catch(error){
        return res.status(500).json({
            message : error.message
        })
    }
}

module.exports.jobs = async(req, res)=>{
    try{

        resultJobData = await mysqlcon(`SELECT * FROM tbl_jobs`);

        return res.status(200).json({
            message : resultJobData
        })

    }catch(error){
        return res.status(500).json({
            message : error.message
        })
        }
}

module.exports.myPublishJobs = async(req, res)=>{
    try{

        const employerId = req.user.id;

        console.log("%%%%%%%%%%%");

        // let myAllJobsSql = await mysqlcon(`SELECT * FROM tbl_jobs WHERE employer_id = ?`,[employerId])
        let myAllJobsSql = await mysqlcon(`SELECT j.*, COUNT(a.id) AS Total FROM tbl_jobs j LEFT JOIN tbl_applications a on j.id = a.job_id WHERE j.employer_id=? GROUP BY j.id`,[employerId])
        console.log("######$$$$$$$$$$$$");
        
        if(myAllJobsSql.length == 0){
            return res.status(400).json({
                message : `You haven't posted yet.`
            })
        }

        return res.status(200).send(
            JSON.stringify({ message : myAllJobsSql })
        )


    }catch(error){

    }
}

module.exports.applicantsOnJobs = async(req, res)=>{
    try {

        const {jobId} = req.body;

        let applicantsOnJobsSql = await mysqlcon(`SELECT a.*, u.name, u.email FROM tbl_applications a LEFT JOIN tbl_user u ON a.candidate_id = u.id WHERE a.job_id = ? GROUP BY a.id`, [jobId])

        return res.status(200).json({
            message : applicantsOnJobsSql
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message
        })
    }
}

