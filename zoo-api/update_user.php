<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Не вказано ID користувача"]);
    exit;
}

$userId = $data['user_id'];
$address = $data['address'] ?? '';
$phone = $data['phone'] ?? '';

$stmt = $pdo->prepare("UPDATE users SET address = ?, phone = ? WHERE user_id = ?");
if ($stmt->execute([$address, $phone, $userId])) {
    echo json_encode(["status" => "success", "message" => "Дані оновлено"]);
} else {
    echo json_encode(["status" => "error", "message" => "Помилка оновлення"]);
}
?>