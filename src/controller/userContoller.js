const middlevalidator = require('../middleware/validation')
const userModel = require('../model/userModel')
const encryptpwd = require('encrypt-with-password');

const registration = async (res, req) => {
   try{ const data = req.body
    const filter = {}
    if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, message: "Please enter Data like firstname lastname" }) }

    const { fname, lname, email, profileImage, phone, password, address } = data
    if (!middlevalidator.isvalid(fname)) { return res.status(400).send({ status: false, massage: "please enter first name" }) }
    filter['fname'] = fname  
    if (!middlevalidator.isvalid(lname)) { return res.status(400).send({ status: false, massage: "please enter last name" }) }
    filter['lname'] = lname 
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
    filter['email'] = email 
    if (!middlevalidator.isvalid(profileImage)) {return res.status(400).send({ status: false, massage: "please upload profileImage" }) }
    
    const profilePic = req.files.profileImage
    let uploadedFileURL = await uploadFile(profilePic[0])
    filter['profilePic'] = uploadedFileURL


    if (!middlevalidator.isvalid(phone)) {return res.status(400).send({ status: false, massage: "please enter phone" }) }
    if(!middlevalidator.isValidPhone(phone)) {return res.status(400).send({ status: false, massage: "Enter Correct mobile Number" })}
    let mobileNumber = await userModel.findOne({phone:phone})
    if(mobileNumber) {return res.status(400).send({ status: false, massage: "mobile Number alrady exist" })}

    if (!middlevalidator.isvalid(password)) {return res.status(400).send({ status: false, massage: "please enter password" }) }
    const encrypted = encryptpwd.encrypt(password);
    filter['password'] = encrypted

    
    if (!middlevalidator.isvalid(address)) {return res.status(400).send({ status: false, massage: "please enter address" }) }
     const {shipping,billing} = address
     if(!middlevalidator.isvalid(shipping)) {return res.status(400).send({ status: false, massage: "please enter shipping address" })}
     if(!middlevalidator.isvalid(shipping.street)) {return res.status(400).send({ status: false, massage: "please enter street of shipping address" })}
     if(!middlevalidator.isvalid(shipping.city)) {return res.status(400).send({ status: false, massage: "please enter city of shipping address" })}
     if(!middlevalidator.isvalid(shipping.pincode)) {return res.status(400).send({ status: false, massage: "please enter pincode of shipping address" })}


     if(!middlevalidator.isvalid(billing)) {return res.status(400).send({ status: false, massage: "please enter billing address" })}
     if(!middlevalidator.isvalid(billing.street)) {return res.status(400).send({ status: false, massage: "please enter street of billing address" })}
     if(!middlevalidator.isvalid(billing.city)) {return res.status(400).send({ status: false, massage: "please enter city of billing address" })}
     if(!middlevalidator.isvalid(billing.pincode)) {return res.status(400).send({ status: false, massage: "please enter pincode of billing address" })}

     filter['address'] = address
     const createUser = await userModel.create(filter)
     return res.status(201).send({status:true , message:"User created successfully",data:createUser})
    }catch(err){
        return res.status(500).send({status:false,message:err.massage})
    }

    

}


module.exports.registration = registration