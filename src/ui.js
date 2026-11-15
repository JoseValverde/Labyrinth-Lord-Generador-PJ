import { obtenerClaseBase } from './characterUtils.js';  // Asegúrate de importar obtenerClaseBase si no está en este archivo

function mostrarConjuros(conjuros) {
    let conjurosHTML = '<h3>Conjuros:</h3>';

    // Iteramos sobre los niveles de conjuros
    for (const [nivel, conjurosNivel] of Object.entries(conjuros)) {
        if (conjurosNivel.length > 0) {  // Verificamos si el nivel tiene conjuros asignados
            const nivelNumero = nivel.replace('nivel_', ''); // Reemplazamos "nivel_" por el número
            conjurosHTML += `<p><strong>Nivel ${nivelNumero}:</strong> ${conjurosNivel.join(', ')}</p>`;
        }
    }

    return conjurosHTML;
}
function mostrarPersonaje(personaje, datos) {
    const resultadoDiv = document.getElementById("resultado");

	
	// Mapeo de características sin tilde a su versión con tilde
    const mapeoCaracteristicas = {
        "fuerza": "Fuerza",
        "destreza": "Destreza",
        "constitucion": "Constitución",
        "inteligencia": "Inteligencia",
        "sabiduria": "Sabiduría",
        "carisma": "Carisma"
    };

    // Función para traducir características a la versión con tilde
    function traducirCaracteristica(caracteristica) {
        return mapeoCaracteristicas[caracteristica.toLowerCase().trim()] || caracteristica;
    }

    // Traducir la característica principal para mostrarla al usuario
    const caracteristicasPrincipales = personaje.caracteristicaPrincipal.split(' y ')
        .map(caracteristica => traducirCaracteristica(caracteristica))
        .join(' y ');
	
    // Verificar si los datos están correctamente definidos
    console.log("Datos recibidos en mostrarPersonaje:", datos);
    console.log("Personaje recibido:", personaje);

    // Generar un número aleatorio entre 1 y 4 para la imagen
    const numImagen = Math.floor(Math.random() * 4) + 1;

    // Función para eliminar tildes
    function eliminarTildes(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Eliminar tildes del nombre de la clase
    const nombreClase = eliminarTildes(personaje.clase.toLowerCase());

    // Construir la ruta de la imagen
    const rutaImagen = `public/img/${nombreClase}_${personaje.sexo}_${numImagen.toString().padStart(2, '0')}.webp`;

    // Función para formatear las tiradas de golpe según lo que pides
    function formatearTiradasDeGolpe(tiradas, modificadorConstitucion) {
        return tiradas.map(tirada => {
            if (modificadorConstitucion !== 0) {
                const modificador = modificadorConstitucion > 0 ? `+${modificadorConstitucion}` : `${modificadorConstitucion}`;
                return `${tirada} ${modificador}`;
            } else {
                return `${tirada}`; // No mostramos modificador si es 0
            }
        }).join(', ');
    }

    const tiradasDeGolpeFormateadas = formatearTiradasDeGolpe(personaje.tiradasDeGolpe, parseInt(personaje.modificadores.constitucion, 10));
	
	// Obtener el modificador de sabiduría
    const modificadorSabiduria = personaje.modificadores.sabiduria;
	
	 // Función para formatear el modificador con el signo adecuado
    function formatearModificador(modificador) {
        return modificador >= 0 ? `+${modificador}` : `${modificador}`;
    }
	
	// Invertir el modificador de Sabiduría para las tiradas de salvación
    const modificadorSabiduriaInvertido = modificadorSabiduria * -1;


    // Verificar si personaje tiene las tiradas de salvación
    const tirosSalvacion = personaje.tirosSalvacion || [];
	
	// Crear la estructura HTML para mostrar las tiradas de salvación con el modificador de sabiduría
    const tirosSalvacionHTML = `
        <h3>Tiradas de Salvación</h3>
        <p><strong>Arma de Aliento:</strong> ${tirosSalvacion[0] || "N/A"} ${modificadorSabiduriaInvertido !== 0 ? `${formatearModificador(modificadorSabiduriaInvertido)}` : ""}</p>
        <p><strong>Veneno o Muerte:</strong> ${tirosSalvacion[1] || "N/A"} ${modificadorSabiduriaInvertido !== 0 ? `${formatearModificador(modificadorSabiduriaInvertido)}` : ""}</p>
        <p><strong>Petrificación o Parálisis:</strong> ${tirosSalvacion[2] || "N/A"} ${modificadorSabiduriaInvertido !== 0 ? `${formatearModificador(modificadorSabiduriaInvertido)}` : ""}</p>
        <p><strong>Varita:</strong> ${tirosSalvacion[3] || "N/A"} ${modificadorSabiduriaInvertido !== 0 ? `${formatearModificador(modificadorSabiduriaInvertido)}` : ""}</p>
        <p><strong>Conjuro, Bastón o Cetro:</strong> ${tirosSalvacion[4] || "N/A"} ${modificadorSabiduriaInvertido !== 0 ? `${formatearModificador(modificadorSabiduriaInvertido)}` : ""}</p>
    `;

    // Verificación para la clase de ladrón y sus variantes de género
    const claseBase = obtenerClaseBase(personaje.clase.toLowerCase());

    console.log("Clase base:", claseBase);  // Asegúrate de que 'ladrón' se detecta correctamente

    let habilidadesLadronHTML = ''; // Cambiado el nombre a habilidadesLadronHTML para mayor claridad

    // Si la clase es un ladrón, mostramos las habilidades del ladrón
    if (claseBase === "ladrón" && datos && datos.clases && datos.clases.Ladrón) {
        const nivel = personaje.nivel;
        const habilidadesLadron = datos.clases.Ladrón.habilidades_ladron;

        // Agregar logs para asegurar que accedemos correctamente a las habilidades
        console.log("Habilidades del ladrón:", habilidadesLadron);
        console.log("Nivel del personaje:", nivel);

        if (habilidadesLadron && habilidadesLadron.valores_por_nivel && habilidadesLadron.valores_por_nivel[nivel]) {
            const habilidades = habilidadesLadron.valores_por_nivel[nivel];
            const nombresHabilidades = habilidadesLadron.nombres;

            // Construir el HTML para mostrar las habilidades del ladrón
            habilidadesLadronHTML += `<h3>Habilidades de ladrón (Nivel ${nivel})</h3><p>`;
            for (let i = 0; i < nombresHabilidades.length; i++) {
					if (i == 3 || i == 6) {
							habilidadesLadronHTML += `</br>`;
					};
                habilidadesLadronHTML += `<strong>${nombresHabilidades[i]}:</strong> ${habilidades[i]} `;
            }
            habilidadesLadronHTML += `</p><p><i>${habilidadesLadron.aviso}</i></p>`;
			
        } else {
            console.error(`No se encontraron habilidades para el nivel ${nivel} del ladrón.`);
        }
    } else {
        console.log("El personaje no es un ladrón o no se encontraron datos del ladrón.");
    }
	// Mostrar conjuros solo si el personaje tiene conjuros asignados
		let conjurosHTML = '';
		if (personaje.conjuros && Object.keys(personaje.conjuros).length > 0) {
			conjurosHTML = mostrarConjuros(personaje.conjuros);
		}
	

    // Crear la estructura HTML para mostrar los datos del personaje
    resultadoDiv.innerHTML = `
        <h2>${personaje.nombre}, <i>${personaje.apodo}</i></h2>
        <img src="${rutaImagen}" alt="${personaje.clase}" onerror="this.src='public/img/default.webp';" id="retrato">

        <p><strong>Clase:</strong> ${personaje.clase}  <strong>Nivel:</strong> ${personaje.nivel} (${personaje.experiencia} px)</p>
        ${personaje.ajusteExperiencia ? `<p><strong>Ajuste de Experiencia:</strong> ${personaje.ajusteExperiencia}</p>` : ""}
        <p><strong>Experiencia para nivel ${personaje.nivel + 1} :</strong> ${personaje.experienciaSiguiente} px</p>
        <p><strong>Dado de Golpe:</strong> ${personaje.dadosGolpe}</p>
        <p><strong>Puntos de Golpe:</strong> ${personaje.puntosDeGolpe} PG (${tiradasDeGolpeFormateadas})</p>
        <p><strong>Característica Principal:</strong> ${caracteristicasPrincipales}</p>
        <p><strong>Requisitos:</strong> ${personaje.requisitos ? personaje.requisitos : "Ninguno"}</p>
        <p><strong>Alineamiento:</strong> ${personaje.alineamiento}</p>

        <div class="contenedor">
            <div class="tresCuartos">
                <h3>Características</h3>
                <p><strong>Fuerza:</strong> ${personaje.caracteristicas.fuerza} (${personaje.modificadores.fuerza} a golpear, dañar y forzar puertas.)</p>
                <p><strong>Destreza:</strong> ${personaje.caracteristicas.destreza} (${personaje.modificadores.destreza} a clase de Armadura, ${personaje.modificadores.destreza * -1} a disparar con proyectiles, ${personaje.modificadores.destreza * -1} a iniciativa)</p>
                <p><strong>Constitución:</strong> ${personaje.caracteristicas.constitucion} (${personaje.modificadores.constitucion} PG adicionales por dado de golpe)</p>
                <p><strong>Inteligencia:</strong> ${personaje.caracteristicas.inteligencia} (${personaje.modificadores.inteligencia} idiomas adicionales)</p>
                <p><strong>Sabiduría:</strong> ${personaje.caracteristicas.sabiduria} (${personaje.modificadores.sabiduria} a tiros de salvación)</p>
                <p><strong>Carisma:</strong> ${personaje.caracteristicas.carisma} 
                (Reacción: ${personaje.modificadores.carisma.reaccion}, 
                Servidores máximos: ${personaje.modificadores.carisma.servidores}, 
                Moral de los servidores: ${personaje.modificadores.carisma.moral})</p>
            </div>
            <div class="unCuarto">
                ${tirosSalvacionHTML}
            </div>
        </div>
        ${habilidadesLadronHTML} <!-- Agregamos el HTML de las habilidades del ladrón -->
		${conjurosHTML}
        <h3><strong>Descripción de la Clase</strong></h3> <p>${personaje.descripcionClase}</p>
       <!-- <p><strong>Habilidades de Clase:</strong> ${personaje.habilidades}</p> -->
		<h3><strong>Equipo</strong></h3> 
        <p><strong>Oro:</strong> ${personaje.dineroOro} monedas de oro</p>


    `;
}


export { mostrarPersonaje, mostrarConjuros}; 