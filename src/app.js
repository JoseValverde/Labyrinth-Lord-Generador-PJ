import { generarPersonajeCompleto } from './characterGenerator.js';

document.addEventListener("DOMContentLoaded", function() {
    generarPersonajeCompleto();  // Generar automáticamente un personaje cuando la página se cargue
});

document.addEventListener('DOMContentLoaded', function() {
    const botonGenerarPersonaje = document.getElementById('generarPersonaje');
    const claseSelect = document.getElementById('clase-select');
    const nivelSelect = document.getElementById('nivel-select');
    
    if (botonGenerarPersonaje) {
        botonGenerarPersonaje.addEventListener('click', function() {
            // Aquí llamamos a la función para generar el personaje
            console.log('Botón presionado');
            generarPersonajeCompleto();  // Llama a tu función
        });
    }
});

document.getElementById("imprimir-pdf").addEventListener("click", function () {
    window.print();  // Abre el diálogo de impresión del navegador
});




/* ULTIMA VERSION OPERATIVA


console.log("Archivo app.js cargado correctamente");

document.addEventListener('DOMContentLoaded', function() {
    const botonGenerar = document.getElementById('generar');
    
    if (botonGenerar) {
        botonGenerar.addEventListener('click', function() {
            generarPersonajeCompleto();
        });
    }
});

async function cargarDatos() {
    try {
        console.log('Intentando cargar el archivo JSON...');
        const response = await fetch('../public/data.json?v=${new Date().getTime()}'); // Evitar caché con timestamp
        if (!response.ok) {
            throw new Error('Error al cargar el JSON');
        }
        const datos = await response.json();
        console.log('Datos cargados:', datos); // Verificar si los datos se cargan correctamente
        return datos;
    } catch (error) {
        console.error('Error cargando el archivo JSON:', error);
    }
}

// Función para tirar 3d6 y devolver el resultado
function tirar3d6() {
    return Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
}

// Función para generar las tiradas de características
function generarCaracteristicas() {
    return {
        fuerza: tirar3d6(),
        destreza: tirar3d6(),
        constitucion: tirar3d6(),
        inteligencia: tirar3d6(),
        sabiduria: tirar3d6(),
        carisma: tirar3d6()
    };
}

// Función para asignar las tiradas más altas a las características principales
function asignarTiradasAPrincipales(tiradas, clase) {
    // Ordenar las tiradas de mayor a menor
    const tiradasOrdenadas = Object.entries(tiradas).sort((a, b) => b[1] - a[1]);

    // Obtener las características principales de la clase
    const caracteristicasPrincipales = clase.caracteristicaPrincipal.split(" e "); // Dividimos si hay más de una característica

    // Asignar las tiradas más altas a las características principales
    caracteristicasPrincipales.forEach((caracteristica, index) => {
        const clave = caracteristica.toLowerCase();
        if (tiradas[clave] !== undefined) {
            tiradas[clave] = tiradasOrdenadas[index][1];
        }
    });

    // Tiradas restantes
    const tiradasRestantes = tiradasOrdenadas.slice(caracteristicasPrincipales.length).map(item => item[1]);

    // Características restantes
    const caracteristicasRestantes = Object.keys(tiradas).filter(key => !caracteristicasPrincipales.includes(key.charAt(0).toUpperCase() + key.slice(1)));

    // Distribuir aleatoriamente las tiradas restantes
    caracteristicasRestantes.forEach((key) => {
        const randomIndex = Math.floor(Math.random() * tiradasRestantes.length);
        tiradas[key] = tiradasRestantes.splice(randomIndex, 1)[0];
    });

    return tiradas;
}

// Función para obtener los modificadores según la característica
function obtenerModificador(valorCaracteristica, datos) {
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

// Función para validar si el personaje cumple con los requisitos de la clase
function cumpleRequisitos(clase, caracteristicas) {
    if (!clase.requisitos || clase.requisitos === "") return true; // No hay requisitos

    const requisitos = clase.requisitos.split(", ");
    for (let requisito of requisitos) {
        const [caracteristica, valorRequerido] = requisito.split(" ");
        if (caracteristicas[caracteristica.toLowerCase()] < parseInt(valorRequerido)) {
            return false; // No cumple con un requisito
        }
    }
    return true;
}

// Función para generar el sexo aleatorio
function generarSexo() {
    const sexos = ['macho', 'hembra', 'no_definido'];
    return sexos[Math.floor(Math.random() * sexos.length)];
}

// Función para traducir el nombre de la clase según el sexo
function traducirClaseSegunSexo(clase, sexo) {
    const indexSexo = sexo === 'macho' ? 0 : sexo === 'hembra' ? 1 : 2;
    return clase.nombre_por_sexo[indexSexo];
}

// Función para generar el personaje completo
async function generarPersonajeCompleto() {
    const datos = await cargarDatos();
    if (!datos) {
        console.error('No se pudo cargar el archivo JSON');
        return;
    }

    // Generar tiradas de características
    let caracteristicas = generarCaracteristicas();

    // Selección aleatoria de clase que cumpla con los requisitos
    let claseSeleccionada;
    let clase;
    let intentos = 0;
    const clases = Object.keys(datos.clases);
    do {
        claseSeleccionada = clases[Math.floor(Math.random() * clases.length)];
        clase = datos.clases[claseSeleccionada];
        intentos++;
        if (intentos > 20) {
            console.error("No se pudo encontrar una clase que cumpla los requisitos después de 20 intentos.");
            return;
        }
    } while (!cumpleRequisitos(clase, caracteristicas));

    // Asignar las tiradas más altas a las características principales de la clase
    caracteristicas = asignarTiradasAPrincipales(caracteristicas, clase);

    // Generar sexo aleatorio
    const sexo = generarSexo();

    // Obtener los modificadores de las características
    const modificadores = {
        fuerza: obtenerModificador(caracteristicas.fuerza, datos).fuerza,
        constitucion: obtenerModificador(caracteristicas.constitucion, datos).constitucion,
        destreza: obtenerModificador(caracteristicas.destreza, datos).destreza,
        inteligencia: obtenerModificador(caracteristicas.inteligencia, datos).inteligencia,
        sabiduria: obtenerModificador(caracteristicas.sabiduria, datos).sabiduria,
        carisma: obtenerModificador(caracteristicas.carisma, datos).carisma
    };

    // Traducir el nombre de la clase según el sexo
    const nombreClase = traducirClaseSegunSexo(clase, sexo);

    // Crear el objeto del personaje
    const personaje = {
        clase: nombreClase,
        sexo: sexo,
        caracteristicaPrincipal: clase.caracteristicaPrincipal,
        requisitos: clase.requisitos,
        habilidades: clase.habilidades,
        descripcionClase: clase.descripcion,
        caracteristicas: caracteristicas,
        modificadores: modificadores
    };

    // Mostrar el personaje generado
    mostrarPersonaje(personaje);
}

function mostrarPersonaje(personaje) {
    const resultadoDiv = document.getElementById("resultado");
	
    // Generar un número aleatorio entre 1 y 4 para la imagen
    const numImagen = Math.floor(Math.random() * 4) + 1;
	
    // Función para eliminar tildes
    function eliminarTildes(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Eliminar tildes del nombre de la clase
    const nombreClase = eliminarTildes(personaje.clase.toLowerCase());

    // Construir la ruta de la imagen
    const rutaImagen = `img/${nombreClase}_${personaje.sexo}_${numImagen.toString().padStart(2, '0')}.webp`; // Formato de la ruta

    // Crear la estructura HTML para mostrar los datos del personaje
    resultadoDiv.innerHTML = `
        <img src="${rutaImagen}" alt="${personaje.clase}" onerror="this.src='img/default.webp';" id="retrato"> <!-- Imagen con fallback a default -->
        <h2>Personaje Generado</h2>
        <p><strong>Clase:</strong> ${personaje.clase}</p>
        <p><strong>Característica Principal:</strong> ${personaje.caracteristicaPrincipal}</p>
        <p><strong>Requisitos:</strong> ${personaje.requisitos ? personaje.requisitos : "Ninguno"}</p>
        <p><strong>Habilidades de Clase:</strong> ${personaje.habilidades}</p>
        <p><strong>Descripción de la Clase:</strong> ${personaje.descripcionClase}</p>

        <h3>Características</h3>
        <p><strong>Fuerza:</strong> ${personaje.caracteristicas.fuerza} (Mod: ${personaje.modificadores.fuerza})</p>
        <p><strong>Destreza:</strong> ${personaje.caracteristicas.destreza} (Mod: ${personaje.modificadores.destreza})</p>
        <p><strong>Constitución:</strong> ${personaje.caracteristicas.constitucion} (Mod: ${personaje.modificadores.constitucion})</p>
        <p><strong>Inteligencia:</strong> ${personaje.caracteristicas.inteligencia} (Mod: ${personaje.modificadores.inteligencia})</p>
        <p><strong>Sabiduría:</strong> ${personaje.caracteristicas.sabiduria} (Mod: ${personaje.modificadores.sabiduria})</p>
        <p><strong>Carisma:</strong> ${personaje.caracteristicas.carisma} 
        (Reacción: ${personaje.modificadores.carisma.reaccion}, 
        Servidores: ${personaje.modificadores.carisma.servidores}, 
        Moral: ${personaje.modificadores.carisma.moral})</p>
    `;
}

*/


