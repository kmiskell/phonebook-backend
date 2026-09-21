const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

morgan.token('data', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    currTime = Date()
    numPersons = persons.length
    response.send(`<p>Phonebook has info for ${numPersons} people</p><p>${currTime}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }    
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 100000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    // did you send a name?
    if (!body.name) {
        return response.status(400).json({
            error: 'Missing name field.'
        })
    }
    // did you send a number?
    if (!body.number) {
        return response.status(400).json({
            error: 'Missing number field.'
        })
    }
    // is this a duplicate name?
    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: 'Name must be unique.'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})