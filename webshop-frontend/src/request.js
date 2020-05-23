

import request from 'request'


export default async function request2(obj) {
    return new Promise((resolve, reject) => {
        let callback = (error, response) => {
            if (error) return reject(error)

            return resolve(response)
        }
        request(obj, callback)
    })
}