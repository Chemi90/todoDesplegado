<?php
// Cabecera JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT'); // Si solo permites PUT requests

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

// Comprobar si se reciben el id_usuario e id_tarea como parámetros GET
if (!isset($_GET['id_usuario']) || !isset($_GET['id_tarea'])) {
    $respuesta['error'] = 'No se ha recibido el id_usuario o el id_tarea';
    echo json_encode($respuesta);
    exit;
}

$idUsuario = mysqli_real_escape_string($con, $_GET['id_usuario']);
$idTarea = mysqli_real_escape_string($con, $_GET['id_tarea']);

// Recibir los datos por JSON para el estado de completada
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);
error_log("Datos recibidos en la solicitud PUT: " . print_r($data, true));

// Comprobar si el estado de completada está presente en los datos JSON
if ($data === null || !isset($data['completada'])) {
    $respuesta['error'] = 'Datos inválidos o faltantes para completada';
    echo json_encode($respuesta);
    exit;
}

$completada = (int)$data['completada']; // Convertir a entero

$sql = "UPDATE tarea SET completada = ? WHERE id_tarea = ? AND id_usuario = ?";

// Preparar y ejecutar la sentencia
if ($stmt = mysqli_prepare($con, $sql)) {
    mysqli_stmt_bind_param($stmt, "iii", $completada, $idTarea, $idUsuario);
    $success = mysqli_stmt_execute($stmt);

    // Comprobar si la actualización fue exitosa
    if ($success) {
        $respuesta['success'] = true;
        $respuesta['data'] = "Estado de la tarea actualizado correctamente.";
    } else {
        $respuesta['error'] = 'No se ha podido actualizar el estado de la tarea';
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
