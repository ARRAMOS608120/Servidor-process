const faker = require('faker');

faker.locale = 'es';

const listarProductos = () => {
    const productos = []
    let prod;
    for (let i = 0; i<5; i++) {
        prod = {
         title: faker.commerce.product(),
         price: faker.commerce.price(),
         thumbnail:  faker.image.image()
        }
        productos.push(prod);
    }
    return productos;
};

module.exports = listarProductos
  