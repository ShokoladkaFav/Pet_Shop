<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['product_id'])) {
    echo json_encode(["status" => "error", "message" => "ID товару не передано"]);
    exit;
}

$productId = $data['product_id'];

try {
    $stmt = $pdo->prepare("DELETE FROM product WHERE product_id = ?");
    if ($stmt->execute([$productId])) {
        echo json_encode(["status" => "success", "message" => "Товар видалено"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Не вдалося видалити товар"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>