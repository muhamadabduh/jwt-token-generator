const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()
const args = process.argv.slice(2)
const jwt = require('jsonwebtoken')
const fs = require('fs')
const algorithm = process.env.JWT_ALG

const main = () => {
    const sub = args[0]
    const jti = uuidv4()
    const exp = args[1] || '8hr'
    const parsedExp = expandTimeString(exp)
    if(!parsedExp) {
        console.log(showInfo('Invalid unit'))
        return
    }
    const now = moment()
    const expiredDate = moment().add(parsedExp.amount, parsedExp.unit)

    const expUnix = expiredDate.unix()

    const data = Object.assign({}, {
        sub,
        jti,
        exp: expUnix,
        events: {
            'http://schemas.digitalservice.id/event/print-document-all-access': {},
        }
    })
    // console.log(typeof process.env.JWT_PRIVATE_KEY_STAGING)
    // const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY_STAGING, 'base64').toString('utf-8')
    const privateKey = fs.readFileSync('private.key')
    console.log(jwt.sign(data, privateKey, { algorithm: algorithm }))

}

function expandTimeString(input) {
    const timeUnits = {
        h: 'hour',
        m: 'minute',
        d: 'day'
    };

    const match = input.match(/(\d+)([hmd])/);

    if (!match) {
        return 0
    }

    const amount = match[1];
    const unit = match[2];

    if (!timeUnits[unit]) {
        return "Invalid unit";
    }

    return {
        amount,
        unit
    }
}

const showInfo = (err = null) => {
    const message = `
    ======HOW TO USE=======
    
    node index.js <subject> <expiration>
    
    note: 
    - subject : documentId
    - expiration: m => minute, h => hour, d => day. e.g : 1h, 15m, 30d


    `
    if(err) {
        return `Invalid Input! ${message}`
    }

    return message
}

main()