// Función para obtener los modificadores según la característica
function obtenerModificador(valorCaracteristica, datos) {
    if (typeof valorCaracteristica === 'undefined' || valorCaracteristica === null) {
        console.error(`Error: Valor de característica no válido: ${valorCaracteristica}`);
        return {
            fuerza: 0,
            constitucion: 0,
            destreza: 0,
            inteligencia: 0,
            sabiduria: 0,
            carisma: {
                reaccion: 0,
                servidores: 0,
                moral: 0
            }
        }; // Devuelve un objeto vacío para evitar el error
    }

    const ordenModificadores = datos.modificadores.atributos_orden;
    const valoresModificador = datos.modificadores[valorCaracteristica.toString()];

    if (!valoresModificador) {
        console.error(`No se encontró el valor de modificador para la característica: ${valorCaracteristica}`);
        return null;
    }

    const modificador = {
        fuerza: valoresModificador[ordenModificadores.indexOf("fuerza")],
        constitucion: valoresModificador[ordenModificadores.indexOf("constitucion")],
        destreza: valoresModificador[ordenModificadores.indexOf("destreza")],
        inteligencia: valoresModificador[ordenModificadores.indexOf("inteligencia")],
        sabiduria: valoresModificador[ordenModificadores.indexOf("sabiduria")],
        carisma: {
            reaccion: valoresModificador[ordenModificadores.indexOf("carisma_reaccion")],
            servidores: valoresModificador[ordenModificadores.indexOf("carisma_servidores")],
            moral: valoresModificador[ordenModificadores.indexOf("carisma_moral")]
        }
    };
    
    return modificador;
}

// Función para validar y ajustar las características según los requisitos de la clase
function cumpleRequisitosYajustar(clase, caracteristicas) {
    if (!clase.requisitos || clase.requisitos === "") return true;

    const requisitos = clase.requisitos.split(", ");
    let cumple = true;

    const caracteristicaMap = {
        "FUE": "fuerza",
        "DES": "destreza",
        "CON": "constitucion",
        "INT": "inteligencia",
        "SAB": "sabiduria",
        "CAR": "carisma"
    };

    for (let requisito of requisitos) {
        const [caracteristicaAbreviada, valorRequerido] = requisito.split(" ");
        const caracteristica = caracteristicaMap[caracteristicaAbreviada];
        const valorRequeridoInt = parseInt(valorRequerido);

        if (caracteristicas[caracteristica] < valorRequeridoInt) {
            caracteristicas[caracteristica] = 18;
            cumple = false;
        }
    }

    return cumple;
}

// Función para generar un nivel aleatorio entre 1 y 10
function generarNivel() {
    return Math.floor(Math.random() * 10) + 1;
}

// Generar alineamiento aleatorio
function generarAlineamiento(datos) {
    const alineamientos = datos.alineamientos.map(al => al.tipo);
    const alineamientoAleatorio = alineamientos[Math.floor(Math.random() * alineamientos.length)];
    return alineamientoAleatorio;
}

// Generar nombre y apodo según clase y sexo
function generarNombreYApodo(clase, sexo, datos) {
    const claveNombreClase = `${clase}_${sexo}`;
    const { nombre, apodo } = datos.Nombre_clase_y_sexo[claveNombreClase];
    const nombreAleatorio = nombre[Math.floor(Math.random() * nombre.length)];
    const apodoAleatorio = apodo[Math.floor(Math.random() * apodo.length)];
    return { nombreAleatorio, apodoAleatorio };
}

// Función para obtener la experiencia asociada al nivel actual y el siguiente nivel
function obtenerExperienciaPorNivel(clase, nivel) {
    // Verifica que la clase tiene el array de nivel_experiencia
    if (!clase.nivel_experiencia || !Array.isArray(clase.nivel_experiencia)) {
        console.error(`No se encontró la tabla de experiencia para la clase ${clase}`);
        return { actual: 0, siguiente: null }; // Devuelve 0 experiencia si no hay datos
    }

    // Verifica que el nivel sea válido y que existan datos para ese nivel
    const nivelIndex = nivel - 1;
    if (nivelIndex < 0 || nivelIndex >= clase.nivel_experiencia.length) {
        console.error(`El nivel ${nivel} está fuera de rango para la clase ${clase}`);
        return { actual: 0, siguiente: null }; // Devuelve 0 experiencia si el nivel no es válido
    }

    // Obtener la experiencia del nivel actual y del siguiente nivel
    const nivelActualExp = clase.nivel_experiencia[nivelIndex][0]; // Experiencia actual
    const siguienteNivelExp = clase.nivel_experiencia[nivelIndex + 1] ? clase.nivel_experiencia[nivelIndex + 1][0] : null; // Experiencia del siguiente nivel, si existe

    return { actual: nivelActualExp, siguiente: siguienteNivelExp };
}

