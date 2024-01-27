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

// Preparar la sentencia SQL para obtener los usuarios
$sql = "SELECT id_usuario, nombre, usuario FROM usuarios";

// Preparar y ejecutar la sentencia
$stmt = $conexionBBDD->prepare($sql);
$stmt->execute();

// Obtener resultados
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($usuarios) {
    $respuesta['success'] = true;
    $respuesta['data'] = $usuarios;
} else {
    $respuesta['error'] = 'No se han encontrado usuarios';
}

echo json_encode($respuesta);
?>
