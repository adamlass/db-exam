import shortid from "short-id"

const SHORT_LENGTH = 16
const LONG_LENGTH = 32

class GenUniqueID {
    initiated = false

    constructor() {
        // Check if unique id5
        if (!GenUniqueID.initiated) {
            console.info('Initiated GenUniqueID')

            shortid.configure({         // The length of the id strings to generate
                algorithm: 'sha256',  // The hashing algoritm to use in generating keys
                salt: Math.random   // A salt value or function
            })

            GenUniqueID.initiated = true
        }

    }

    short = () => {
        shortid.configure({
            length: SHORT_LENGTH
        })
        return shortid.generate()
    }

    long = () => {
        shortid.configure({
            length: LONG_LENGTH
        })
        return shortid.generate()
    }
}

const obj = new GenUniqueID()

export const short = obj.short
export const long = obj.long

export default obj