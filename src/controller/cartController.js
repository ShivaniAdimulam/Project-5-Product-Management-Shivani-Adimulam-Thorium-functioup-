const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')
const prodModel = require('../model/productModel')
const validator = require('../middleware/validation')
const { findOneAndUpdate, update } = require('../model/cartModel')


// const createCart = async (req, res) => {
//     try {

//         const data = req.body
//         const UserId = req.params.userId
//         for(let i=0;i<data.items;i++){
//             if(data.items[i].quantity == 0){
//                 return res.status(400).send({status:false, message:"enter valiald quality"})
//             }
//         }


//         if (Object.keys(data).length == 0) {
//             return res.status(400).send({ status: false, meassage: "please enter data in body " })
//         }
//         if (req.decodedToken.UserId == UserId) {
//             let prevCart = await cartModel.findOne({ userId: UserId })
//             if (!prevCart || prevCart == null) {
//                 const pricearr = []
//                 const quantityArr = []
//                 let totalPriceOfProducts = 0
//                 let totalQualityOfProducts = 0
//                 const itemList = req.body.items
//                 for (let i = 0; i < itemList.length; i++) {
//                     const productIds = itemList[i].productId
//                     const productDetails = await prodModel.findById(productIds)
//                     if (!productDetails) { return res.status(400).send({ status: false, message: "product not found" }) }
//                     const priceDetailsarray = productDetails.price
//                     pricearr.push(priceDetailsarray)
//                     const quantityarray = req.body.items[i].quantity
//                     quantityArr.push(quantityarray)
//                     // its always coming in a new array every time  
//                 }
//                 for (let j = 0; j < quantityArr.length; j++) {
//                     totalPriceOfProducts += pricearr[j] * quantityArr[j]
//                     totalQualityOfProducts += quantityArr[j]
//                 }
//                 req.body.totalPrice = totalPriceOfProducts
//                 req.body.totalItems = data.items.length

//                 let cart = await cartModel.create(data)
//                 return res.status(201).send({ status: true, message: "cart data created successfully", data: cart })

//             } else {
//                 const {items} = data
//                 console.log(items[0].productId)
//                 console.log(prevCart.items.productId)
//                  givenitems = data.items
//                 if(items[0].productId ==prevCart.items[0].productId ){

//                 }

//                 let upCart = await cartModel.findOneAndUpdate({ userId: UserId }, { $push: { items: data.items }, $set: filter }, { new: true })
//                 return res.status(200).send({ status: true, message: "cart data added successfully in a cart", data: upCart })
//             }
//         }
//         else {
//             return res.status(403).send({ status: false, message: "authorizatin denied" })
//         }


//     } catch (err) {

//         return res.status(500).send({ status: false, message: err.message })

//     }
// }

const createCart = async (req, res) => {
    try {

        const data = req.body
        const UserId = req.params.userId

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, meassage: "please enter data in body " })
        }

        if (!validator.isValidObjectId(UserId)) {
            return res.status(400).send({ status: false, message: "Enter valid UserId" })
        }


        if (req.decodedToken.UserId == UserId) {
            let prevCart = await cartModel.findOne({ userId: UserId })

            if (!prevCart || prevCart == null) {
                const { items } = data

                if (items.length == 0) {
                    return res.status(400).send({ status: false, message: "enter items to add" })
                }

                if (items[0].quantity < 0) {
                    return res.status(400).send({ status: false, message: "Enter valid quantity" })
                }

                let productId = items[0].productId

                let productDetails = await prodModel.findById(productId)
                if (!productDetails) {
                    return res.status(400).send({ status: false, message: "enter valiad product id" })
                }

                let totalValue = productDetails.price * items[0].quantity
                data.totalPrice = totalValue
                let totalItems = items.length
                data.totalItems = totalItems

                let cart = await cartModel.create(data)
                return res.status(201).send({ status: true, message: "cart data created successfully", data: cart })

            } else {
               let  newitems = prevCart.items
                let filter = {}
                const { items } = data
                if (items.length == 0) {
                    return res.status(400).send({ status: false, message: "enter items to add" })
                }

                if (items[0].quantity < 0) {
                    return res.status(400).send({ status: false, message: "Enter valid quantity" })
                }

                let productId = items[0].productId

                let productDetails = await prodModel.findById(productId)
                if (!productDetails) {
                    return res.status(400).send({ status: false, message: "enter valiad product id" })
                }

                let newQuanity = items[0].quantity
                let newPrice = productDetails.price * items[0].quantity

                for (let i = 0; i < prevCart.items.length; i++) {
                    if (productId == prevCart.items[i].productId) {
                        newitems[i].quantity = newQuanity + prevCart.items[i].quantity
                    } else {
                        newitems.push(items[0])
                    }
                }

                tatalvalue = prevCart.totalPrice + newPrice



                let upCart = await cartModel.findOneAndUpdate({ userId: UserId }, {$set:{items:newitems,totalPrice:tatalvalue,totalItems:newitems.length}}, { new: true })
                return res.status(200).send({ status: true, message: "cart data added successfully in a cart", data: upCart })
            }
        }
        else {
            return res.status(403).send({ status: false, message: "authorizatin denied" })
        }


    } catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }
}


