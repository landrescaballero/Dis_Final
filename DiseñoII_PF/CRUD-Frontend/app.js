var newMemberAddBtn = document.querySelector('.addMemberBt button.addMemberBtn'),
    darkBg = document.querySelector('.dark_bg'),
    popupForm = document.querySelector('.popup'),
    crossBtn = document.querySelector('.closeBtn'),
    submitBtn = document.querySelector('.submitBtn'),
    modalTitle = document.querySelector('.modalTitle'),
    popupFooter = document.querySelector('.popupFooter'),
    imgInput = document.querySelector('.img'),
    imgHolder = document.querySelector('.imgholder')
form = document.querySelector('form'),
    formInputFields = document.querySelectorAll('form input'),
    uploadimg = document.querySelector("#uploadimg"),
    tipoDNI = document.getElementById("tipoDNI"),
    no_documento = document.getElementById("no_documento"),
    fName = document.getElementById("fName"),
    sName = document.getElementById("sName"),
    genero = document.getElementById("genero"),
    lName = document.getElementById("lName"),
    bDate = document.getElementById("bDate"),
    email = document.getElementById("email"),
    phone = document.getElementById("phone"),
    entries = document.querySelector(".showEntries"),
    tabSize = document.getElementById("table_size"),
    userInfo = document.querySelector(".userInfo"),
    table = document.querySelector("table"),
    filterData = document.getElementById("search"),
    getBtn = document.getElementById("getBtn")


let originalData = localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')) : []
let getData = [...originalData]


let isEdit = false, editId

var arrayLength = 0
var tableSize = 10
var startIndex = 1
var endIndex = 0
var currentIndex = 1
var maxIndex = 0

showInfo()


newMemberAddBtn.addEventListener('click', () => {
    isEdit = false
    submitBtn.innerHTML = "Registrar"
    modalTitle.innerHTML = "Registrar persona"
    popupFooter.style.display = "block"
    imgInput.src = "./img/pic1.png"
    darkBg.classList.add('active')
    popupForm.classList.add('active')
})

crossBtn.addEventListener('click', () => {
    darkBg.classList.remove('active')
    popupForm.classList.remove('active')
    form.reset()
})


uploadimg.onchange = function () {
    var selectedFile = uploadimg.files[0];
    if (selectedFile && /^image\//.test(selectedFile.type) && selectedFile.size <= 2000000) {   // 2MB = 2000000
        var fileReader = new FileReader()

        fileReader.onload = function (e) {
            var imgUrl = e.target.result
            imgInput.src = imgUrl
        }

        fileReader.readAsDataURL(uploadimg.files[0])
    }
    else if (!/^image\//.test(selectedFile.type)) {
        alert("El archivo debe tener formato de imagen")
    }
    else if (selectedFile.size > 2000000) {
        alert("Esta foto es muy grande, recuerde que deber ser menor a 2MB")
    }
    else if (!selectedFile) {
        alert("Por favor anexar la foto")
    }
}

function preLoadCalculations() {
    array = getData
    arrayLength = array.length
    maxIndex = arrayLength / tableSize

    if ((arrayLength % tableSize) > 0) {
        maxIndex++
    }
}



function displayIndexBtn() {
    preLoadCalculations()

    const pagination = document.querySelector('.pagination')

    pagination.innerHTML = ""

    pagination.innerHTML = '<button onclick="prev()" class="prev">Previous</button>'

    for (let i = 1; i <= maxIndex; i++) {
        pagination.innerHTML += '<button onclick= "paginationBtn(' + i + ')" index="' + i + '">' + i + '</button>'
    }

    pagination.innerHTML += '<button onclick="next()" class="next">Next</button>'

    highlightIndexBtn()
}



function highlightIndexBtn() {
    startIndex = ((currentIndex - 1) * tableSize) + 1
    endIndex = (startIndex + tableSize) - 1

    if (endIndex > arrayLength) {
        endIndex = arrayLength
    }

    if (maxIndex >= 2) {
        var nextBtn = document.querySelector(".next")
        nextBtn.classList.add("act")
    }


    entries.textContent = `Mostrar del ${startIndex} hasta el ${endIndex} de ${arrayLength} Registrados`

    var paginationBtns = document.querySelectorAll('.pagination button')
    paginationBtns.forEach(btn => {
        btn.classList.remove('active')
        if (btn.getAttribute('index') === currentIndex.toString()) {
            btn.classList.add('active')
        }
    })


    showInfo()
}




