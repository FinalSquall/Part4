require('dotenv').config()

const info = (...params) => {
    if (process.env.NODE_ENV !== 'test') { 
        console.log(params)
    }
}

const error = (...params) => {
    if (process.env.NODE_ENV !== 'test') { 
        console.error(params)
    }
}

const debug = (...params) => {
    if (process.env.NODE_ENV === 'development-debug') {
        console.log(params)
    }
}

module.exports = {
    info,error,debug
}