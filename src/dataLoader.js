async function cargarDatos() { 
    try {
        console.log('Intentando cargar el archivo JSON...');
        const response = await fetch('./public/data.json?v=${new Date().getTime()}'); // Evitar caché con timestamp
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

export { cargarDatos };