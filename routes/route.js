const express = require('express');
const multer = require('multer')

const router = express.Router();

// Define storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // your folder name
  },
  filename: function (req, file, cb) {
    // Use the original file name
    cb(null, file.originalname);
  },
});

// Initialize multer
const upload = multer({ storage: storage });



// const upload = multer({ dest : 'uploads/'});

let testControllerPath = require(`../controllers/testController`);

let authMiddlewarePath = require(`../middlewares/authMiddleware`)
let authControllerPath = require(`../controllers/authController`)
let jobControllerPath = require(`../controllers/jobController`)
let applicationControllerPath = require(`../controllers/applicationController`)




router.post(`/test`, testControllerPath.test)


router.post(`/api/auth/register`, authControllerPath.register)
router.post(`/api/auth/login`, authControllerPath.login)
router.get(`/api/auth/profile`, authMiddlewarePath, authControllerPath.profile)
router.post(`/api/auth/forgetPaswordOne`, authControllerPath.forgetPasswordOne)
router.post(`/api/auth/forgetPaswordTwo`, authControllerPath.forgetPasswordTwo)




router.post(`/api/job/createjob`, authMiddlewarePath, jobControllerPath.createJob)
router.get(`/api/job/jobs`, jobControllerPath.jobs)
router.get(`/api/job/mypublishjobs`, authMiddlewarePath, jobControllerPath.myPublishJobs)
router.get(`/api/job/applicantsonjobs`, authMiddlewarePath, jobControllerPath.applicantsOnJobs)


router.post(`/api/application/applyJob`, upload.single('file') ,authMiddlewarePath, applicationControllerPath.applyJob)
router.get(`/api/application/myjob`,authMiddlewarePath, applicationControllerPath.myApplied)

module.exports = router;