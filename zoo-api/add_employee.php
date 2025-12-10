<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['first_name'], $data['work_email'], $data['password'], $data['position'])) {
    echo json_encode(["status" => "error", "message" => "Заповніть всі обов'язкові поля"]);
    exit;
}

$firstName = trim($data['first_name']);
$lastName = isset($data['last_name']) ? trim($data['last_name']) : '';
$email = trim($data['work_email']);
$position = trim($data['position']);
$password = trim($data['password']);

// Перевірка, чи існує email
$stmt = $pdo->prepare("SELECT employee_id FROM employee WHERE work_email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "Цей Email вже використовується"]);
    exit;
}

// Генерація хешу пароля (така ж логіка, як у реєстрації користувача)
$salt = bin2hex(random_bytes(16));
$hash = hash('sha256', $password . $salt);

try {
    $sql = "INSERT INTO employee (first_name, last_name, work_email, position, hash, salt) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$firstName, $lastName, $email, $position, $hash, $salt])) {
        echo json_encode(["status" => "success", "message" => "Працівника додано"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Помилка при створенні запису"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>