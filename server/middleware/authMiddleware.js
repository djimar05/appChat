const jwt = require('jsonwebtoken');


const authMiddleware = function(req, res, next ){
    const authHeader = req.headers['authorization'];

    const JWT_SECRET = process.env.JWT_SECRET;
    console.log("JWT_SECRET", JWT_SECRET );
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
        success: false,
        message: 'Token manquant ou mal formaté.',
        });
    }

    const token = authHeader.split(' ')[1];
    console.log('token', token)

    try {
        console.log("Begin > jwt.verify")
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("After > jwt.verify")
        req.user = decoded;
        next();
    } catch (err) {

        console.log("erreur", err)
        return res.status(403).json({
        success: false,
        message: 'Token invalide ou expiré.',
        });
    }
}


module.exports.authMiddleware = authMiddleware;