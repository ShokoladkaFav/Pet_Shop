<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['employee_id'])) {
    echo json_encode(["status" => "error", "message" => "ID працівника не вказано"]);
    exit;
}

$id = $data['employee_id'];

try {
    // Перевірка, чи не намагаємось видалити себе (опціонально, можна і на фронті)
    // Але тут просто видаляємо
    $stmt = $pdo->prepare("DELETE FROM employee WHERE employee_id = ?");
    
    if ($stmt->execute([$id])) {
        echo json_encode(["status" => "success", "message" => "Працівника видалено"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Не вдалося видалити запис"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>