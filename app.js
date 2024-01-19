const express = require('express')
// ==> Node contiene una biblioteca nativa como Crypto que permite asignar valores de IDs de manera automatica. (UUID = Universal Unique Identifier)
const crypto = require('node:crypto')
// ==> documentation ref (CORS problem -> archivo cors.txt): 2.
// ==> La biblioteca de cors funciona como middleware y lo que hace es solucionar todos los problema de CORS poniendo un *, es decir, permitiendo todos los origenes.
// const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies-schema')

// ===> DOCUMENTATION <===

// ==> check documentation in file app-js.txt

// ===> DOCUMENTATION <===


const app = express()
app.use(express.json()) // ==> documentation ref: 2.
// app.use(cors()) ==> documentation ref (CORS problem -> archivo cors.txt): 3.
app.disable('x-powered-by')

const ACCEPTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:1234'
]

app.get('/', (req, res) => {
  console.log('home')
  res.json({ message: 'Hola mundo' })
})

app.get('/movies', (req, res) => {
  console.log('return all movies')
  // ==> documentation ref (CORS problem -> archivo cors.txt): 1.
  // res.header('Access-Control-Allow-Origin', '*') ==> esto es lo que mas comunmente se ve y se hace.

  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.json(movies)
})

app.get('/movies/byID/:id', (req, res) => { // --> path-to-regexp (checkear info - express y react router usan las regexp de fondo)
  const { id } = req.params // --> el param que queramos tomar debe tener el mismo nombre que como lo definimos en la url luego de los :
  console.log('id', id)
  const movie = movies.find(movie => movie.imdbID === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.get('/movies/search', (req, res) => {
  const { genre, name } = req.query
  console.log('Request Query:', req.query)
  console.log('Genre:', genre)
  console.log('Name:', name)

  if (name) {
    // documentation ref: 1.
    const filteredMovies = movies.filter(movie => movie.Title.toLowerCase().includes(name.toLowerCase()))
    console.log('Filtered Movies:', filteredMovies)
    return res.json(filteredMovies)
  }
  if (genre) {
    const filteredMovies = movies.filter(movie => movie.Genre.toLowerCase().includes(genre.toLowerCase()))
    console.log('Filtered Movies:', filteredMovies)
    return res.json(filteredMovies)
  }

  console.log('Movies not found')
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies/createMovie', (req, res) => {
  // documentation ref: 2.
  const result = validateMovie(req.body)

  if (result.error) { // --> tambiem se puede utilizar result.success
    // documentation tip ref: 3.
    return res.status(400).json({ error: JSON.parse(result.error.message) }) // --> parse para visualizar errores en formato JSON, mas legibles.
  }

  // documentation important ref: 4.
  const newMovie = {
    id: crypto.randomUUID(), // --> creacion de un uuid v4 (Universal Unique Identifier)
    ...result.data
  }

  // IMPORTANTE: Esto no seria REST, porque estamos guardando el estado de la aplicacion en memoria.
  movies.push(newMovie)

  res.status(201).json(newMovie) // --> actualizar la cache del cliente
})

app.patch('/movies/patchMovie/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  console.log('movieID:', id)
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie // --> se guarda la pelicula actualizada en el indice

  return res.json({
    message: 'Movie updated succesfully',
    res: updatedMovie
  })
})

app.delete('/movies/deleteMovie/:id', (req, res) => {
  // ==> documentation ref (CORS problem -> archivo cors.txt): 2.
  const origin = req.header('origin')
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.imdbID === id)

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  console.log('Movie deleted') // movies[movieIndex].Title

  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/deleteMovie/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }

  res.send(200)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
