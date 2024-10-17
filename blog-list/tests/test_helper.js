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

function getTestBlog(withLikes,withTitle,withUrl) {
    const blog = {
        author:'Harry Potter',
    }
    if (withTitle) {
        blog.title = 'I am a wizard'
    }
    if (withUrl) {
        blog.url = 'www.hpiscool.test'
    }
    if (withLikes) {
        blog.likes = withLikes
    }
    return blog
}

module.exports = {
    initialData,initialUserData,getTestBlog
}