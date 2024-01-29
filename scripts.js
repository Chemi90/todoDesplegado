let currentUser = null;


// Función para mostrar el formulario de login
function showLogin() {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("tasks-section").style.display = "none";
    sessionStorage.setItem('currentView', 'login');
}

// Función para mostrar el formulario de registro
function showRegister() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
    document.getElementById("tasks-section").style.display = "none";
    sessionStorage.setItem('currentView', 'register');
}

// Función para mostrar la app de tareas
function showTasks() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("tasks-section").style.display = "block";
    updateUserNameDisplay();
    displayTasks();

    // Guardar la vista actual en sessionStorage
    sessionStorage.setItem('currentView', 'tasks');
}

// Este bloque se ejecuta cuando el contenido del DOM está completamente cargado.
// Añade un listener al checkbox de mostrar tareas completadas para actualizar la lista de tareas.
// Llama a restoreState para restaurar la sección que estaba siendo visualizada antes de recargar.
// Si hay un usuario logueado, muestra sus tareas.
// Añade un listener para restaurar el estado cuando se carga el contenido del DOM.
document.addEventListener('DOMContentLoaded', function () {
    // Añade un listener al checkbox de mostrar tareas completadas.
    document.getElementById('show-completed').addEventListener('change', displayTasks);
// Restaura el estado de la aplicación.
restoreState();
    // Obtiene el estado del usuario y la vista actual almacenados en sessionStorage.
    const storedUser = sessionStorage.getItem('loggedInUser');
    const currentView = sessionStorage.getItem('currentView');

    // Restablece el estado del usuario y muestra la vista correspondiente.
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserNameDisplay();

        // Elige qué vista mostrar basándose en la vista almacenada.
        if (currentView === 'tasks') {
            displayTasks();
            showTasks();
        } else if (currentView === 'register') {
            showRegister();
        } else {
            // Si no hay una vista específica, muestra la vista de login.
            showLogin();
        }
    } else {
        // Si no hay un usuario almacenado, muestra la vista de login.
        showLogin();
    }

    // Elimina la llamada duplicada a restoreState aquí.
});

// Esta función maneja el registro de nuevos usuarios.
// Obtiene los valores de los campos del formulario de registro.
// Realiza varias validaciones: espacios en el nombre, usuario y contraseña.
// Comprueba si el usuario ya existe en localStorage.
// Si no existe, lo agrega y muestra la pantalla de login.
function registerUser() {
    let name = document.getElementById('name').value;
    let username = document.getElementById('new-username').value;
    let password = document.getElementById('new-password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    // Validar que el nombre no tenga espacios al principio o al final
    if (name.trim() !== name) {
        alert('El nombre no debe tener espacios al principio o al final.');
        return;
    }

    // Validar que el usuario y la contraseña no tengan espacios
    if (username.includes(' ') || password.includes(' ')) {
        alert('El usuario y la contraseña no deben contener espacios.');
        return;
    }

    // Verificar si las claves coinciden
    if (password !== confirmPassword) {
        alert('Las claves no coinciden.');
        return;
    }

    // Construir el objeto JSON con los datos del usuario
    let userData = {
        nombre: name,
        usuario: username,
        clave: password
    };

    // Realizar la solicitud POST al script PHP
    fetch('../API/login.POST.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            alert('Usuario registrado exitosamente.');
            // Vaciar los campos del formulario de registro
            document.getElementById('name').value = '';
            document.getElementById('new-username').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            // Cambiar a la pantalla de login
            showLogin();

            // Rellenar el campo de usuario y poner el foco en el campo de contraseña
            document.getElementById('username').value = username;
            document.getElementById('password').focus();
        } else {
            alert('Error al registrar el usuario: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al registrar el usuario:', error);
    });
}


