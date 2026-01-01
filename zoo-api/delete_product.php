<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require 'db.php';

// Використовуємо $conn, оскільки він визначений у вашому db.php
// (Або $pdo, якщо ви додали $pdo = $conn в db.php)
$dbConnection = isset($pdo) ? $pdo : (isset($conn) ? $conn : null);

if (!$dbConnection) {
    echo json_encode(["status" => "error", "message" => "Помилка конфігурації БД"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['product_id'])) {
    echo json_encode(["status" => "error", "message" => "ID товару не передано"]);
    exit;
}

$productId = $data['product_id'];

try {
    $stmt = $dbConnection->prepare("DELETE FROM product WHERE product_id = ?");
    if ($stmt->execute([$productId])) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "Товар видалено"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Товар не знайдено в базі"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Не вдалося видалити товар"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Помилка БД: " . $e->getMessage()]);
}
?>