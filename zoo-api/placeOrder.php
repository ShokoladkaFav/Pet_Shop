<?php
// get_orders.php
require 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    $orderRepository = $entityManager->getRepository(Order::class);
    
    // Отримуємо всі замовлення, сортуємо за ID (останні знизу, але React пересортує)
    // Або краще відсортувати на рівні запиту
    $orders = $orderRepository->findBy([], ['id' => 'DESC']);

    // Серіалізуємо масив об'єктів у масив масивів/JSON
    $data = [];
    foreach ($orders as $order) {
        $data[] = [
            'id' => $order->getId(), // або $order->id, залежно від вашого Entity
            'order_number' => $order->order_number,
            'inventory_id' => $order->inventory_id,
            'quantity' => $order->quantity,
            'price' => $order->price,
            'subtotal' => $order->subtotal,
            'order_date' => $order->order_date, // Doctrine поверне об'єкт DateTime
            'status' => $order->status,
        ];
    }

    echo json_encode($data);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>