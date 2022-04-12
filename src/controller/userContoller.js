const express = require('express')
const router = express.Router()
const validator = require('../middleware/validation')
const userModel = require('../model/userModel')
const bcrypt = require('bcrypt');
const uploadAws = require('../middleware/awsConfig')
const aws = require("aws-sdk")
const jwt = require('jsonwebtoken');
const { findById } = require('../model/userModel');


const registration = async (req, res) => {
    try {
        const data = req.body

        // const data = JSON.parse(data1)
        if (Object.keys(data).length === 0) { return res.status(400).send({ status: false, message: "Please enter Data like firstname lastname" }) }

        const { fname, lname, email, phone, password, address } = data
        if (!validator.isvalid(fname)) { return res.status(400).send({ status: false, massage: "please enter first name" }) }

        if (!validator.isvalid(lname)) { return res.status(400).send({ status: false, massage: "please enter last name" }) }

        if (!validator.isvalid(email)) {
            return res.status(400).send({ status: false, massage: "please enter email" })
        }
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, massage: "please enter correct email" })
        }
        const emailFind = await userModel.findOne({ email: email })
        if (emailFind) {
            return res.status(400).send({ status: false, massage: "Email alrady Exist" })
        }


        if (!validator.isvalid(phone)) { return res.status(400).send({ status: false, massage: "please enter phone" }) }
        if (!validator.isValidPhone(phone)) { return res.status(400).send({ status: false, massage: "Enter Correct mobile Number" }) }
        let mobileNumber = await userModel.findOne({ phone: phone })
        if (mobileNumber) { return res.status(400).send({ status: false, massage: "mobile Number alrady exist" }) }

        if (!validator.isvalid(password)) { return res.status(400).send({ status: false, massage: "please enter password" }) }
        if (password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, massage: "please length should be 8 to 15 password" }) }
        const hash = bcrypt.hashSync(password, 6);
        data.password = hash

        const { shipping, billing } = address
        if (Object.keys(address).length == 0) { return res.status(400).send({ status: false, massage: "please enter address" }) }
        if (Object.keys(shipping).length == 0) { return res.status(400).send({ status: false, massage: "please enter shipping address" }) }
        if (!validator.isvalid(shipping.street)) { return res.status(400).send({ status: false, massage: "please enter street of shipping address" }) }
        if (!validator.isvalid(shipping.city)) { return res.status(400).send({ status: false, massage: "please enter city of shipping address" }) }
        if (!validator.isvalid(shipping.pincode)) { return res.status(400).send({ status: false, massage: "please enter pincode of shipping address" }) }


        if (Object.keys(billing).length == 0) { return res.status(400).send({ status: false, massage: "please enter billing address" }) }
        if (!validator.isvalid(billing.street)) { return res.status(400).send({ status: false, massage: "please enter street of billing address" }) }
        if (!validator.isvalid(billing.city)) { return res.status(400).send({ status: false, massage: "please enter city of billing address" }) }
        if (!validator.isvalid(billing.pincode)) { return res.status(400).send({ status: false, massage: "please enter pincode of billing address" }) }

        const profilePic = req.files
        if (profilePic && profilePic.length > 0) {

            let uploadedFileURL = await uploadAws.uploadFile(profilePic[0])
            data.profileImage = uploadedFileURL
        }
        else {
            return res.status(400).send({ message: "No file found" })
        }
        const createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createUser })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const loginUser = async function (req, res) {
    try {
        const requestbody = req.body;
        if (Object.keys(requestbody).length == 0) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. please provide login details" })
        }

        const { email, password } = requestbody;

        if (!validator.isvalid(email)) {
            return res.status(400).send({ status: false, message: `Email is required` })
        }
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: `Email is not correct ` })
        }

        if (!validator.isvalid(password)) {
            res.status(400).send({ status: false, message: `password is required` })
            return
        }

        const user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(401).send({ status: false, message: 'email is wrong' })
        }
        const decrpted = bcrypt.compareSync(password, user.password);
        if (decrpted == true) {
            const token = await jwt.sign({
                UserId: user._id,
            }, 'privatekey', { expiresIn: "10h" })

            const abc = res.setHeader('Authorization', `Bearer ${token}`);
            console.log(abc)
            return res.status(200).send({ status: true, message: 'User created successfully', data: { userId: user._id, token: token } })
        }
        else {
            res.status(400).send({ status: false, message: "password is incorrect" })
        }

    } catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }

}