// Formatear experiencia con puntos
function formatearExperiencia(experiencia) {
    return experiencia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Obtener el ajuste de experiencia basado en las características principales
function obtenerAjusteExperiencia(clase, caracteristicas, ajusteDatos) {
    // Dividir en múltiples características si es necesario
    const caracteristicasPrincipales = clase.caracteristicaPrincipal.split(' y ').map(c => c.trim().toLowerCase());

    let mayorCaracteristica = Math.max(...caracteristicasPrincipales.map(c => caracteristicas[c]));

    const rangos = Object.keys(ajusteDatos.valores);
    for (const rango of rangos) {
        const puntos = JSON.parse(rango);
        if (puntos.includes(mayorCaracteristica)) {
            return ajusteDatos.valores[rango];
        }
    }
    return "0%";
}

// Obtener las tiradas de salvación correspondientes al nivel
function obtenerTirosSalvacionPorNivel(clase, nivel) {
    const rangos = Object.keys(clase.tiros_salvacion);
    
    for (const rango of rangos) {
        const niveles = rango.split(',').map(n => parseInt(n.trim()));
        if (niveles.includes(nivel)) {
            return clase.tiros_salvacion[rango];
        }
    }
    
    return ["N/A", "N/A", "N/A", "N/A", "N/A"];
}

// Función que calcula los puntos de golpe y devuelve las tiradas individuales para mostrarlas
function calcularPuntosDeGolpe(clase, nivel, modificadorConstitucion) {
    let puntosDeGolpe = 0;
    const tiradasDeGolpe = []; // Almacenaremos las tiradas aquí

    const dadoGolpe = clase.dadosGolpe; // Ej: "1d8"
    const carasDelDado = parseInt(dadoGolpe.split('d')[1]);

    for (let i = 1; i <= nivel; i++) {
        if (i <= 9) {
            const tirada = Math.floor(Math.random() * carasDelDado + 1);
            tiradasDeGolpe.push(tirada); // Guardamos la tirada
            puntosDeGolpe += tirada + modificadorConstitucion;
        } else {
            puntosDeGolpe += modificadorConstitucion;
        }
    }

    // Evitar que los puntos de golpe sean negativos
    if (puntosDeGolpe < 1) {
        puntosDeGolpe = 1;
    }

    return { puntosDeGolpe, tiradasDeGolpe }; // Devolvemos las tiradas junto con los puntos de golpe
}

// Generar sexo aleatorio
function generarSexo() {
    const sexos = ['macho', 'hembra', 'no_definido'];
    return sexos[Math.floor(Math.random() * sexos.length)];
}

// Traducir nombre de la clase según el sexo
function traducirClaseSegunSexo(clase, sexo) {
    const indexSexo = sexo === 'macho' ? 0 : sexo === 'hembra' ? 1 : 2;
    return clase.nombre_por_sexo[indexSexo];
}

// Función para obtener la clase base sin variaciones por género
function obtenerClaseBase(claseNombre) {
    const claseNormalizada = claseNombre.toLowerCase();
    
    // Mapeo de variaciones de clase con género a la clase base
    if (['mago', 'maga', 'mague'].includes(claseNormalizada)) {
        return 'mago';
    }
    if (['clérigo', 'clériga', 'clérigue'].includes(claseNormalizada)) {
        return 'clérigo';
    }
    if (['elfo', 'elfa', 'elfe'].includes(claseNormalizada)) {
        return 'elfo';
    }
    if (['ladrón', 'ladrona', 'ladrone'].includes(claseNormalizada)) {
        return 'ladrón';
    }
    
    return claseNombre.toLowerCase(); // Retorna la clase normalizada si no tiene variación de género
}

// Función para asignar conjuros al personaje según su clase y nivel
function asignarConjuros(personaje, nivel, datos) {
    const claseBase = obtenerClaseBase(personaje.clase); // Obtener la clase base sin variaciones por género

    console.log(`Asignando conjuros para la clase base: ${claseBase}, Nivel: ${nivel}`);
    
    let progresionConjuros;
    let listaConjuros;

    // Validamos si la clase tiene conjuros de mago/elfo o clérigo
    if (claseBase === 'mago' || claseBase === 'elfo') {
        if (datos.clases['Mago'] && datos.clases['Mago'].progresion_conjuros_mago_elfo) {
            progresionConjuros = datos.clases['Mago'].progresion_conjuros_mago_elfo;
            listaConjuros = datos.conjuros_mago_elfo; // Conjuros del mago/elfo
            console.log(`Progresión de conjuros encontrada para elfo/mago:`, progresionConjuros);
        } else {
            console.error(`No se encontró la progresión de conjuros para la clase ${claseBase}`);
            return {}; // Retornar un objeto vacío si no se encuentra la progresión
        }
    } else if (claseBase === 'clérigo') {
        if (datos.clases['Clérigo'] && datos.clases['Clérigo'].progresion_conjuros_clerigo) {
            progresionConjuros = datos.clases['Clérigo'].progresion_conjuros_clerigo;
            listaConjuros = datos.conjuros_clerigo; // Conjuros del clérigo
            console.log(`Progresión de conjuros encontrada para clérigo:`, progresionConjuros);
        } else {
            console.error(`No se encontró la progresión de conjuros para la clase ${claseBase}`);
            return {}; // Retornar un objeto vacío si no se encuentra la progresión
        }
    } else {
        console.error(`La clase ${claseBase} no tiene conjuros disponibles`);
        return {}; // Si la clase no tiene conjuros, retornar un objeto vacío
    }

    // Asignar conjuros por nivel
    return obtenerConjurosPorNivel(progresionConjuros, nivel, claseBase, listaConjuros);
}

// Función para obtener los conjuros según la progresión y el nivel
function obtenerConjurosPorNivel(progresionConjuros, nivel, claseBase, listaConjuros) {
    const nivelComoTexto = nivel.toString();
    console.log(`Obteniendo conjuros para la clase ${claseBase}, nivel ${nivel}`);

    const conjurosPorNivel = progresionConjuros[nivelComoTexto];

    if (!conjurosPorNivel) {
        console.error(`No se encontró la progresión de conjuros para la clase ${claseBase} en el nivel ${nivelComoTexto}`);
        return {};
    }

    // Crear un objeto para almacenar los conjuros seleccionados
    const conjurosAsignados = {};

    // Para cada nivel de conjuros, seleccionar los conjuros disponibles
    for (let i = 0; i < conjurosPorNivel.length; i++) {
        const cantidadConjuros = conjurosPorNivel[i];
        const nivelConjurosTexto = `nivel_${i + 1}`; // Esto será 'nivel_1', 'nivel_2', etc.
        
        // Verificamos que haya una lista de conjuros disponible para este nivel
        if (!listaConjuros[nivelConjurosTexto]) {
            console.error(`No se encontraron conjuros para ${nivelConjurosTexto} en la clase ${claseBase}`);
            continue;
        }

        const conjurosNivel = listaConjuros[nivelConjurosTexto];
        conjurosAsignados[nivelConjurosTexto] = seleccionarConjurosAleatorios(conjurosNivel, cantidadConjuros);
    }

    console.log(`Conjuros asignados para ${claseBase} en nivel ${nivel}:`, conjurosAsignados);
    return conjurosAsignados;
}

// Seleccionar conjuros aleatorios
function seleccionarConjurosAleatorios(listaConjuros, cantidad) {
    const conjurosSeleccionados = [];
    const copiaLista = [...listaConjuros];

    for (let i = 0; i < cantidad; i++) {
        if (copiaLista.length === 0) {
            break;
        }

        const indiceAleatorio = Math.floor(Math.random() * copiaLista.length);
        const conjuroSeleccionado = copiaLista.splice(indiceAleatorio, 1)[0];
        conjurosSeleccionados.push(conjuroSeleccionado);
    }

    console.log(`Conjuros seleccionados aleatoriamente: ${conjurosSeleccionados}`);
    return conjurosSeleccionados;
}

export { 
    obtenerModificador, 
    cumpleRequisitosYajustar, 
    generarNivel, 
    obtenerExperienciaPorNivel, 
    formatearExperiencia, 
    obtenerAjusteExperiencia, 
    obtenerTirosSalvacionPorNivel, 
    generarAlineamiento, 
    calcularPuntosDeGolpe, 
    generarSexo, 
    generarNombreYApodo, 
    traducirClaseSegunSexo, 
    asignarConjuros, 
    obtenerConjurosPorNivel, 
    seleccionarConjurosAleatorios, 
    obtenerClaseBase 
};