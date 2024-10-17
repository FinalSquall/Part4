const mongoose = require('mongoose')
const config = require('./utils/config')
const Blog = require('./models/blog')

mongoose.set('strictQuery',false)

let method = process.argv[2]
let name = process.argv[3]
let author = process.argv[4]

let nameNoWhitespace = name.replace(/\s/g,'')
let authorNoWhitespace = author.replace(/\s/g,'')

let url = `www.${nameNoWhitespace}_${authorNoWhitespace}.test`
let likes = Math.floor(Math.random()*20)

console.log(process.argv[2])
mongoose.connect(config.MONGODB_URI)
.then(() => {
  console.log('Successfully connected to mongo db at: ', config.MONGODB_URI)
})
.catch((err) => {
  console.log('failed to connect to mongo db: ',err)
})

if (method === 'GET') {
  Blog.find({}).then(result => {
    result.forEach(blog => {
      console.log(`${blog.title} ${blog.author}`)
    })
    mongoose.connection.close()
  })
} else if (method === 'POST') {
  console.log(config.MONGODB_URI)
  const blog = new Blog({
    title: name,
    author: author,
    url: url,
    likes: likes
  })

  blog.save().then(() => {
    console.log(`Added ${blog.title} written by ${blog.author} to the blog list`)
    mongoose.connection.close()
  })
}




