const orderModel = require('../model/orderModel')
const cartModel  = require('../model/cartModel')
const validate = require('../middleware/validation')


const createOrder = async (req,res) => {
    try{
        let data=req.body
        let Userid= req.params.userId

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, meassage: "please enter data in body " })
        }

        if(req.decodedToken.userId=Userid){
            let user= await userModel.findById({_id:Userid})
            if(user){
                
                const itemList = req.body.items
               

                let totalitem=[]
                const quantityArr = []

                for(let i=0;i<itemList.length;i++){
                    const prodid=req.body.items[i].productId

                    const quantityarray = req.body.items[i].quantity
                    quantityArr.push(quantityarray)

                    if(!totalitem.includes(prodid)){
                        totalitem.push(prodid)
                    }
                }

                let totalpri=0
                let prodPrice= await productModel.find({_id:items[i].productId})
                for(i=0;i<prodPrice.length;i++){
                totalpri= totalpri + prodPrice.price}


                req.body.totalPrice=totalpri
                req.body.totalItems=totalitem.length
                req.body.totalQuantity=quantityArr.length

               let order=await orderModel.create(data)

               return res.status(200).send({status:true,message:"order created succefully",data:order})

            }
        }

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}






const UpdateOrder = async function(req,res){


    let data = req.params.userId
    let OrderId = req.body.orderId

    console.log(data)
  

    if(!validate.isvalid(data)){return res.status(400).send({status:"false"},{msg:"please provide valid userId"})}
    if(!validate.isValidObjectId(OrderId)){return res.status(400).send({status:"false"},{msg:"please provide  valid OrderId"})}



    const cartExist = await cartModel.findById({userId:data})
    console.log(cartExist)
    if(!cartExist) { return res.status(400).send({ status: false, message: "No Cart Exist with This User" })}

    let findOrder = await orderModel.findById({_id:OrderId})
    console.log(findOrder)


    
   

   if(req.headers.Authentication===data){

    if (userId != findOrder.userId) { return res.status(400).send({ status: false, message: "User is not valid With this order" })};

    if(findOrder.cancellable === true && findOrder.status === "pending" ){

    let updateData = await orderModel.findOneAndUpdate({userId:data},{$set:{status:"cancelled"}},{new:true})
       
    return res.status(200).send({status: false,message: "Succesfully Cancled Order",data:updateData});



    }
    
  }
}
module.exports.UpdateOrder=UpdateOrder




















