const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('error: must provide password')
    console.log('usage: node mongo.js <password> <opt:name> <opt:number>')
    process.exit(1)
} else if (process.argv.length === 4) {
    console.log('error: must provide name AND number')
    console.log('usage: node mongo.js <password> <opt:name> <opt:number>')
    process.exit(1)
} else if (process.argv.length > 5) {
    console.log('error: too many arguments')
    console.log('usage: node mongo.js <password> <opt:name> <opt:number>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://kyliamiskell_db_user:${password}@cluster0.yhznngn.mongodb.net/phonebookApp?appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url, {family: 4})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}