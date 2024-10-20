const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { name:1, username:1, id:1 })
    response.json(blogs)
  })

blogRouter.get('/:id',async (request,response) => {
    const blog = await Blog.findById(request.params.id)
    response.status(200).json(blog)
})
  
blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user
  // const users = await User.find({})
  // const index = Math.floor(Math.random()*users.length)
  // const user = users[index]

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user:user._id
  })

  if (!blog.likes) {
    blog.likes = 0
  }
  if (!blog.title || !blog.url) {
    response.status(400).send()
  }
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request,response) => {
  logger.debug('id: ',request.params.id)

  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (user.id.toString() === blog.user.toString()) {
    await Blog.deleteOne(blog)
    response.status(204).json({ message:'Blog Deleted sucessfully '} )
  } else {
    response.status(401).json({ error:'User not authorized for this operation' })
  }
})

blogRouter.put('/:id',async (request,response) => {
  logger.debug('blg_req:',request.body)
  let body = request.body

  let blog = {
    title:body.title,
    author:body.author,
    url:body.url,
    likes:body.likes
  }
  logger.debug('blg_to_upd',blog)
  const updated = await Blog.findByIdAndUpdate(request.params.id,blog,{ new:true })
  response.status(200).json(updated)
})

module.exports = blogRouter