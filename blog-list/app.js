const cors = require('cors')
const express = require('express')
require('express-async-errors') //Goes before route definitions. Used to remove the need to try/catch
const app = express()
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')

/*
    Example from the material for use of express-async-errors

    notesRouter.delete('/:id', async (request, response, next) => {
    try {
        await Note.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
    })

    Becomes

    notesRouter.delete('/:id', async (request, response) => {
    await Note.findByIdAndDelete(request.params.id)
    response.status(204).end()
    })

    Where the lib forwards the error to the middleware behind the scenes
*/

mongoose.set('strictQuery', false)
mongoose.connect(config.MONGODB_URI)
.then(() => {
    logger.info('Successfully connected to mongo db')
})
.catch((err) => {
    logger.error('failed to connect to mongo db: ',err)
})

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.use(middleware.getTokenFrom)

app.use('/api/login',loginRouter)
app.use('/api/blogs',blogRouter)
app.use('/api/users',userRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app