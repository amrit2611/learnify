const jwt = require('jsonwebtoken')

require('dotenv').config();
JWT_USERSECRET = process.env.JWT_USERSECRET

function userMiddleware(req, res, next) {
    const token = req.cookies.access;
    if (!token) {
        return res.status(403).json({
            message: "sign in to continue"
        })
    } else {
        try {
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
        } catch (err) {
            return res.status(500).json({
                message: "error while authenticating",
                error: err.message
            })
        }
    }
}


module.exports = { userMiddleware: userMiddleware }