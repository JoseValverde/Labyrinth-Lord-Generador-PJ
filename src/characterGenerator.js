import { cargarDatos } from './dataLoader.js';
import { asignarTiradasAPrincipales, tirarDados, generarCaracteristicas } from './diceRolls.js';
import { obtenerModificador, 
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
    obtenerClaseBase  } from './characterUtils.js';
import { mostrarPersonaje, mostrarConjuros } from './ui.js';

async function generarPersonajeCompleto() {
	
	const nivelSeleccionadoUsuario = document.getElementById('nivel-select').value; // Obtenemos el valor seleccionado por el usuario
    const claseSeleccionadaUsuario = document.getElementById('clase-select').value; // Obtener la clase seleccionada si existe

    const datos = await cargarDatos();
    if (!datos) {
        console.error('No se pudo cargar el archivo JSON');
        return;
    }
	
	console.log("Datos cargados correctamente:", datos.clases);

    let caracteristicas = generarCaracteristicas();

	// Verificar si alguna de las características es undefined
    if (Object.values(caracteristicas).some(valor => typeof valor === 'undefined')) {
        console.error("Error: Algunas características no fueron generadas correctamente", caracteristicas);
        return;
    }
	
    // Seleccionar aleatoriamente la clase si no se ha seleccionado una específica
    let claseSeleccionada;
    let clase;
    let intentos = 0;
    const clases = Object.keys(datos.clases);

    if (claseSeleccionadaUsuario !== "cualquiera") {
        claseSeleccionada = claseSeleccionadaUsuario; // Si el usuario seleccionó una clase específica
        clase = datos.clases[claseSeleccionada];
    } else {
        do {
            claseSeleccionada = clases[Math.floor(Math.random() * clases.length)];
            clase = datos.clases[claseSeleccionada];
            intentos++;
            if (intentos > 20) {
                console.error("No se pudo encontrar una clase que cumpla los requisitos después de 20 intentos.");
                return;
            }
        } while (!cumpleRequisitosYajustar(clase, caracteristicas));
    }
	
	// Si el usuario selecciona un nivel específico
    let nivel = nivelSeleccionadoUsuario !== "cualquiera" ? parseInt(nivelSeleccionadoUsuario, 10) : generarNivel();

    // Verificar si el nivel seleccionado es mayor al nivel máximo permitido por la clase
    const nivelMaximo = clase.nivelMaximo !== "Ninguno" ? parseInt(clase.nivelMaximo, 10) : 10; // Si no hay nivel máximo, se asume 10
    if (nivel > nivelMaximo) {
        console.warn(`El nivel seleccionado (${nivel}) es superior al nivel máximo permitido (${nivelMaximo}) para la clase ${claseSeleccionada}. Se ajustará al nivel máximo.`);
        nivel = nivelMaximo;  // Aquí reasignamos el nivel sin volver a declararlo
    }
	
    // Asignar las tiradas más altas a las características principales de la clase
    caracteristicas = asignarTiradasAPrincipales(caracteristicas, clase);

    // Generar sexo aleatorio
    const sexo = generarSexo();
	
	// Verificar que todas las características estén definidas
	if (!caracteristicas.fuerza || !caracteristicas.constitucion || !caracteristicas.destreza || 
		!caracteristicas.inteligencia || !caracteristicas.sabiduria || !caracteristicas.carisma) {
		console.error("Error: Algunas características no fueron generadas correctamente", caracteristicas);
		return;
	}

    // Obtener los modificadores de las características
    const modificadores = {
        fuerza: obtenerModificador(caracteristicas.fuerza, datos).fuerza,
        constitucion: obtenerModificador(caracteristicas.constitucion, datos).constitucion,
        destreza: obtenerModificador(caracteristicas.destreza, datos).destreza,
        inteligencia: obtenerModificador(caracteristicas.inteligencia, datos).inteligencia,
        sabiduria: obtenerModificador(caracteristicas.sabiduria, datos).sabiduria,
        carisma: obtenerModificador(caracteristicas.carisma, datos).carisma
    };

    // Obtener el ajuste de experiencia
    const ajusteExperiencia = obtenerAjusteExperiencia(clase, caracteristicas, datos.ajuste_experiencia);

    // Traducir el nombre de la clase según el sexo
    const nombreClase = traducirClaseSegunSexo(clase, sexo);

    // Obtener las tiradas de salvación correspondientes al nivel
    const tirosSalvacion = obtenerTirosSalvacionPorNivel(clase, nivel);

    // Obtener la experiencia asociada al nivel actual y al siguiente nivel
    const { actual: experienciaActual, siguiente: experienciaSiguiente } = obtenerExperienciaPorNivel(clase, nivel);

    // Formatear la experiencia
    const experienciaFormateada = formatearExperiencia(experienciaActual);
    const experienciaSiguienteFormateada = experienciaSiguiente ? formatearExperiencia(experienciaSiguiente) : "Máximo nivel alcanzado";

    // Calcular los puntos de golpe y obtener las tiradas de golpe
    const { puntosDeGolpe, tiradasDeGolpe } = calcularPuntosDeGolpe(clase, nivel, parseInt(modificadores.constitucion, 10));

    // Generar alineamiento aleatorio
    const alineamiento = generarAlineamiento(datos);

    // Obtener nombre y apodo aleatorios
    const { nombreAleatorio, apodoAleatorio } = generarNombreYApodo(claseSeleccionada.toLowerCase(), sexo, datos);
	
	// Generar el dinero inicial en oro (3d8 * 10)
    const dineroInicial = (Math.floor(Math.random() * 8 + 1) + Math.floor(Math.random() * 8 + 1) + Math.floor(Math.random() * 8 + 1)) * 10;



    // Crear el objeto del personaje
    const personaje = {
        nombre: nombreAleatorio, // Nombre generado
        apodo: apodoAleatorio,  // Apodo generado
        clase: nombreClase,
        sexo: sexo,
        nivel: nivel,
        experiencia: experienciaFormateada,
        experienciaSiguiente: experienciaSiguienteFormateada,
        ajusteExperiencia: ajusteExperiencia !== "0%" ? ajusteExperiencia : null,
        dadosGolpe: clase.dadosGolpe,
        alineamiento: alineamiento,
        caracteristicaPrincipal: clase.caracteristicaPrincipal,
        requisitos: clase.requisitos,
        puntosDeGolpe: puntosDeGolpe,
        tiradasDeGolpe: tiradasDeGolpe,
        habilidades: clase.habilidades,
        descripcionClase: clase.descripcion,
        caracteristicas: caracteristicas,
        modificadores: modificadores,
        tirosSalvacion: tirosSalvacion,
        dineroOro: dineroInicial  // Solo monedas de oro
   
    };

    // Asignar conjuros si la clase lo permite (debe ir después de crear el objeto)
    if (claseSeleccionada.toLowerCase().includes("clérigo") || 
        claseSeleccionada.toLowerCase().includes("mago") || 
        claseSeleccionada.toLowerCase().includes("elfo")) {
        personaje.conjuros = asignarConjuros(personaje, nivel, datos);
    }

    // Mostrar el personaje generado
    mostrarPersonaje(personaje, datos);
	
	console.log("Clase base:", obtenerClaseBase(personaje.clase.toLowerCase()));
}

export { generarPersonajeCompleto };