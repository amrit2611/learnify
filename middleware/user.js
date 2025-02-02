const jwt = require('jsonwebtoken')

require('dotenv').config();
JWT_USERSECRET = process.env.JWT_USERSECRET

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    const decoded = jwt.verify(token, JWT_USERSECRET);

    if (decoded) {
        req.userId = decoded.id;
        console.log("user authenticated")
        next();
    } else {
        return res.status(403).json({
            message: "Sign in to continue"
        })
    }
}


module.exports = { userMiddleware: userMiddleware }