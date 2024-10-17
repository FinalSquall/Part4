const {test,beforeEach,after,describe} = require('node:test')
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
    
    const users = await User.find({})

    for (let user of users) {
        user.blogs = []
        await user.save()
    }
    
    testHelper.initialData.map(blog => new Blog(blog)) //If we try to use a regular forEach we would run into trouble with 
    for (let blog of testHelper.initialData) {         //async. beforeEach would not wait for the looped items to finish as the
        let users = await User.find({})
        let index = Math.floor(Math.random()*users.length)
        let blogItem = new Blog(blog)                //await calls inside the forEach are considered seperate
        blogItem.user = users[index]
        const savedItem = await blogItem.save()
        blogItem.user.blogs = blogItem.user.blogs.concat(savedItem._id)
        await blogItem.user.save()
    }
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
        const blog = testHelper.getTestBlog(3,true,true)
    
        await api.post('/api/blogs').send(blog).expect(201).expect('Content-Type',/application\/json/)
    
        const response = await api.get('/api/blogs')
    
        assert.strictEqual(response.body.length,testHelper.initialData.length+1)
        assert.deepStrictEqual(response.body[3].author,'Harry Potter')
        assert.strictEqual(response.body[3].likes,3)
    })
    
    test('if likes property is missing from post it will default to 0', async () => {
        let blog = testHelper.getTestBlog(undefined,true,true)
    
        await api.post('/api/blogs').send(blog).expect(201).expect('Content-Type',/application\/json/)
    
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length,testHelper.initialData.length+1)
        assert.strictEqual(response.body[3].likes,0)
    })
    
    test('if title is missing from request then return a bad request (400) http code', async () => {
        let blog = testHelper.getTestBlog(1,false,true)
    
        await api.post('/api/blogs').send(blog).expect(400)
    })
    
    test('if url is missing from request then return a bad request (400) http code', async () => {
        let blog = testHelper.getTestBlog(1,true,false)
    
        await api.post('/api/blogs').send(blog).expect(400)
    })
})

describe('delete tests', () => {
    test('confirm that data is deleted by delete operation', async () => {
        const blogs = await api.get('/api/blogs')
        const deleteId = blogs.body[0].id

        await api.delete(`/api/blogs/${deleteId}`).expect(204)

        const blogsAfterDelete = await api.get('/api/blogs')

        assert.strictEqual(blogsAfterDelete.body.length,blogs.body.length-1)
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
    await mongoose.connection.close()
})