<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['email'], $data['password'])) {
    echo json_encode(["status" => "error", "message" => "Заповніть всі поля"]);
    exit;
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = $data['password'];

try {
    // Виправлено: шукаємо 'user_id' замість 'id'
    $checkStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $checkStmt->execute([$email]);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(["status" => "error", "message" => "Email вже використовується"]);
        exit;
    }

    $salt = bin2hex(random_bytes(16));
    $hash = hash('sha256', $password . $salt);
    $registration_date = date('Y-m-d H:i:s');

    $stmt = $conn->prepare("INSERT INTO users (username, email, hash, salt, registration_date) VALUES (?, ?, ?, ?, ?)");
    
    if ($stmt->execute([$username, $email, $hash, $salt, $registration_date])) {
        echo json_encode(["status" => "success", "message" => "Реєстрація успішна"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Помилка бази даних"]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Помилка сервера: " . $e->getMessage()]);
}
?>