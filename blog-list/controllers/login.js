const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request,response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })

    const passwordCorrect = user === null ? false : await bcrypt.compare(password,user.passwordHash)

    if (!user || !passwordCorrect) {
        return response.status(400).json( {error:'Username and password incorrect.'} )
    }

    const tokenUser = {
        username:user.username,
        id:user._id
    }

    const token = jwt.sign(tokenUser,config.SECRET)
    response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter