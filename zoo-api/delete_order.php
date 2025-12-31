<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_number'])) {
    echo json_encode(["status" => "error", "message" => "Номер замовлення відсутній"]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM orders WHERE order_number = ?");
    $stmt->execute([$data['order_number']]);
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>