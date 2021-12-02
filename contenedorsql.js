const knexLib = require('knex');

class ContenedorSql {
    constructor(config) {
      this.knex = knexLib(config)
    }
  
    crearTablaProductos() {
          return this.knex.schema.createTable('productos', table => {
            table.string('title', 50).notNullable();
            table.integer('price', 10).notNullable();
            table.string('thumbnail',240).notNullable();
            table.increments('id').primary();
          })
        }
    
    crearTablaMensajes() {
          return this.knex.schema.createTable('mensajes', table => {
            table.string('autor', 50).notNullable();
            table.datetime('fyh');
            table.string('texto', 10).notNullable();
            table.increments('id').primary();
          })
        }
    
  
    insertarProducto(producto) {
      return this.knex('productos').insert(producto)
    }

    insertarMensaje(mensaje) {
        return this.knex('mensajes').insert(mensaje)
      }
    
    listarProductos() {
      return this.knex('productos').select('*')
    }

    listarMensajes() {
        return this.knex('mensajes').select('*')
      }

     
  }
  
  module.exports = ContenedorSql