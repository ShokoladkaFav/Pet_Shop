<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['name'], $data['price'], $data['supplier_id'])) {
    echo json_encode(["status" => "error", "message" => "Неповні дані"]);
    exit;
}

try {
    $conn->beginTransaction();

    // 1. Додаємо в таблицю products
    $stmt = $conn->prepare("INSERT INTO products (name, category, price, description, supplier_id, image_url) 
                            VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'],
        $data['category'],
        $data['price'],
        $data['description'] ?? '',
        $data['supplier_id'],
        $data['image_url'] ?? ''
    ]);
    
    $productId = $conn->lastInsertId();

    // 2. Додаємо початковий запис в inventory
    $stmtInv = $conn->prepare("INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)");
    $stmtInv->execute([
        $productId,
        $data['quantity'] ?? 0,
        $data['location'] ?? 'Склад-A1'
    ]);

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Товар успішно додано"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>