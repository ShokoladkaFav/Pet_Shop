<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['product_id'])) {
    echo json_encode(["status" => "error", "message" => "ID товару обов'язковий"]);
    exit;
}

try {
    $conn->beginTransaction();

    // 1. Оновлюємо основну таблицю
    $stmt = $conn->prepare("UPDATE product SET name=?, category=?, price=?, description=?, supplier_id=?, image_url=? WHERE product_id=?");
    $stmt->execute([
        $data['name'],
        $data['category'],
        $data['price'],
        $data['description'],
        $data['supplier_id'],
        $data['image_url'],
        $data['product_id']
    ]);

    // 2. Оновлюємо інвентар
    $stmtInv = $conn->prepare("UPDATE inventory SET quantity=?, location=? WHERE product_id=?");
    $stmtInv->execute([
        $data['quantity'],
        $data['location'],
        $data['product_id']
    ]);

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Дані оновлено"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>