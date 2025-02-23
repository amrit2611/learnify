const jwt = require('jsonwebtoken')

require('dotenv').config();
JWT_ADMINSECRET = process.env.JWT_ADMINSECRET;

function adminMiddleware(req, res, next) {
    const token = req.cookies.admin_access;
    if (!token) {
        return res.status(403).json({
            message: "sign in to continue"
        })
    } else {
        try {
            const decoded = jwt.verify(token, JWT_ADMINSECRET);
            if (decoded) {
                req.adminId = decoded.id;
                console.log("User authenticated")
                next();
            } else {
                res.status(403).json({
                    message: "You are not signed in"
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

module.exports = { adminMiddleware: adminMiddleware } 