<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'], $data['password'])) {
    echo json_encode(["status" => "error", "message" => "Введіть email та пароль"]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

try {
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $checkHash = hash('sha256', $password . $user['salt']);
        
        if ($checkHash === $user['hash']) {
            echo json_encode([
                "status" => "success",
                "user" => [
                    "user_id" => $user['user_id'], // Використовуємо 'user_id' з бази
                    "username" => $user['username'],
                    "email" => $user['email'],
                    "address" => $user['address'] ?? "",
                    "phone" => $user['phone'] ?? ""
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Невірний пароль"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Користувача не знайдено"]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Помилка сервера: " . $e->getMessage()]);
}
?>