// Maneja el proceso de inicio de sesión.
// Obtiene el nombre de usuario y contraseña introducidos.
// Verifica si coinciden con algún usuario registrado en localStorage.
// Si es correcto, guarda este usuario como 'loggedInUser' y muestra la sección de tareas.
function loginUser() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    fetch('../API/login.GET.usuario.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usuario: username,
            clave: password
        })
    })
    .then(response => response.json())
    .then(json => {
        console.log("Respuesta de login:", json); // Depuración: Imprimir respuesta del servidor

        if (json.success) {
            currentUser = {
                id_usuario: json.data.id_usuario,
                nombre: json.data.nombre,
            };
            console.log("Usuario logueado:", currentUser);
            sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
            document.getElementById('taskList').innerHTML = '';
            updateUserNameDisplay();  // Actualiza el nombre del usuario
            displayTasks(); // Carga las tareas del usuario logueado
            showTasks();
        } else {
            alert('Usuario o contraseña incorrecta.');
        }
    })
    .catch(error => {
        console.error('Error al intentar iniciar sesión:', error);
    });
}

function logout() {
    // Limpiar sessionStorage
    sessionStorage.removeItem('loggedInUser');
    
    // Restablecer el estado de la aplicación
    currentUser = null;
    document.getElementById('taskList').innerHTML = '';
    showLogin();
}

function updateUserNameDisplay() {
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.nombre;
    }
}

function changeView(viewName) {
    // Cambia la vista aquí...
    showView(viewName);
    // Guarda la vista actual en sessionStorage
    sessionStorage.setItem('currentView', viewName);
}

// Añade una nueva tarea.
// Verifica si hay un usuario logueado y si el nombre de la tarea no está vacío.
// Crea un objeto de tarea y lo añade a la lista de tareas del usuario en localStorage.
// Luego actualiza la lista de tareas en el DOM.
function addTask() {
    let taskName = document.getElementById('taskName').value.trim();
    if (!taskName) {
        alert('Por favor, ingresa el nombre de la tarea.');
        return;
    }

    if (!currentUser || !currentUser.id_usuario) {
        alert('No hay usuario logueado o falta información del usuario.');
        return;
    }

    // Preparar el objeto de la tarea
    let task = {
        nombre: taskName
    };

    // Hacer una solicitud POST a tu API para guardar la tarea
    fetch('../API/tareas.POST.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_usuario: currentUser.id_usuario,
            nombre: task.nombre
        })
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            alert('Tarea agregada correctamente');
            displayTasks(); // Actualizar la lista de tareas
        } else {
            alert('Error al agregar la tarea: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al agregar la tarea:', error);
    });

    // Limpiar el campo de entrada
    document.getElementById('taskName').value = '';
}

// Muestra las tareas del usuario logueado.
// Comprueba si hay tareas completadas y si deben mostrarse según el estado del checkbox.
// Crea elementos del DOM para cada tarea y los añade a la lista de tareas en la página.
function displayTasks() {
    if (!currentUser) {
        console.log("No hay usuario logueado.");
        return;
    }

    let showCompleted = document.getElementById('show-completed').checked;

    fetch('../API/tareas.GET.php?id_usuario=' + currentUser.id_usuario)
    .then(response => response.json())
    .then(json => {
        let taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        if (json.success) {
            json.data.forEach(task => {
                // Mostrar solo si la tarea no está completada o si el checkbox está marcado
                if (!task.completada || showCompleted) {
                    let taskElement = document.createElement('div');
                    taskElement.classList.add('task-item');
                    
                    // Añadir nombre de la tarea
                    let taskName = document.createElement('span');
                    taskName.textContent = task.nombre;
                    taskElement.appendChild(taskName);
            
                    // Añadir botón de completar si la tarea no está completada
                    if (!task.completada) {
                        let completeButton = document.createElement('button');
                        completeButton.textContent = 'Completar';
                        completeButton.onclick = function() {
                            completeTask(task.id_tarea);
                        };
                        taskElement.appendChild(completeButton);
                    }
            
                    // Añadir botón de eliminar
                    let deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.onclick = function() {
                        deleteTask(task.id_tarea);
                    };
                    taskElement.appendChild(deleteButton);
            
                    // Añadir el elemento de tarea a taskList
                    taskList.appendChild(taskElement);
                }
            });

            updateTaskCounters(json.data);
        } else {
            console.error('Error al obtener las tareas:', json.error);
            updateTaskCounters([]);
        }
    })
    .catch(error => {
        console.error('Error al realizar la solicitud:', error);
        updateTaskCounters([]);
    });
}

