<?php
require 'db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Cache-Control: no-cache, no-store, must-revalidate"); // Заборона кешування
header("Content-Type: application/json; charset=UTF-8");

try {
    $orderRepository = $entityManager->getRepository(Order::class);

    // 1. Сортуємо за датою (order_date), оскільки поле 'id' може бути не розпізнане Doctrine для сортування
    $orders = $orderRepository->findBy([], ['order_date' => 'DESC']);

    $data = [];
    foreach ($orders as $order) {
        
        // 🛠️ HELPER: Безпечне отримання значень (перевіряє і геттери, і властивості)
        $getVal = function($obj, $props, $getters) {
            // Перевіряємо методи (геттери)
            foreach ((array)$getters as $method) {
                if (method_exists($obj, $method)) return $obj->$method();
            }
            // Перевіряємо властивості (якщо публічні або __get)
            foreach ((array)$props as $prop) {
                if (isset($obj->$prop)) return $obj->$prop; 
                // Спроба доступу, навіть якщо isset false (на випадок null), але property_exists true
                if (property_exists($obj, $prop)) {
                     // Використовуємо рефлексію для приватних властивостей, якщо геттера немає
                     try {
                        $reflection = new ReflectionClass($obj);
                        $property = $reflection->getProperty($prop);
                        $property->setAccessible(true);
                        return $property->getValue($obj);
                     } catch (Exception $e) {}
                }
            }
            return null;
        };

        // 🆔 Визначаємо ID (шукаємо order_id або id)
        $id = $getVal($order, ['order_id', 'id'], ['getOrderId', 'getId']);

        // 📅 Форматуємо дату
        $dateVal = $getVal($order, ['order_date', 'date'], ['getOrderDate', 'getDate']);
        if ($dateVal instanceof DateTime) {
            $dateVal = $dateVal->format('Y-m-d H:i:s');
        }

        // Збираємо дані, використовуючи безпечний хелпер
        $data[] = [
            'id' => $id, 
            'order_number' => $getVal($order, 'order_number', ['getOrderNumber', 'getOrder_number']),
            'inventory_id' => $getVal($order, 'inventory_id', ['getInventoryId', 'getInventory_id']),
            'quantity' => $getVal($order, 'quantity', 'getQuantity'),
            'price' => $getVal($order, 'price', 'getPrice'),
            'subtotal' => $getVal($order, 'subtotal', 'getSubtotal'),
            'order_date' => $dateVal,
            'status' => $getVal($order, 'status', 'getStatus'),
        ];
    }

    echo json_encode($data);

} catch (Exception $e) {
    // Повертаємо JSON з помилкою, щоб фронтенд міг її показати
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}
?>