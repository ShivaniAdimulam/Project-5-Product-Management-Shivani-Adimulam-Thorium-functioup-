const jwt = require('jsonwebtoken')

const authentication = async function (req, res, next) {
    try {
        const token = req.headers.authorization;
        console.log(token)
        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }
        const decoded = await jwt.verify(token, 'privatekey')
        if (decoded) {
            req.decodedToken = decoded
            console.log(req.decodedToken)
        }
        else {
            return res.status(403).send({ status: false, msg: "invalid authentication token" })
        }
        next()

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.authentication = authentication