/* version correcta
console.log("Archivo app.js cargado correctamente");

document.addEventListener('DOMContentLoaded', function() {
    const botonGenerar = document.getElementById('generar');
    
    if (botonGenerar) {
        botonGenerar.addEventListener('click', function() {
            generarPersonajeCompleto();
        });
    }
});

async function cargarDatos() {
    try {
        console.log('Intentando cargar el archivo JSON...');
        const response = await fetch('../public/data.json?v=${new Date().getTime()}'); // Evitar caché con timestamp
        if (!response.ok) {
            throw new Error('Error al cargar el JSON');
        }
        const datos = await response.json();
        console.log('Datos cargados:', datos); // Verificar si los datos se cargan correctamente
        return datos;
    } catch (error) {
        console.error('Error cargando el archivo JSON:', error);
    }
}

// Función para tirar 3d6 y devolver el resultado
function tirar3d6() {
    return Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
}

// Función para generar las tiradas de características
function generarCaracteristicas() {
    return {
        fuerza: tirar3d6(),
        destreza: tirar3d6(),
        constitucion: tirar3d6(),
        inteligencia: tirar3d6(),
        sabiduria: tirar3d6(),
        carisma: tirar3d6()
    };
}

// Función para obtener los modificadores según la característica
function obtenerModificador(valorCaracteristica, datos) {
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

// Función para validar si el personaje cumple con los requisitos de la clase
function cumpleRequisitos(clase, caracteristicas) {
    if (!clase.requisitos || clase.requisitos === "") return true; // No hay requisitos

    const requisitos = clase.requisitos.split(", ");
    for (let requisito of requisitos) {
        const [caracteristica, valorRequerido] = requisito.split(" ");
        if (caracteristicas[caracteristica.toLowerCase()] < parseInt(valorRequerido)) {
            return false; // No cumple con un requisito
        }
    }
    return true;
}

// Función para generar el sexo aleatorio
function generarSexo() {
    const sexos = ['macho', 'hembra', 'no_definido'];
    return sexos[Math.floor(Math.random() * sexos.length)];
}

// Función para traducir el nombre de la clase según el sexo
function traducirClaseSegunSexo(clase, sexo) {
    const indexSexo = sexo === 'macho' ? 0 : sexo === 'hembra' ? 1 : 2;
    return clase.nombre_por_sexo[indexSexo];
}

// Función para generar el personaje completo
async function generarPersonajeCompleto() {
    const datos = await cargarDatos();
    if (!datos) {
        console.error('No se pudo cargar el archivo JSON');
        return;
    }

    // Generar tiradas de características
    const caracteristicas = generarCaracteristicas();

    // Selección aleatoria de clase que cumpla con los requisitos
    let claseSeleccionada;
    let clase;
    let intentos = 0;
    const clases = Object.keys(datos.clases);
    do {
        claseSeleccionada = clases[Math.floor(Math.random() * clases.length)];
        clase = datos.clases[claseSeleccionada];
        intentos++;
        if (intentos > 20) {
            console.error("No se pudo encontrar una clase que cumpla los requisitos después de 20 intentos.");
            return;
        }
    } while (!cumpleRequisitos(clase, caracteristicas));

    // Generar sexo aleatorio
    const sexo = generarSexo();

    // Obtener los modificadores de las características
    const modificadores = {
        fuerza: obtenerModificador(caracteristicas.fuerza, datos).fuerza,
        constitucion: obtenerModificador(caracteristicas.constitucion, datos).constitucion,
        destreza: obtenerModificador(caracteristicas.destreza, datos).destreza,
        inteligencia: obtenerModificador(caracteristicas.inteligencia, datos).inteligencia,
        sabiduria: obtenerModificador(caracteristicas.sabiduria, datos).sabiduria,
        carisma: obtenerModificador(caracteristicas.carisma, datos).carisma
    };

    // Traducir el nombre de la clase según el sexo
    const nombreClase = traducirClaseSegunSexo(clase, sexo);
	


    // Crear el objeto del personaje
    const personaje = {
        clase: nombreClase,
        sexo: sexo,
        caracteristicaPrincipal: clase.caracteristicaPrincipal,
		requisitos: clase.requisitos,  // Agregamos los requisitos
        habilidades: clase.habilidades,
        descripcionClase: clase.descripcion,
        caracteristicas: caracteristicas, // Añadir las características generadas
        modificadores: modificadores // Añadir los modificadores
    };

    // Mostrar el personaje generado
    mostrarPersonaje(personaje);
}

function mostrarPersonaje(personaje) {
    const resultadoDiv = document.getElementById("resultado");
	
	// Generar un número aleatorio entre 1 y 4 para la imagen
    const numImagen = Math.floor(Math.random() * 4) + 1;
	
	// Función para eliminar tildes
		function eliminarTildes(texto) {
			return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}

    // Eliminar tildes del nombre de la clase
    const nombreClase = eliminarTildes(personaje.clase.toLowerCase());

    // Construir la ruta de la imagen
    const rutaImagen = `img/${nombreClase}_${personaje.sexo}_${numImagen.toString().padStart(2, '0')}.webp`; // Formato de la ruta


    
    // Crear la estructura HTML para mostrar los datos del personaje
    resultadoDiv.innerHTML = `
        
 		<img src="${rutaImagen}" alt="${personaje.clase}" onerror="this.src='img/default.webp';" id="retrato"> <!-- Imagen con fallback a default -->
		<h2>Personaje Generado</h2>
        <p><strong>Clase:</strong> ${personaje.clase}</p>
        <!-- <p><strong>Sexo:</strong> ${personaje.sexo}</p> -->
        <p><strong>Característica Principal:</strong> ${personaje.caracteristicaPrincipal}</p>
        <p><strong>Requisitos:</strong> ${personaje.requisitos ? personaje.requisitos : "Ninguno"}</p>
        <p><strong>Habilidades de Clase:</strong> ${personaje.habilidades}</p>
        <p><strong>Descripción de la Clase:</strong> ${personaje.descripcionClase}</p>

        <h3>Características</h3>
        <p><strong>Fuerza:</strong> ${personaje.caracteristicas.fuerza} (Mod: ${personaje.modificadores.fuerza})</p>
        <p><strong>Destreza:</strong> ${personaje.caracteristicas.destreza} (Mod: ${personaje.modificadores.destreza})</p>
        <p><strong>Constitución:</strong> ${personaje.caracteristicas.constitucion} (Mod: ${personaje.modificadores.constitucion})</p>
        <p><strong>Inteligencia:</strong> ${personaje.caracteristicas.inteligencia} (Mod: ${personaje.modificadores.inteligencia})</p>
        <p><strong>Sabiduría:</strong> ${personaje.caracteristicas.sabiduria} (Mod: ${personaje.modificadores.sabiduria})</p>
        <p><strong>Carisma:</strong> ${personaje.caracteristicas.carisma} 
        (Reacción: ${personaje.modificadores.carisma.reaccion}, 
        Servidores: ${personaje.modificadores.carisma.servidores}, 
        Moral: ${personaje.modificadores.carisma.moral})</p>

    
    `;
}

*/