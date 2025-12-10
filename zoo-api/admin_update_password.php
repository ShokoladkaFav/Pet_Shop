<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'], $data['password'])) {
    echo json_encode(["status" => "error", "message" => "Відсутні дані"]);
    exit;
}

$id = $data['id'];
$password = $data['password'];

// Генеруємо нову сіль та хеш
$salt = bin2hex(random_bytes(16));
$hash = hash('sha256', $password . $salt);

$stmt = $pdo->prepare("UPDATE employee SET hash = ?, salt = ? WHERE employee_id = ?");

if ($stmt->execute([$hash, $salt, $id])) {
    echo json_encode(["status" => "success", "message" => "Пароль оновлено"]);
} else {
    echo json_encode(["status" => "error", "message" => "Помилка бази даних"]);
}
?>