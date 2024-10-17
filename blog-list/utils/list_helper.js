const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

function totalLikes(blogs) {
    if (hasContent(blogs)) {
        return blogs.map(blog => blog.likes).reduce((c,v) => c+v)
    } else {
        return 0
    }
}

function favoriteBlog(blogs) {
    if (hasContent(blogs)) {
        let largest = blogs[0]
        blogs.forEach(blog => {
            if (blog.likes > largest.likes) {
                largest = blog
            }
        })
        return largest
    }
}

function mostBlogs(blogs) {
    //Using countBy and maxBy along with Object.keys. Most readable and concice
    let num = _.countBy(blogs,'author')
    return _.maxBy(_.sortBy(Object.keys(num)),k => num[k])

    // Using Filter and Reduce (could give better granularity for testing)
    // let copy = _.clone(blogs);
    // const mostFrequent = _.reduce(copy,(prev, curr) =>
    //     _.filter(blogs,(el => el.author === curr.author)).length > _.filter(blogs,(el => el.author === prev.author)).length ? curr : prev
    // )
    // return mostFrequent
}

function toJson(bl) {
    return {
        author:bl.author,
        likes:bl.likes
    }
}

function mostLikes(blogs) {
    let blogSorted = _.sortBy(blogs,['likes'])
    return blogSorted[blogSorted.length-1]
}

function hasContent(arr) {
    return typeof arr !== 'undefined' && arr.length > 0
}

module.exports = {
    dummy,totalLikes,favoriteBlog,mostBlogs,mostLikes
}