// update api
const updateCart = async (req, res) => {
    try {

        let removeProduct = req.body.removeProduct
        let userId = req.params.userId
        let cartId = req.bodycartId
        let productId = req.body.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid productId" })
        }

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Enter valid cartId" })
        }

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter valid userId" })
        }

        if (req.decodedToken.UserId == userId) {
            if (removeProduct == 0) {

                let product = await cartModel.findById({ productId: productId })
                if (product) {
                    let productDelete = await cartModel.findOneAndDelete({ productId: productId })
                    //,{$pull:{productId:productId}})
                    return res.status(200).send({ status: true, message: "product deleted successfully from the cart" })
                }


            }

            if (removeProduct == 1) {

                let prod = await cartModel.findById({ productId: productId })

                if (prod) {
                    let reduceQuantity = await cartModel.findOneAndUpdate({ productId: productId }, { $inc: { quantity: -1 } }, { new: true })

                    return res.status(200).send({ status: true, message: "quqntity decremeted by 1 for given productId" })
                }



            }
        }



    } catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }
}





// get Api
let getCart = async function(req,res){
    try{

         let UserId = req.params.UserId
         console.log(UserId)


    if(!UserId){res.status(400).send({status:false,msg:"please provide UserId"})}
   

   let newData = await cartModel.findOne({userId:UserId})
   console.log(newData)

   const p_id = newData.item[0].productId
     console.log(p_id)
    
   if(Object.keys(newData).length===0){ res.status(400).send({status:false,msg:"CART NOT EXIST"})}


   if(req.decodedToken.UserId==UserId){

    let userData = await userModel.findById({_id:UserId})
    if(!userData){res.status(400).send({status:false,msg:"User Not exits"})}

    let productDetails = await productModel.find({_id:p_id}).select({productId:1,quantity:1})
    let productDetails2 = await productModel.findOne({_id:p_id}).select
    console.log(productDetails)
    
  let finalData={
      userId:newData.userId,
      items:productDetails,


  }


   }
}
   catch(err){res.status(500).send({msg:err.message})}
}




// Delete Api
const deleteCart = async function(req,res){
    try{
       let data = req.params.userId
    
       console.log(data)
    
       if(!data){return res.status(400).send({msg:"no"})}
    
       const checkCart = await cartModel.findOne({userId:data})
       if(!checkCart){res.send({msg:"cart not exists"})}
    
       
    
      
         if(req.decodedToken.userId==data){
         if(checkCart){ 
              
          let DeletedData =  await cartModel.findOneAndUpdate({userId:data},{ $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true }) 
    
              res.status(204).send({data:DeletedData})
    
          } else {res.status(404).send({msg:"User not found"})}
        } 
         }
        
        catch(err){ res.status(500).send({msg:err.message})}
        }

module.exports.createCart = createCart









