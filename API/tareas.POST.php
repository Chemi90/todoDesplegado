<?php
// Cabecera JSON
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");


// Respuesta por defecto
$respuesta = [
    'success' => false,
    'data' => null,
    'error' => ''
];

// Conexión a la base de datos con mysqli
$host = 'servidorxemi.mysql.database.azure.com'; // Tu servidor de Azure
$username = 'xemita'; // Usuario de Azure
$password = 'Posnose90'; // Contraseña
$dbname = 'todo'; // Nombre de la base de datos
$port = 3306; // Puerto

$con = mysqli_connect($host, $username, $password, $dbname, $port);

// Verificar conexión
if (!$con) {
    $respuesta['error'] = 'No se ha podido conectar con la base de datos: ' . mysqli_connect_error();
    echo json_encode($respuesta);
    exit;
}

// Recibir los datos por JSON
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Verificar si la decodificación JSON fue exitosa y si los datos necesarios están presentes
if ($data === null || !isset($data['id_usuario']) || !isset($data['nombre'])) {
    $respuesta['error'] = 'Datos inválidos o faltantes';
    echo json_encode($respuesta);
    exit;
}

// Acceder a los datos del objeto JSON
$idUsuarioTarea = $data['id_usuario'];
$nombreTarea = $data['nombre'];

$sql = "INSERT INTO tarea (id_usuario, nombre, completada) VALUES (?, ?, 0)";

// Preparar y ejecutar la sentencia
if ($stmt = mysqli_prepare($con, $sql)) {
    mysqli_stmt_bind_param($stmt, "is", $idUsuarioTarea, $nombreTarea);
    $success = mysqli_stmt_execute($stmt);
    $idTareaInsertada = mysqli_insert_id($con);

    // Comprobar si la inserción fue exitosa
    if ($success && $idTareaInsertada) {
        $respuesta['success'] = true;
        $respuesta['data'] = [
            'id_tarea' => $idTareaInsertada,    
            'nombre' => $nombreTarea,
            'fecha' => date('Y-m-d H:i:s')
        ];
    } else {
        $respuesta['error'] = 'No se ha podido insertar la tarea';
    }

    // Cerrar la sentencia
    mysqli_stmt_close($stmt);
} else {
    $respuesta['error'] = 'Error al preparar la consulta: ' . mysqli_error($con);
}

// Cerrar la conexión
mysqli_close($con);

echo json_encode($respuesta);
?>
