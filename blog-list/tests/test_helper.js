const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')

const initialData = [
    {
        title: 'How to beat Jecht',
        author: 'Tidus',
        url: 'www.HowtobeatJecht_Tidus.test',
        likes: 1,
    },
    {
        title: 'How to ride chocobos',
        author: 'Zidane',
        url: 'www.Howtoridechocobos_Zidane.test',
        likes: 12,
    },
    {
        title: 'How to say Enough b',
        author: 'Auron D',
        url: 'www.HowtosayEnoughb_AuronD.test',
        likes: 3,
    }
]

const initialUserData = [
    {
        "username": "bbtest",
        "name": "Ben Breaking",
        "password": "firefly"
    },
    {
        "username": "jmase",
        "name": "Jay Mase",
        "password":"what"
    },
    {
        "username": "hpotter",
        "name": "Harry Potter",
        "password":"malfoy"
    }
]

async function setupUsers() {
    await User.deleteMany({})
    const saltRounds = 10
    initialUserData.map(user => new User(user))
    for (let user of initialUserData) {
        let userItem = new User(user)
        userItem.passwordHash = await bcrypt.hash(user.password,saltRounds)
        await userItem.save()
    }
}

async function tearDownUsers() {
    await User.deleteMany({})
}

async function tearDownBlogs() {
    await Blog.deleteMany({})
}

async function setupBlogs() {
    await Blog.deleteMany({})
    initialData.map(blog => new Blog(blog))
    for (let blog of initialData) {
        let blogItem = new Blog(blog)
        await blogItem.save()
    }
}

function getNewBlog() {
    return {
        title: 'How to write a test',
        author: 'Some Legend',
        url: 'www.agreattestwriter.test',
        likes: 11,
    }
}

function getAuthenticatedUserCredential() {
    const cred = {
        username:getAuthenticatedUser().username,
        password:getAuthenticatedUser().password
    }
    return cred
}

function getNotAuthorizedUserCredential() {
    const cred = {
        username:getNotAuthorizedUser().username,
        password:getNotAuthorizedUser().password
    }
    return cred
}

function getAuthenticatedUser() {
    return initialUserData[0]
}

function getNotAuthorizedUser() {
    return initialUserData[1]
}

function buildBearerHeader(response) {
    return {
        Authorization: 'Bearer '+response.body.token
    }
}

module.exports = {
    initialData,initialUserData,getAuthenticatedUserCredential,getNotAuthorizedUserCredential,setupUsers,
    getNewBlog,setupBlogs,tearDownBlogs,tearDownUsers,getAuthenticatedUser,getNotAuthorizedUser,buildBearerHeader
}