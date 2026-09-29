require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('data', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

// ROUTES

app.get('/info', (request, response) => {
    const currTime = Date()
    Person.find({}).then( persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${currTime}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then( persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log("Checking if you sent a name...")
    // did you send a name?
    if (!body.name) {
        return response.status(400).json({
            error: 'Missing name field.'
        })
    }
    console.log("Checking if you sent a number...")
    // did you send a number?
    if (!body.number) {
        return response.status(400).json({
            error: 'Missing number field.'
        })
    }
    console.log("Checking if this is a duplicate name...")
    // is this a duplicate name?
    Person.findOne({ name: body.name })
        .then( existingPerson => {
            if (existingPerson) {
                return response.status(400).json({
                    error: 'Name must be unique.'
                })
            }
            const person = new Person({
                name: body.name,
                number: body.number,
            })
            person.save().then(savedPerson => {
                console.log("Save successful!")
                response.json(savedPerson)
            })
            .catch( error => {
                console.log("Uh-oh saving threw an error.")
                console.log(error.message)
                next(error)
            })
        })
        .catch(error => {
            console.log("Save failed with error: ", error)
            next(error)
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const { number } = request.body

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(404).end()
            }

            person.number = number

            return person.save().then(updatedPerson => {
                response.json(updatedPerson)
            })
            .catch(error => {
                console.log("Uh-oh saving threw an error.")
                console.log(error.message)
                next(error)
            })
        })
        .catch(error => next(error))
})

// UNKNOWN ENDPOINT

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// ERROR HANDLING

const errorHandler = (error, request, response, next) => {
    console.log("In error handler...")

    if (error.name === 'CastError') {
        console.log("It's a Cast Error")
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        console.log("It's a Validation Error")
        return response.status(400).json({ error: error.message })
    }
    console.log("It's an error we don't handle!")
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})