function showInfo() {
    document.querySelectorAll(".employeeDetails").forEach(info => info.remove())

    var tab_start = startIndex - 1
    var tab_end = endIndex

    if (getData.length > 0) {
        for (var i = tab_start; i < tab_end; i++) {
            var staff = getData[i]


            if (staff) {
                let createElement = `<tr class = "employeeDetails">
                <td>${i + 1}</td>
                <td><img src="${staff.Foto}" alt="" width="40" height="40"></td>
                <td>${staff.TipoDocumento}</td>
                <td>${staff.NumeroDocumento}</td>
                <td>${staff.PrimerNombre}</td>
                <td>${staff.SegundoNombre}</td>
                <td>${staff.Apellidos}</td>
                <td>${staff.Genero}</td>
                <td>${staff.FechaNacimiento}</td>
                <td>${staff.CorreoElectronico}</td>
                <td>${staff.Celular}</td>
                <td>
                    <button onclick="readInfo('${staff.Foto}','${staff.TipoDocumento}', '${staff.NumeroDocumento}', '${staff.PrimerNombre}', '${staff.SegundoNombre}', '${staff.Apellidos}', '${staff.Genero}', '${staff.FechaNacimiento}', '${staff.CorreoElectronico}', '${staff.Celular}')"><i class="fa-regular fa-eye"></i></button>

                    <button onclick="editInfo('${i}','${staff.Foto}', '${staff.TipoDocumento}', '${staff.NumeroDocumento}', '${staff.PrimerNombre}', '${staff.SegundoNombre}', '${staff.Apellidos}', '${staff.Genero}', '${staff.FechaNacimiento}', '${staff.CorreoElectronico}', '${staff.Celular}')"><i class="fa-regular fa-pen-to-square"></i></button>


                    <button onclick = "deleteInfo(${i},'${staff.NumeroDocumento}')"><i class="fa-regular fa-trash-can"></i></button>
                </td>
            </tr>`

                userInfo.innerHTML += createElement
                table.style.minWidth = "1400px"
            }
        }
    }


    else {
        userInfo.innerHTML = `<tr class="employeeDetails"><td class="empty" colspan="11" align="center">No data available in table</td></tr>`
        table.style.minWidth = "1400px"
    }
}

showInfo()

// Leer información en el ojito
function readInfo(pic, TipoDNI, No_documento, fname, sname, lname, Genero, BDate, Email, Phone) {
    imgInput.src = pic
    tipoDNI.value = TipoDNI
    no_documento.value = No_documento
    fName.value = fname
    sName.value = sname
    lName.value = lname
    genero.value = Genero
    bDate.value = BDate
    email.value = Email
    phone.value = Phone

    darkBg.classList.add('active')
    popupForm.classList.add('active')
    popupFooter.style.display = "none"
    modalTitle.innerHTML = "Perfil"
    formInputFields.forEach(input => {
        input.disabled = true;

    });
    submitBtn.disabled = true;



    imgHolder.style.pointerEvents = "none"
}


// Abrir editar información 
function editInfo(id, pic, TipoDNI, No_documento, fname, sname, lname, Genero, BDate, Email, Phone) {
    isEdit = true
    editId = id

    // Find the index of the item to edit in the original data based on id
    const originalIndex = originalData.findIndex(item => item.id === id)

    // Update the original data
    imgInput.src = pic
    tipoDNI.value = TipoDNI
    no_documento.value = No_documento
    fName.value = fname
    sName.value = sname
    lName.value = lname
    genero.value = Genero
    bDate.value = BDate
    email.value = Email
    phone.value = Phone


    darkBg.classList.add('active')
    popupForm.classList.add('active')
    popupFooter.style.display = "block"
    modalTitle.innerHTML = "Editar información"
    submitBtn.innerHTML = "Actualizar"
    formInputFields.forEach(input => {
        input.disabled = false
    })
    submitBtn.disabled = false;

    imgHolder.style.pointerEvents = "auto"
    submitBtn.addEventListener('click', handleUpdate);
}

