<?php
// ... (початок файлу з CORS та db.php)
$data = json_decode(file_get_contents("php://input"), true);
$orderNumber = "ORD" . time() . rand(10, 99);

foreach ($data as $item) {
    $stmt = $conn->prepare("INSERT INTO orders (order_number, inventory_id, quantity, price, subtotal, order_date, status) VALUES (?, ?, ?, ?, ?, NOW(), 'New')");
    $stmt->execute([$orderNumber, $item['product_id'], $item['quantity'], $item['price'], $item['price'] * $item['quantity']]);
}
echo json_encode(["status" => "success", "order_number" => $orderNumber]);
?>