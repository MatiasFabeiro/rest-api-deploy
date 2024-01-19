
// Zod es una biblioteca de validación y declaración de esquemas basada en TypeScript.
// Nos permitira manejar el tipado para backend, ya que typescript no puede hacerlo porque deberia ser un lenguaje interpretado (de ejecucion) y no de compilacion.
const z = require('zod')


// ==> DOCUMENTATION <==

// 1. Creamos un esquema de objeto para integrar las validaciones, hay muchos tipos de validaciones, por invalid_type_error (tipo invalido),
// required_error (el campo es requerido), tambien podemos ser mas especificos y podriamos decirle a zod que queremos que valide que un numero, por ejemplo,
// deba ser un numero (number()), pero que tambien sea entero (int()), que ademas sea numero positivo (positive()) o podria ser negativo (negative()) y quedaria algo
// asi:

// ==> year: z.number().int().positive()

// Tambien podriamos querer un rango de numeros pero para esto ya podriamos quitar el positive() dado que ya estamos especificando el rango:

// ==> year: z.number().int().min(1900).max(2024)

// Otra validacion interesante es que tenemos la forma de comprobar si un campo debe ser una URL (url()), e incluso podemos agregarle una validacion para
// poder comprobar con que extension termina la url (endsWith()), ej:

// ==> poster: z.string().url().endsWith('.jpg')

// Otra tambien es la de que un dato sea opcional (optional()), que pueda definirse como null (nullable()) o que tenga un valor por defecto, por si
// nosotros no lo asignamos, o mezclar todo en uno siempre que sea posible, ej:

// ==> rate: z.number().min(0).max(10).optional()
// ==> rate: z.number().min(0).max(10).nullable()
// ==> rate: z.number().min(0).max(10).default(0)
// ==> rate: z.number().min(0).max(10).optional().nullable().default(0)

// Estas son las VALIDACIONES CORRECTAS que tenemos que utilizar para que nuestra API tenga una estructura/seguridad robusta, dado que una api deberia permitir
// que se le envie cualquier informacion pero que no se caiga cada 2 por 3 por falta de seguridad o validaciones.


// 2. En este caso podemos utilizar un safeParse ya que es mucho mas sencillo a la hora de manejar la respuesta, utilizando un parse comun tendriamos que
// manejar la respuesta con un try/catch, mientras que con el safeParse lo que logramos es que se parsee todo y si hay algun problema, nos devuelve el error,
// en caso de que todo este correct, nos devuelve la data, por lo que podemos manejar todo con un if.

// ==> Tambien podemos utilizar un --> safeParseAsync() <-- para que la consulta vaya por detras y no bloquee el proceso hasta que se resuelva.


// 3. Lo que hace partial() es convertir, en esa consulta, a todos los campos en opcionales. Esto nos permite poder modificar los campos que queramos sin preocuparnos
// de si tenemos que enviar todos o no, es decir, podemos enviar desde 1 a todos.


// ==> DOCUMENTATION <==


// documentation ref: 1.
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required. Please, check url...'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (object) {
  // documentation ref: 2.
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  // documentation ref: 3.
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
