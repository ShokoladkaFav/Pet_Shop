<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require 'db.php';

if (!isset($pdo)) {
    echo json_encode(["status" => "error", "message" => "Помилка підключення до БД"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    $upd = $pdo->prepare("UPDATE product SET price = ? WHERE product_id = ?");
    $upd->execute([$data['price'], $data['product_id']]);
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>