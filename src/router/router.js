const express = require('express')
const { route } = require('express/lib/application')
const res = require('express/lib/response')
const router = express.Router()
const userController = require('../controller/userContoller')
const auth = require('../middleware/middleware')



router.post('/api',async (req,res)=>{
   data1 =  req.body.fname
   
   console.log(data1)
})



router.post('/register' ,userController.registration)

router.post('/login' , userController.loginUser)

router.get('/user/:userId/profile' ,auth.authentication ,userController.getUser )

router.put('/user/:userId/profile',auth.authentication,userController.updateUser)

module.exports = router