const getUser = async (req, res) => {
    try {
        let UserId = req.params.userId

        if (!validator.isValidObjectId(UserId)) { return res.status(400).send({ status: false, message: "Please provide valid userid" }) }
        if (req.decodedToken.UserId == UserId) {
            let newData = await userModel.findById({ _id: UserId })
            return res.status(200).send({ status: true, message: "UserProfile Data is here ", data: newData })
        } else {
            return res.status(404).send({ status: false, message: "data not found" })
        }
    }
    catch (err) { return res.status(500).send({ status: false, message: err.message }) }
}


const updateUser = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
       let profilePic = req.files
        if (!data || !profilePic) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. please provide update details" })
        }
        
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter valid userId" })
        }
        
        const u_details = await userModel.findById(userId)
        if (!u_details) return res.status(400).send({ status: false, message: "user not found" })
       
       
       
       
        if (req.decodedToken.UserId == userId) {
            const { fname, lname, email, phone, password, address,} = data
            const profile = { address: u_details.address }

            if (validator.isvalid(fname)) {
                profile['fname'] = fname
            }



            if (validator.isvalid(lname)) {
                profile['lname'] = lname
            }


            if (validator.isvalid(email)) {
                if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, massage: "email is not correct formate enter correct email id" }) }
                let emailFind = await userModel.findOne({ email: email })
                if (emailFind) { return res.status(400).send({ status: false, massage: "Email id already exist" }) }
                profile['email'] = email
            }


            if (validator.isvalid(phone)) {
                if (!validator.isValidPhone(phone)) { return res.status(400).send({ status: false, massage: "phone not correct enter correct phone" }) }
                let phoneFind = await userModel.findOne({ phone: phone })
                if (phoneFind) return res.status(400).send({ status: false, massage: "phone no already exist" })
                profile['phone'] = phone
            }

            if (validator.isvalid(password)) {
                if (password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, massage: "please length should be 8 to 15 password" }) }
                const hash = bcrypt.hashSync(password, 6);
                profile['password'] = hash
            }
 
            if (profilePic && profilePic.length > 0) {
                const profilePic = req.files
                let uploadedFileURL = await uploadAws.uploadFile(profilePic[0])
                profile['profileImage'] = uploadedFileURL
            }
            
            
            if (address) {
                const obj = JSON.parse(JSON.stringify(address));
                if (Object.keys(obj.shipping).length != 0) {
                    if (validator.isvalid(obj.shipping.street)) {
                        profile['address']['shipping']['street'] = obj.shipping.street
                    }
                    if (validator.isvalid(obj.shipping.city)) {
                        profile['address']['shipping']['city'] = obj.shipping.city
                    }
                    if (validator.isvalid(obj.shipping.pincode)) {
                        profile['address']['shipping']['pincode'] = obj.shipping.pincode
                    }
                }
                if (Object.keys(obj.billing).length != 0) {
                    if (validator.isvalid(obj.billing.street)) {
                        profile['address']['billing']['street'] = obj.billing.street
                    }
                    if (validator.isvalid(obj.billing.city)) {
                        profile['address']['billing']['city'] = obj.billing.city
                    }
                    if (validator.isvalid(obj.billing.pincode)) {
                        profile['address']['billing']['pincode'] = obj.billing.pincode
                    }
                }
            }





            let updated = await userModel.findOneAndUpdate({_id:userId },{$set:profile},{ new: true })

            return res.status(200).send({ status: true, message: "data updated successfully", data: updated })

        } else {
            return res.status(404).send({ status: false, message: "authentication denied" })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}




module.exports.registration = registration
module.exports.loginUser = loginUser
module.exports.getUser = getUser
module.exports.updateUser = updateUser