const jwt = require('jsonwebtoken')

require('dotenv').config();
JWT_ADMINSECRET = process.env.JWT_ADMINSECRET;

function adminMiddleware(req, res, next) {
    const token = req.cookies.admin_access;
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
}

module.exports = { adminMiddleware: adminMiddleware } 