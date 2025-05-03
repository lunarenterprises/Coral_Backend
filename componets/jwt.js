const jwt = require('jsonwebtoken');

// JWT middleware
const verifyToken = (req, res, next) => {

    let authHeader = req.headers.authorization;

    var SECRET_KEY = process.env.JWT_SECRET_KEY

    if (!authHeader) {
        return res.status(401).send({ error: "No token provided" });
    }
    let token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: "Authentication failed: Invalid token" });
        }

        req.user = decoded
        next();
    });
};

module.exports = { verifyToken };
