const {test,before,beforeEach,after,describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testHelper = require('./test_helper')
const User = require('../models/user')

/*
    The test imports the Express application from the app.js 
    module and wraps it with the supertest function into a so-called 
    superagent object. 
    This object is assigned to the api variable and tests can use it for making HTTP requests to the backend.
*/
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await testHelper.setupUsers()
    await testHelper.setupBlogs()
})

describe('get and get json data validation', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/) //\ is escaping the required '/' so that it is not interpreted as regex terminator (/ is regex start&end char)
    })

    test('get blog by id', async () => {
        const blogs = await api.get('/api/blogs')

        const blogSingle = await api.get(`/api/blogs/${blogs.body[1].id}`).expect(200)
        assert.deepStrictEqual(blogSingle.body.author,blogs.body[1].author)
    })
    
    test('blogs contain element id (not db _id)', async () => {
        const response = await api.get('/api/blogs')
        assert(response.body[0].id,'Should have an id value')
        assert(!response.body[0]._id,'Should not have _id set')
    })
})

describe('post and post data validation', () => {
    test('blog can be added to the system sucessfully', async () => {
        const blog = testHelper.getNewBlog()
        const loginResponse = await api.post('/api/login').send(testHelper.getAuthenticatedUserCredential())

        await api.post('/api/blogs').set(testHelper.buildBearerHeader(loginResponse)).send(blog).expect(201).expect('Content-Type',/application\/json/)
    
        const response = await api.get('/api/blogs')

        const newAddedItem = response.body.find(blg => blg.author === testHelper.getNewBlog().author)
    
        assert.strictEqual(response.body.length,testHelper.initialData.length+1)
        assert.deepStrictEqual(newAddedItem.author,testHelper.getNewBlog().author)
        assert.strictEqual(newAddedItem.likes,11)
    })

    test('blog fails with 401 if no token provided', async () => {
        const blog = testHelper.getNewBlog()

        await api.post('/api/blogs').send(blog).expect(401)
    })
    
    test('if likes property is missing from post it will default to 0', async () => {
        const blog = testHelper.getNewBlog()
        const loginResponse = await api.post('/api/login').send(testHelper.getAuthenticatedUserCredential())

        delete blog.likes
    
        await api.post('/api/blogs').set(testHelper.buildBearerHeader(loginResponse)).send(blog).expect(201).expect('Content-Type',/application\/json/)
    
        const response = await api.get('/api/blogs')
        const newAddedItem = response.body.find(blg => blg.author === testHelper.getNewBlog().author)

        assert.strictEqual(response.body.length,testHelper.initialData.length+1)
        assert.strictEqual(newAddedItem.likes,0)
    })
    
    test('if title is missing from request then return a bad request (400) http code', async () => {
        const blog = testHelper.getNewBlog()
        const loginResponse = await api.post('/api/login').send(testHelper.getAuthenticatedUserCredential())

        delete blog.title
    
        await api.post('/api/blogs').set(testHelper.buildBearerHeader(loginResponse)).send(blog).expect(400)
    })
    
    test('if url is missing from request then return a bad request (400) http code', async () => {
        const blog = testHelper.getNewBlog()
        const loginResponse = await api.post('/api/login').send(testHelper.getAuthenticatedUserCredential())

        delete blog.url
    
        await api.post('/api/blogs').set(testHelper.buildBearerHeader(loginResponse)).send(blog).expect(400)
    })
})

describe('delete tests', () => {
    test('blog can be succesfully deleted by delete operation if authorization is provided', async () => {
        const blog = testHelper.getNewBlog()
        const loginResponse = await api.post('/api/login').send(testHelper.getAuthenticatedUserCredential())
        
        const users = await User.find({})
        const authUser = users.find(user => user.username === testHelper.getAuthenticatedUser().username)
        blog.user = authUser._id

        const postedItem = await api.post('/api/blogs').set(testHelper.buildBearerHeader(loginResponse)).send(blog)
        const blogsAfterPost = await api.get('/api/blogs')

        assert.strictEqual(blogsAfterPost.body.length,testHelper.initialData.length+1)

        const deleteId = postedItem.body.id
        await api.delete(`/api/blogs/${deleteId}`).set(testHelper.buildBearerHeader(loginResponse)).expect(204)
        const blogsAfterDelete = await api.get('/api/blogs')

        assert.strictEqual(blogsAfterDelete.body.length,testHelper.initialData.length)
    })

    test('confirm that a different user cannot delete the blog if they do not own it', async () => {
        const blog = testHelper.getNewBlog()
        const authResponse = await api.post('/api/login').send(testHelper.getAuthenticatedUserCredential())
        const users = await User.find({})
        const authUser = users.find(user => user.username === testHelper.getAuthenticatedUser().username) //Still assign the blog to the correct user, but                                      
        blog.user = authUser._id                                                                          //The login token was fetched for a different user

        const postedItem = await api.post('/api/blogs').set(testHelper.buildBearerHeader(authResponse)).send(blog)
        const blogsAfterPost = await api.get('/api/blogs')

        assert.strictEqual(blogsAfterPost.body.length,testHelper.initialData.length+1)

        const notAuthResponse = await api.post('/api/login').send(testHelper.getNotAuthorizedUserCredential())

        const deleteId = postedItem.body.id
        const resp = await api.delete(`/api/blogs/${deleteId}`).set(testHelper.buildBearerHeader(notAuthResponse)).expect(401)
        
        assert.match(resp.body.error,/User not authorized for this operation/)
    })
})

describe('put tests', () => {
    test('confirm that data is updated successfully by put operation', async () => {
        const blogs = await api.get('/api/blogs')
        
        const id = blogs.body[0].id
        const body = blogs.body[0]
        let blog = {
            author:'Coolguyb',
            title:body.title,
            url:body.url,
            likes:body.likes
        }

        const updated = await api.put(`/api/blogs/${id}`).send(blog)

        const fromGet = await api.get(`/api/blogs/${id}`)

        assert.strictEqual(updated.body.author,blog.author)

        assert.strictEqual(fromGet.body.author,blog.author)
    })
})

after(async () => {
    await testHelper.tearDownBlogs()
    await testHelper.tearDownUsers()
    await mongoose.connection.close()
})