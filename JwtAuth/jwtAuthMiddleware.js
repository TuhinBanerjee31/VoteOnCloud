const jwt = require('jsonwebtoken');


//FUNC THAT VERIFY VIA JWT TOKEN FOR AUTHENTICATION AND AUTHORIZATION
const jwtAuthMiddleware = (req, res, next) => {

    //CHECKING WHETHER THE REQUEST HEADERS HAS AUTHORIZATION OR NOT
    const authorization = req.headers.authorization
    if (!authorization) return res.status(401).json({ error: "Token Not Found" });

    //EXTRACTING JWT TOKEN FROM THE REQUEST HEADERS
    const token= req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {

        //VERIFYING THE JWT TOKEN
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        //ATTACHING USER INFO TO THE REQUEST OBJECT (SERVER)
        req.userPayload = decoded
        next();

    } catch (error) {
        console.log("jwtAuth => jwtAuthMiddleware => Error: ", error);
        res.status(401).json({ error: 'Invalid Token' })
    }

}

module.exports = jwtAuthMiddleware