function completeTask(taskId) {
    console.log("Intentando completar la tarea. Tarea actual:", taskId);
    if (!currentUser || !currentUser.id_usuario) {
        alert('No hay usuario logueado.');
        return;
    }
    console.log("Valor de taskId:", taskId);
console.log("Valor de currentUser:", currentUser);

    
    // Obtener la tarea actual para obtener su nombre antes de eliminarla
    fetch(`../API/tareas.GET.seleccionada.php?id_tarea=${taskId}`)
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            const taskName = json.data.nombre;

            // URL de tu API para eliminar la tarea
            let deleteUrl = `../API/tareas.DELETE.php?id_tarea=${taskId}`;

            // Realizar la solicitud para eliminar la tarea
            fetch(deleteUrl, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(deleteJson => {
                if (deleteJson.success) {
                    // Ahora, crear una nueva tarea con el mismo nombre marcada como completada
                    let createUrl = '../API/tareas.POST.completada.php';

                    fetch(createUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id_usuario: currentUser.id_usuario,
                            nombre: taskName,
                            completada: true // Marcar como completada
                        })
                    })
                    .then(response => response.json())
                    .then(createJson => {
                        if (createJson.success) {
                            alert('Tarea completada correctamente.');
                            displayTasks();
                        } else {
                            alert('Error al crear la nueva tarea: ' + createJson.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error al crear la nueva tarea:', error);
                    });
                } else {
                    alert('Error al eliminar la tarea: ' + deleteJson.error);
                }
            })
            .catch(error => {
                console.error('Error al eliminar la tarea:', error);
            });
        } else {
            alert('No se pudo obtener la tarea actual.');
        }
    })
    .catch(error => {
        console.error('Error al obtener la tarea actual:', error);
    });
}

function deleteTask(taskId) {
    console.log("Intentando eliminar la tarea. Usuario actual:", currentUser);
    if (!currentUser || !currentUser.id_usuario) {
        alert('No hay usuario logueado.');
        return;
    }

    // URL de tu API para eliminar la tarea
    let url = `../API/tareas.DELETE.php?id_usuario=${currentUser.id_usuario}&id_tarea=${taskId}`;

    fetch(url, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            alert('Tarea eliminada correctamente');
            displayTasks();
        } else {
            alert('Error al eliminar la tarea: ' + json.error);
        }
    })
    .catch(error => {
        console.error('Error al eliminar la tarea:', error);
    });
}

// Actualiza los contadores de tareas completadas y pendientes en la interfaz de usuario.
function updateTaskCounters(tasks) {
    let completedTasks = tasks.filter(task => task.completada).length;
    let pendingTasks = tasks.length - completedTasks;

    document.getElementById('completedTasks').textContent = `Completadas: ${completedTasks}`;
    document.getElementById('pendingTasks').textContent = `Pendientes: ${pendingTasks}`;
}

// Restaura la sección visualizada antes de recargar la página.
// Lee la sección actual de localStorage y muestra la sección correspondiente.
function restoreState() {
    // Obtiene el estado del usuario y la vista actual almacenados en sessionStorage.
    const storedUser = sessionStorage.getItem('loggedInUser');
    const currentView = sessionStorage.getItem('currentView');

    // Restablece el estado del usuario y muestra la vista correspondiente.
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserNameDisplay();

        if (currentView === 'tasks') {
            displayTasks();
            showTasks();
        } else if (currentView === 'register') {
            showRegister();
        } else {
            showLogin();
        }
    } else {
        showLogin();
    }
}