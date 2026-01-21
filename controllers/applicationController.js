const mysqlcon = require('../config/db')
const fs = require('fs')
const path = require('path')


module.exports.applyJob = async(req, res)=>{
    try{

        const {jobId} = req.body;
        let applicantId = req.user.id;
        if(!req.file){
            return res.status(400).json({
                message : `No File uploaded`
            })
        }

        const file = req.file;
        const fileData = fs.readFileSync(file.path);

        console.log("aaaaaaaaaaaa", file);
        

        const applyJobSql = await mysqlcon(`INSERT INTO tbl_applications( job_id, candidate_id, resume) VALUES(?,?,?)`,[jobId, applicantId, file.originalname]);

        if(applyJobSql.insertId == 0){
            return res.status(400).json({
                message : `Error to apply this job.`
            })
        }

        return res.status(200).json({
            message : `You have applied successfully`
        })






    }catch(error){

    }
}

module.exports.myApplied = async (req, res)=>{
    try {

        let candidateId = req.user.id;

        let myAppliedSql = await mysqlcon(`SELECT 
                a.id AS application_id,
                a.job_id,
                a.candidate_id,
                a.resume,
               CASE a.status
                    WHEN 1 THEN 'Applied'
                    WHEN 2 THEN 'Reviewed'
                    WHEN 3 THEN 'Accepted'
                    WHEN 4 THEN 'Rejected'
                    ELSE 'Unknown'
                END AS status,
                a.applied_at,
                j.id AS job_id,
                j.title AS job_title,
                j.description AS job_description,
                j.location AS job_location,
                j.salary AS job_salary
            FROM tbl_applications a
            INNER JOIN tbl_jobs j ON a.job_id = j.id
            WHERE a.candidate_id = ?`,[candidateId]);

           return res.status(200).send(
    JSON.stringify({ message: myAppliedSql }, null, 4)
);


        
    } catch (error) {

        return res.status(500).json({

            message : error.message
        })
        
    }
}

module.exports.myJobApplicants = async(req, res)=>{
    try{    

        

    }catch(error){

    }
}