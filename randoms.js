const calculo = (cantidad) => {
    let numeros = {}
    for (let i = 0; i < cantidad; i++) {
        let azar = Math.floor(Math.random() * 1000) + 1
        if (numeros[azar]){
            numeros[azar]++;
        }else{
            numeros[azar] = 1
        }
    }
    return numeros
}
process.on('message', msg => {
    const lista = calculo(msg)
    process.send(lista)
    process.exit()
})
