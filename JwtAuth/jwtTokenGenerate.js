const jwt = require('jsonwebtoken');

//FUNC TO GENERATE JWT TOKEN
const jwtTokenGenerate = (userData) => {
    return jwt.sign(userData, process.env.SECRET_KEY);
}

module.exports = jwtTokenGenerate;