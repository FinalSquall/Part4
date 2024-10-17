const {test,beforeEach,after,describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testHelper = require('./test_helper')

const api = supertest(app)

const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})

    testHelper.initialUserData.map(user => new User(user))
    for (let user of testHelper.initialUserData) {
        let userItem = new User(user)
        await userItem.save()
    }
})

describe('happy path post validation', () => {
    test('User can be saved successfully with post operation', async () => {
        let user = {
            name:'Ron Weasley',
            username:'RWeas',
            password:'test'
        }
        await api
            .post('/api/users')
            .send(user)
            .expect(201)

        const users = await api.get('/api/users')
        assert.strictEqual(users.body.length,testHelper.initialUserData.length+1)
        assert.deepStrictEqual(users.body.filter(u => u.name === 'Ron Weasley')[0].username,'RWeas')
    })
})

describe('test user post validation is working', () => {
    test('if empty password or password with length < 3 then validation errors are thrown with a 400 status', async () => {
        let user = {
            name:'Ron Weasley',
            username:'RWeas',
        }
        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)
        assert.match(result.body.error,/Cannot be empty/)

        user.password = 'ar'
        const lengthTwoPassResult = await api.post('/api/users').send(user).expect(400)
        assert.match(lengthTwoPassResult.body.error,/must contain at least 3 characters/)
    })

    test('if empty username or username with length < 3 then validation errors are thrown with a 400 status', async () => {
        let user = {
            name:'Ron Weasley',
            password:'test'
        }
        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)
        assert.match(result.body.error,/username.*is required/)

        user.username = 'rw'
        const lengthTwoPassResult = await api.post('/api/users').send(user).expect(400)
        assert.match(lengthTwoPassResult.body.error,/rw.* is shorter than the minimum allowed length.*3/)
    })
})

after(async () => {
    await mongoose.connection.close()
})