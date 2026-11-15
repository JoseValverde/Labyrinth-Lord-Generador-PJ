// Función para asignar las tiradas más altas a las características principales
function asignarTiradasAPrincipales(tiradas, clase) {
    // Obtener las características principales de la clase, manejando múltiples características
    const caracteristicasPrincipales = clase.caracteristicaPrincipal.split(' y ').map(c => c.toLowerCase());

    // Ordenar las tiradas de mayor a menor
    const tiradasOrdenadas = Object.entries(tiradas).sort((a, b) => b[1] - a[1]);

    if (tiradasOrdenadas.length < caracteristicasPrincipales.length) {
        console.error("No hay suficientes tiradas para asignar a las características principales.");
        return tiradas;
    }

    // Asignar las tiradas más altas a las características principales
    caracteristicasPrincipales.forEach((caracteristica, index) => {
        if (tiradas[caracteristica] !== undefined && tiradasOrdenadas[index] !== undefined) {
            tiradas[caracteristica] = tiradasOrdenadas[index][1];
        }
    });

    // Asignar el resto de las tiradas a las características restantes
    const tiradasRestantes = tiradasOrdenadas.slice(caracteristicasPrincipales.length);
    let i = 0;
    for (let key in tiradas) {
        if (!caracteristicasPrincipales.includes(key)) {
            if (tiradasRestantes[i] !== undefined) {
                tiradas[key] = tiradasRestantes[i][1];
                i++;
            }
        }
    }

    return tiradas;
}


function tirarDados(numDados, caras) {
    return Array.from({ length: numDados }, () => Math.floor(Math.random() * caras) + 1)
                .reduce((a, b) => a + b, 0);
}


function generarCaracteristicas() {
    return {
        fuerza: tirarDados(3, 6),
        destreza: tirarDados(3, 6),
        constitucion: tirarDados(3, 6),
        inteligencia: tirarDados(3, 6),
        sabiduria: tirarDados(3, 6),  // Usar siempre "sabiduria" sin tilde
        carisma: tirarDados(3, 6)
    };
    console.log("Características generadas:", caracteristicas);
   
}

export { asignarTiradasAPrincipales, tirarDados, generarCaracteristicas };