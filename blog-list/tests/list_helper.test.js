const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const _ = require('lodash')

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 17,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676654765876",
    title: "Some noice stuff",
    author: "Buddy Holly",
    url: "mylink.fakelinks.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

const singleBlogOb = {
  _id: "5a422a851b54a676234d17f7",
  title: "React patterns",
  author: "Michael Chan",
  url: "https://reactpatterns.com/",
  likes: 7,
  __v: 0
}

const singleBlog = [singleBlogOb]

describe('dummy', () => {
  test('dummy returns one', () => {
    const blogs = []
    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  })
})


describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(singleBlog)
    assert.strictEqual(result, 7)
  })
  test('when list has many blogs, equals the sum of them', () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 53)
  })
  test('when list is empty equals 0', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })
})

describe('favorite_blog', () => {
  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.favoriteBlog(singleBlog)
    assert.deepStrictEqual(result.title, 'React patterns')
  })
  test('when list has many blogs finds any one of the most liked blogs', () => {
    const result = listHelper.favoriteBlog(blogs)
    let possibleMatches = ['Some noice stuff','Canonical string reduction']
    assert.strictEqual(true,possibleMatches.filter(m => result.title === m).length > 0)
  })
  test('when list is empty equals obviously nothing', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, undefined)
  })
})

describe('most_blogs', () => {
  test('when list has only one blog, equals the author of that blog', () => {
    const result = listHelper.mostBlogs(singleBlog)
    assert.deepStrictEqual(result,'Michael Chan')
  })
  test('when list has many blogs, returns the author who wrote the most blogs in the list', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.strictEqual(result,'Robert C. Martin')
  })
  test('when list has many blogs, returns the author who wrote the most blogs in the list with an altered list',() => {
    const copy = _.clone(blogs)
    
    copy.push(singleBlogOb,singleBlogOb,singleBlogOb,singleBlogOb,singleBlogOb)

    const result = listHelper.mostBlogs(copy)
    assert.strictEqual(result,'Michael Chan')
  })
  test('when list has many blogs, and same count for max author, returns the first author alphabetically from the possible matches',() => {
    const copy = _.clone(blogs)
    
    copy.push(singleBlogOb,singleBlogOb) //Makes 3 Michael Chan

    const result = listHelper.mostBlogs(copy)
    assert.strictEqual(result,'Michael Chan') 
  })
  test('when list is empty return nothing', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, undefined)
  })
})

describe('most_likes', () => {
  test('when list has only one blog, equals the number of likes of that blog', () => {
    const result = listHelper.mostLikes(singleBlog)
    assert.deepStrictEqual(result.likes,7)
  })
  test('when list has many blogs, returns the blog with the most likes', () => {
    const result = listHelper.mostLikes(blogs)
    assert.strictEqual(result.likes,17)
  })
  test('when list has many blogs, returns the blog with the most likes with an altered list',() => {
    const copy = _.clone(blogs)
    
    copy.push(singleBlogOb,singleBlogOb,singleBlogOb,singleBlogOb,singleBlogOb)

    const result = listHelper.mostLikes(copy)
    assert.strictEqual(result.likes,17)
  })
  test('when list has many blogs, and same count for max likes, returns one of the possible blogs',() => {
    const copy = _.clone(blogs)
    
    copy.push(singleBlogOb,singleBlogOb) //Makes 3 Michael Chan

    const result = listHelper.mostLikes(copy)
    console.log('result: ', result)
    assert.strictEqual(result.likes,17) 
  })
  test('when list is empty return nothing', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, undefined)
  })
})