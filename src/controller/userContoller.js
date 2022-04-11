const express = require('express')
const router = express.Router()
const res = require('express/lib/response')
const middlevalidator = require('../middleware/validation')
const userModel = require('../model/userModel')
const bcrypt  = require('bcrypt');
const uploadAws = require('../middleware/awsConfig')
const aws = require("aws-sdk")


const registration = async (req,res) => {
      try  {
          const data1 = req.body.data
          const data = JSON.parse(data1)
        const filter = {}
        if (Object.keys(data).length === 0) { return res.status(400).send({ status: false, message: "Please enter Data like firstname lastname" }) }

        const { fname, lname, email,phone, password, address } = data
        if (!middlevalidator.isvalid(fname)) { return res.status(400).send({ status: false, massage: "please enter first name" }) }

        if (!middlevalidator.isvalid(lname)) { return res.status(400).send({ status: false, massage: "please enter last name" }) }

        if (!middlevalidator.isvalid(email)) {
            return res.status(400).send({ status: false, massage: "please enter email" })
        }
        if (!middlevalidator.isValidEmail(email)) {
            return res.status(400).send({ status: false, massage: "please enter correct email" })
        }
        const emailFind = await userModel.findOne({ email: email })
        if (emailFind) {
            return res.status(400).send({ status: false, massage: "Email alrady Exist" })
        }

            
        if (!middlevalidator.isvalid(phone)) { return res.status(400).send({ status: false, massage: "please enter phone" }) }
        if (!middlevalidator.isValidPhone(phone)) { return res.status(400).send({ status: false, massage: "Enter Correct mobile Number" }) }
        let mobileNumber = await userModel.findOne({ phone: phone })
        if (mobileNumber) { return res.status(400).send({ status: false, massage: "mobile Number alrady exist" }) }

        if (!middlevalidator.isvalid(password)) { return res.status(400).send({ status: false, massage: "please enter password" }) }
        if(password.length < 8 || password.length > 15) {return res.status(400).send({ status: false, massage: "please length should be 8 to 15 password" }) }
        const hash = bcrypt.hashSync(password, 6);
        data.password = hash

        const { shipping, billing } = address
        if (Object.keys(address).length == 0) { return res.status(400).send({ status: false, massage: "please enter address" }) }
        if (Object.keys(shipping).length == 0) { return res.status(400).send({ status: false, massage: "please enter shipping address" }) }
        if (!middlevalidator.isvalid(shipping.street)) { return res.status(400).send({ status: false, massage: "please enter street of shipping address" }) }
        if (!middlevalidator.isvalid(shipping.city)) { return res.status(400).send({ status: false, massage: "please enter city of shipping address" }) }
        if (!middlevalidator.isvalid(shipping.pincode)) { return res.status(400).send({ status: false, massage: "please enter pincode of shipping address" }) }


        if (Object.keys(billing).length == 0) { return res.status(400).send({ status: false, massage: "please enter billing address" }) }
        if (!middlevalidator.isvalid(billing.street)) { return res.status(400).send({ status: false, massage: "please enter street of billing address" }) }
        if (!middlevalidator.isvalid(billing.city)) { return res.status(400).send({ status: false, massage: "please enter city of billing address" }) }
        if (!middlevalidator.isvalid(billing.pincode)) { return res.status(400).send({ status: false, massage: "please enter pincode of billing address" }) }

        filter['address'] = address

        const profilePic = req.files
        if(profilePic && profilePic.length >0 ){

            let uploadedFileURL = await uploadAws.uploadFile(profilePic[0])
            data.profileImage = uploadedFileURL
        }
        else{
            return res.status(400).send({ msg: "No file found" })
        }
        const createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createUser })
    }
    catch(error){
        return res.status(500).send({status: false, message: error })
    }
}




module.exports.registration = registration