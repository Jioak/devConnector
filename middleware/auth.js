
const jwt = require('jsonwebtoken');


const { check, validationResult } = require('express-validator');


module.exports = function(req,res,next) {

    //get token from header
    const token=req.header('x-auth-token')

    if(!token){
        return res.status(401).json({
            msg:'No token,authorization denied'
        })
    }

    //verify token
    try {
        const decoded=jwt.verify(token,process.env.jwtSecret);
        req.user=decoded.user
        next()
    } catch (error) {

        res.status(401).json({
            msg:'Token is not valid'
        })
        
    }


};
