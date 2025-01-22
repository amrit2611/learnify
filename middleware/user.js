const jwt = require('jsonwebtoken')

require('dotenv').config();
JWT_USERSECRET = process.env.JWT_USERSECRET

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    const decoded = jwt.verify(token, JWT_USERSECRET);

    if (decoded) {
        req.userId = decoded.id;
        res.status(200).json({
            message: 'User Authenticated'
        })
        next();
    } else {
        res.status(403).json({
            message: "You are not signed in"
        })
    }
}


module.exports = { userMiddleware: userMiddleware }