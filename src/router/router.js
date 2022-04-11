const express = require('express')
const { route } = require('express/lib/application')
const res = require('express/lib/response')
const router = express.Router()
const userController = require('../controller/userContoller')



router.post('/api',async (req,res)=>{
   data1 =  req.body.fname
   
   console.log(data1)
})



router.post('/register' ,userController.registration)

module.exports = router