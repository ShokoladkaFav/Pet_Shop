<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data)) {
    echo json_encode(["status" => "error", "message" => "Кошик порожній"]);
    exit;
}

try {
    $entityManager->beginTransaction();
    
    $orderNumber = "ORD" . time() . rand(100, 999);
    $orderDate = new DateTime();

    foreach ($data as $item) {
        $invRepo = $entityManager->getRepository(Inventory::class);
        $inventory = $invRepo->findOneBy(['product_id' => $item['product_id']]);

        $invId = $inventory ? $inventory->inventory_id : 0;

        $order = new Order();
        $order->order_number = $orderNumber;
        $order->inventory_id = $invId;
        $order->quantity = $item['quantity'];
        $order->price = $item['price'];
        $order->subtotal = $item['price'] * $item['quantity'];
        $order->order_date = $orderDate;
        $order->status = 'New';

        $entityManager->persist($order);
    }

    $entityManager->flush();
    $entityManager->commit();
    echo json_encode(["status" => "success", "message" => "Замовлення $orderNumber створено"]);

} catch (Exception $e) {
    $entityManager->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>