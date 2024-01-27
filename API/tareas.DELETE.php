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

// Comprobar si se recibe el id_tarea como parámetro GET
if (!isset($_GET['id_tarea'])) {
    $respuesta['error'] = 'No se ha recibido el id de la tarea';
    echo json_encode($respuesta);
    exit;
}

// Acceder al id de la tarea desde los parámetros GET
$idTarea = mysqli_real_escape_string($con, $_GET['id_tarea']);

$sql = "DELETE FROM tarea WHERE id_tarea = ?";

// Preparar y ejecutar la sentencia
if ($stmt = mysqli_prepare($con, $sql)) {
    mysqli_stmt_bind_param($stmt, "i", $idTarea);
    $success = mysqli_stmt_execute($stmt);

    // Comprobar si la eliminación fue exitosa
    if ($success) {
        $respuesta['success'] = true;
        $respuesta['data'] = "Tarea eliminada correctamente.";
    } else {
        $respuesta['error'] = 'No se ha podido eliminar la tarea';
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
