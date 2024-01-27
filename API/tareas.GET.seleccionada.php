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

// Comprobar si viene el id_tarea como parámetro GET
if (!isset($_GET['id_tarea'])) {
    $respuesta['error'] = 'No se ha recibido el id de la tarea';
    echo json_encode($respuesta);
    exit;
}

// Acceder a los datos del parámetro GET
$idTarea = mysqli_real_escape_string($con, $_GET['id_tarea']);

$sql = "SELECT id_tarea, nombre, completada FROM tarea WHERE id_tarea = ?";

// Preparar y ejecutar la sentencia
if ($stmt = mysqli_prepare($con, $sql)) {
    mysqli_stmt_bind_param($stmt, "i", $idTarea);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    // Obtener resultados
    $tarea = mysqli_fetch_assoc($result);

    if ($tarea) {
        $respuesta['success'] = true;
        $respuesta['data'] = $tarea;
    } else {
        $respuesta['error'] = 'No se ha encontrado la tarea';
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
