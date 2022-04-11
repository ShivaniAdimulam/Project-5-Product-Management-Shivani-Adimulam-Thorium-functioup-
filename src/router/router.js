const express = require('express')
const { route } = require('express/lib/application')
const res = require('express/lib/response')
const router = express.Router()
const userController = require('../controller/userContoller')



router.get('/', (req,res)=>res.send('hi'))



router.post('/register' ,userController.registration)

module.exports = router