// Función para manejar la actualización
function handleUpdate(e) {
    e.preventDefault();
    const fotoInput = document.getElementById('uploadimg');
    const formData = new FormData();

    const information = {
        id: Date.now(),
        Foto: imgInput.src == undefined ? "./img/pic1.png" : imgInput.src,
        TipoDocumento: tipoDNI.value,
        NumeroDocumento: no_documento.value,
        PrimerNombre: fName.value,
        SegundoNombre: sName.value,
        Apellidos: lName.value,
        Genero: genero.value,
        FechaNacimiento: bDate.value,
        CorreoElectronico: email.value,
        Celular: phone.value
    }
    var rutaImagen = '../img/pic1.png';

    var miImagen = new Image();
    miImagen.src = rutaImagen;


    const information2 = {
        // Foto: fotoInput.files.length > 0 && fotoInput.files[0].type.startsWith('image/') ? fotoInput.files[0] : miImagen.src,    
        TipoDocumento: tipoDNI.value,
        NumeroDocumento: no_documento.value,
        PrimerNombre: fName.value,
        SegundoNombre: sName.value,
        Apellidos: lName.value,
        Genero: genero.value,
        FechaNacimiento: bDate.value,
        CorreoElectronico: email.value,
        Celular: phone.value
    };

    // Agregar los datos del formulario al objeto FormData
    for (const key in information2) {
        formData.append(key, information2[key]);
    }

    // Número de documento para la URL

    // Realizar la solicitud PUT
    fetch(`http://localhost:4004/actualizar/${no_documento.value}`, {
        method: 'PUT',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    if (!isEdit) {
        originalData.unshift(information)
    }
    else {
        originalData[editId] = information
    }
    getData = [...originalData]
    localStorage.setItem('userProfile', JSON.stringify(originalData))

    darkBg.classList.remove('active')
    popupForm.classList.remove('active')
    form.reset()


    highlightIndexBtn()
    displayIndexBtn()
    showInfo()

    // Eliminar el controlador de eventos para evitar múltiples asignaciones
    submitBtn.removeEventListener('click', handleUpdate);
}
// Eliminar datos
function deleteInfo(index, num_documento) {
    if (confirm("Estás seguro que quieres eliminar este registro?")) {
        originalData.splice(index, 1);
        localStorage.setItem("userProfile", JSON.stringify(originalData));
        console.log("deleting: " + num_documento);
        fetch(`http://127.0.0.1:4003/borrar/${num_documento}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Borrado exitoso:', data);
                // Realiza cualquier acción adicional después de un borrado exitoso
            })
            .catch(error => {
                console.error('Error al borrar:', error);
                // Realiza acciones adicionales en caso de error
            });

        // Update getData after deleting the record
        getData = [...originalData];

        preLoadCalculations()

        if (getData.length === 0) {
            currentIndex = 1
            startIndex = 1
            endIndex = 0
        }
        else if (currentIndex > maxIndex) {
            currentIndex = maxIndex
        }

        showInfo()
        highlightIndexBtn()
        displayIndexBtn()

        var nextBtn = document.querySelector('.next')
        var prevBtn = document.querySelector('.prev')

        if (Math.floor(maxIndex) > currentIndex) {
            nextBtn.classList.add("act")
        }
        else {
            nextBtn.classList.remove("act")
        }


        if (currentIndex > 1) {
            prevBtn.classList.add('act')
        }
    }
}



// Registrar en el form
form.addEventListener('submit', (e) => {
    e.preventDefault()
    // Crear un objeto FormData para enviar datos y archivos
    const fotoInput = document.getElementById('uploadimg');
    const formData = new FormData();

    const information = {
        Foto: imgInput.src == undefined ? "./img/pic1.png" : imgInput.src,
        TipoDocumento: tipoDNI.value,
        NumeroDocumento: no_documento.value,
        PrimerNombre: fName.value,
        SegundoNombre: sName.value,
        Apellidos: lName.value,
        Genero: genero.value,
        FechaNacimiento: bDate.value,
        CorreoElectronico: email.value,
        Celular: phone.value
    };

    const information2 = {
        Foto: fotoInput.files.length > 0 ? fotoInput.files[0] : null,
        TipoDocumento: tipoDNI.value,
        NumeroDocumento: no_documento.value,
        PrimerNombre: fName.value,
        SegundoNombre: sName.value,
        Apellidos: lName.value,
        Genero: genero.value,
        FechaNacimiento: bDate.value,
        CorreoElectronico: email.value,
        Celular: phone.value
    };

    // Agregar los datos del formulario al objeto FormData
    for (const key in information2) {
        formData.append(key, information2[key]);
    }

    fetch('http://127.0.0.1:4001/registrar', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            // Manejar la respuesta del servidor
            console.log(data);
        })
        .catch(error => {
            // Manejar errores de la solicitud
            console.error('Error en la solicitud:', error);
        });
    if (!isEdit) {
        originalData.unshift(information)
    }
    else {
        originalData[editId] = information
    }



    getData = [...originalData]


    submitBtn.innerHTML = "Registrar"
    modalTitle.innerHTML = "Registrar persona"

    darkBg.classList.remove('active')
    popupForm.classList.remove('active')
    form.reset()


    highlightIndexBtn()
    displayIndexBtn()
    showInfo()

    var nextBtn = document.querySelector(".next")
    var prevBtn = document.querySelector(".prev")
    if (Math.floor(maxIndex) > currentIndex) {
        nextBtn.classList.add("act")
    }
    else {
        nextBtn.classList.remove("act")
    }


    if (currentIndex > 1) {
        prevBtn.classList.add("act")
    }
})


function next() {
    var prevBtn = document.querySelector('.prev')
    var nextBtn = document.querySelector('.next')

    if (currentIndex <= maxIndex - 1) {
        currentIndex++
        prevBtn.classList.add("act")

        highlightIndexBtn()
    }

    if (currentIndex > maxIndex - 1) {
        nextBtn.classList.remove("act")
    }
}


function prev() {
    var prevBtn = document.querySelector('.prev')

    if (currentIndex > 1) {
        currentIndex--
        prevBtn.classList.add("act")
        highlightIndexBtn()
    }

    if (currentIndex < 2) {
        prevBtn.classList.remove("act")
    }
}


function paginationBtn(i) {
    currentIndex = i

    var prevBtn = document.querySelector('.prev')
    var nextBtn = document.querySelector('.next')

    highlightIndexBtn()

    if (currentIndex > maxIndex - 1) {
        nextBtn.classList.remove('act')
    }
    else {
        nextBtn.classList.add("act")
    }


    if (currentIndex > 1) {
        prevBtn.classList.add("act")
    }

    if (currentIndex < 2) {
        prevBtn.classList.remove("act")
    }
}


// Editar registro acción de tabla
tabSize.addEventListener('change', () => {
    var selectedValue = parseInt(tabSize.value)
    tableSize = selectedValue
    currentIndex = 1
    startIndex = 1
    displayIndexBtn()
})


const searchButton = document.querySelector('.filter button');
const clearButton = document.querySelector('.filter .clear-button');

getBtn.addEventListener('click', () => {
    fetch('http://127.0.0.1:4002/consultarall', {
        method: 'GET',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Inicializar el array getData con los datos obtenidos
            originalData = data;
            getData = [...originalData];
        })
        .then(() => {
            // Realizar cualquier otra lógica necesaria después de obtener los datos e imágenes
            preLoadCalculations();
            displayIndexBtn();
            showInfo();
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
            // Manejar el error, mostrar un mensaje, etc.
        });

});

searchButton.addEventListener('click', () => {
    const searchTerm = filterData.value.toLowerCase().trim();


    if (searchTerm !== "") {
        const no_documento = searchTerm;
        console.log("doing first fetch to document: " + no_documento);
        fetch(`http://127.0.0.1:4002/consultar/${no_documento}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Manipula los datos de la respuesta aquí  
                console.log(data);
                // Puedes retornar data aquí si es necesario
                getData = [data];// Realiza el segundo fetch después del primer fetch
                console.log("doing second fetch to document: " + no_documento);
                return fetch(`http://127.0.0.1:4002/obtener_foto/${no_documento}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'image/*', // Especifica el tipo de contenido esperado
                    },
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }

                // Verifica si el tipo de contenido es una imagen
                if (response.headers.get('content-type').startsWith('image/')) {
                    return response.blob(); // Retorna el blob de la imagen
                } else {
                    throw new Error('La respuesta no es una imagen');
                }
            })
            .then(blob => {
                // Crea una URL para la imagen
                getData[0]['Foto'] = URL.createObjectURL(blob);
            })
            .catch(error => {
                console.error('Error al buscar usuario:', error);
                // Maneja el error, muestra un mensaje, etc.
            })
            .finally(() => {
                console.log("Both fetch operations completed");
            });
        console.log("finished second fetch to document: " + no_documento);

    } else {
        // Restablecer a todos los datos si no hay término de búsqueda
        getData = originalData;
    }

    currentIndex = 1;
    startIndex = 1;
    displayIndexBtn();
});

clearButton.addEventListener('click', () => {
    // Limpiar el campo de búsqueda
    filterData.value = "";

    // Restablecer a todos los datos
    getData = originalData;

    currentIndex = 1;
    startIndex = 1;
    displayIndexBtn();
});

displayIndexBtn()


// INICIO LOG
var logBtn = document.getElementById('logBtn');

// Manejar clic en el botón de log
logBtn.addEventListener('click', () => {
    // Ocultar la vista principal
    document.querySelector('.container').style.display = 'none';

    // Mostrar la vista de log
    document.querySelector('.log-container').style.display = 'block';

    // Lógica para mostrar el log en la nueva vista
    showLogInfo();
});

// Lógica para mostrar el log en la nueva vista
function showLogInfo() {
    // ... (puedes agregar lógica de filtrado y mostrar la tabla del log aquí)

    // Ejemplo: Mostrar una entrada en el log
    let logEntry = {
        no_documento: '1129524368',
        tipo_documento: 'Tarjeta de identidad',
        nombre_completo: 'Jonathan Stiven Fontalvo Aparicio',
        accion: 'Se registró'
    };

    // Limpiar la tabla del log
    document.querySelector('.logTable tbody').innerHTML = '';

    // Mostrar la entrada en la tabla del log
    document.querySelector('.logTable tbody').innerHTML += `
        <tr>
            <td>${logEntry.no_documento}</td>
            <td>${logEntry.tipo_documento}</td>
            <td>${logEntry.nombre_completo}</td>
            <td>${logEntry.accion}</td>
        </tr>
    `;
}

// Función para filtrar el log
function filterLog() {
    // Implementa la lógica de filtrado del log aquí
    // Puedes usar los valores de #searchLog y #tipoDocumentoLog
}

// Función para limpiar los filtros del log
function clearLogFilters() {
    document.getElementById('searchLog').value = '';
    document.getElementById('tipoDocumentoLog').value = '';
    // Llamar a la función de filtrado para mostrar todos los registros
    filterLog();
}

// Función para volver a la vista principal
function goBack() {
    // Ocultar la vista de log
    document.querySelector('.log-container').style.display = 'none';
    // Mostrar la vista principal
    document.querySelector('.container').style.display = 'block';
}




// INICIO LOG
var logBtn = document.getElementById('logBtn');

// Manejar clic en el botón de log
logBtn.addEventListener('click', () => {
    // Ocultar la vista principal
    document.querySelector('.container').style.display = 'none';

    // Mostrar la vista de log
    document.querySelector('.log-container').style.display = 'block';

    // Lógica para mostrar el log en la nueva vista
    showLogInfo();
});

// Lógica para mostrar el log en la nueva vista
function showLogInfo() {
    // ... (puedes agregar lógica de filtrado y mostrar la tabla del log aquí)

    // Ejemplo: Mostrar una entrada en el log
    
}

// Función para filtrar el log
function filterLog() {
    // Implementa la lógica de filtrado del log aquí
    // Puedes usar los valores de #searchLog y #tipoDocumentoLog
}

// Función para limpiar los filtros del log
function clearLogFilters() {
    document.getElementById('searchLog').value = '';
    document.getElementById('tipoDocumentoLog').value = '';
    // Llamar a la función de filtrado para mostrar todos los registros
    filterLog();
}

// Función para volver a la vista principal
function goBack() {
    // Ocultar la vista de log
    document.querySelector('.log-container').style.display = 'none';
    // Mostrar la vista principal
    document.querySelector('.container').style.display = 'block';
}
