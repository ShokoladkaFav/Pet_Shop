<?php

// 1. Підключаємо вашу базу даних та заголовки
// Це автоматично підключить $conn (PDO) та дозволить заголовок Authorization
require_once 'db.php';

try {
    /**
     * 2. Логіка запиту.
     * Використовуємо вашу змінну $conn, яку створили в db.php
     */
    $sql = "SELECT 
                i.inventory_id, 
                p.product_id,
                p.name AS product_name, 
                p.category, 
                i.location, 
                s.name AS supplier_name, 
                i.quantity, 
                p.price,
                p.image_url
            FROM inventory i
            INNER JOIN product p ON i.product_id = p.product_id
            LEFT JOIN supplier s ON p.supplier_id = s.supplier_id
            ORDER BY i.inventory_id DESC";

    $stmt = $conn->query($sql);
    $inventory = $stmt->fetchAll();

    // 3. Вивід даних у форматі JSON
    echo json_encode($inventory);

} catch (Exception $e) {
    // У разі помилки повертаємо її в форматі JSON
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Помилка виконання запиту: " . $e->getMessage()
    ]);
}
?>