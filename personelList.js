let personel = require('./personels.json')

const getPersonel = (sicil) => {
    let index = personel.findIndex((c) => {
        return c.sicil === sicil
    })

    if (index > -1) {
        return personel[index]
    } else {
        return {}
    }
    
}

module.exports = {
    getPersonel
}