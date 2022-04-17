const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')
const prodModel = require('../model/productModel')
const validator = require('../middleware/validation')
const { findOneAndUpdate, update } = require('../model/cartModel')


const createCart = async (req, res) => {
    try {

        const data = req.body
        const UserId = req.params.userId

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, meassage: "please enter data in body " })
        }
        if (req.decodedToken.UserId == UserId) {
            let prevCart = await cartModel.findOne({ userId: UserId })
            if (!prevCart || prevCart == null) {
                const pricearr = []
                const quantityArr = []
                let totalPriceOfProducts = 0
                let totalQualityOfProducts = 0
                const itemList = req.body.items
                for (let i = 0; i < itemList.length; i++) {
                    const productIds = itemList[i].productId
                    const productDetails = await prodModel.find({ _id: productIds })
                    const priceDetailsarray = productDetails[0].price
                    pricearr.push(priceDetailsarray)
                    const quantityarray = req.body.items[i].quantity
                    quantityArr.push(quantityarray)
                    // its always coming in a new array every time  
                }
                for (let j = 0; j < quantityArr.length; j++) {
                    totalPriceOfProducts += pricearr[j] * quantityArr[j]
                    totalQualityOfProducts += quantityArr[j]
                }
                req.body.totalPrice = totalPriceOfProducts
                req.body.totalItems = totalQualityOfProducts

                let cart = await cartModel.create(data)
                return res.status(201).send({ status: true, message: "cart data created successfully", data: cart })

            } else {
                 const filter = {}
            
                let requestpricearr = [] // store price of items
                let requestquantityArr = [] // store quantity of products
                let requesttotalPriceOfProducts = 0
                let requestQualityOfProducts = 0
                const itemList = req.body.items
                for (let i = 0; i < itemList.length; i++) {
                    const productIds = itemList[i].productId
                    const productDetails = await prodModel.find({ _id: productIds })
                    const priceDetailsarray = productDetails[0].price
                    requestpricearr.push(priceDetailsarray)
                    const quantityarray = req.body.items[i].quantity
                    requestquantityArr.push(quantityarray)
                    // its always coming in a new array every time  
                }
        
                
                for (let j = 0; j < requestquantityArr.length; j++) {
                    requesttotalPriceOfProducts += requestpricearr[j] * requestquantityArr[j]
                    requestQualityOfProducts += requestquantityArr[j]
                }
                updatedtotalPrice = prevCart.totalPrice + requesttotalPriceOfProducts
                filter['totalPrice'] = updatedtotalPrice
                
                updatedtotalItems = prevCart.totalItems + requestQualityOfProducts
                filter['totalItems'] = updatedtotalItems
                console.log(filter)

                let upCart = await cartModel.findOneAndUpdate({ userId:UserId }, {$push:{items:data.items},$set: filter}, { new: true })
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



module.exports.createCart = createCart