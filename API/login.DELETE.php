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

// Conexión a la base de datos con PDO
$dsn = 'mysql:host=localhost;dbname=todo';
$user = 'root';
$pass = 'posnose90';

try {
    $conexionBBDD = new PDO($dsn, $user, $pass);
    $conexionBBDD->exec("set names utf8");
} catch (PDOException $e) {
    $respuesta['error'] = 'No se ha podido conectar con la base de datos: ' . $e->getMessage();
    echo json_encode($respuesta);
    exit;
}

// Verificar si el id_usuario está presente en los parámetros de la URL
if (!isset($_GET['id_usuario'])) {
    $respuesta['error'] = 'Datos inválidos o faltantes';
    echo json_encode($respuesta);
    exit;
}

$idUsuario = $_GET['id_usuario'];

try {
    // Iniciar transacción
    $conexionBBDD->beginTransaction();

    // Eliminar primero las tareas asignadas al usuario
    $sqlTareas = "DELETE FROM tarea WHERE id_usuario = :id_usuario";
    $stmtTareas = $conexionBBDD->prepare($sqlTareas);
    $stmtTareas->execute(['id_usuario' => $idUsuario]);

    // Luego, eliminar al usuario
    $sqlUsuario = "DELETE FROM usuarios WHERE id_usuario = :id_usuario";
    $stmtUsuario = $conexionBBDD->prepare($sqlUsuario);
    $stmtUsuario->execute(['id_usuario' => $idUsuario]);

    // Confirmar transacción
    $conexionBBDD->commit();

    $respuesta['success'] = true;
    $respuesta['data'] = 'Usuario y sus tareas eliminadas correctamente';
} catch (PDOException $e) {
    // Revertir transacción en caso de error
    $conexionBBDD->rollBack();
    $respuesta['error'] = 'Error al eliminar usuario y tareas: ' . $e->getMessage();
}

echo json_encode($respuesta);
?>
