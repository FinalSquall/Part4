const userRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const bcrypt = require('bcrypt')

userRouter.post("/", async (request,response) => {
    const { username, name, password } = request.body
    const saltRounds = 10

    if (!password || password.length < 1) {
        return response.status(400).json( {error:'Password Cannot be empty'} )
    }
    if (password.length < 3) {
        return response.status(400).json( {error:'Password must contain at least 3 characters'} )
    }

    const users = await User.find({})
    const userNameMatchingUser = users.filter(item => item.username === username) //Decided to implement unique username seperatly (sure it could get more complex as would be needed on put etc)
    if (userNameMatchingUser && userNameMatchingUser.length > 0) {
        return response.status(400).json( {error:'Username already exists. Please try another'} )
    }

    const passwordHash = await bcrypt.hash(password,saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

userRouter.get("/",async (request,response) => {
    const users = await User.find({}).populate('blogs',{ url:1, title: 1, author:1, id: 1 })
    response.status(200).json(users)
})

module.exports = userRouter