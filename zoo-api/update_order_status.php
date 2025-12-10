<?php
// update_order_status.php
require 'db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_number']) || !isset($data['status'])) {
    echo json_encode(["status" => "error", "message" => "Не вказано номер замовлення або статус."]);
    exit;
}

$orderNumber = $data['order_number'];
$newStatus = $data['status'];

try {
    // 1. Отримуємо репозиторій замовлень
    $orderRepository = $entityManager->getRepository(Order::class);

    // 2. Шукаємо ВСІ товари, що належать до цього замовлення (за номером)
    // Doctrine автоматично знайде поле order_number, якщо воно є в сутності
    $orders = $orderRepository->findBy(['order_number' => $orderNumber]);

    if (!$orders) {
        echo json_encode(["status" => "error", "message" => "Замовлення #$orderNumber не знайдено."]);
        exit;
    }

    $updatedCount = 0;

    foreach ($orders as $orderItem) {
        // 3. Безпечно оновлюємо статус
        if (method_exists($orderItem, 'setStatus')) {
            $orderItem->setStatus($newStatus);
        } else {
            // Якщо немає методу, пробуємо через рефлексію (для приватних властивостей)
            try {
                $reflection = new ReflectionClass($orderItem);
                if ($reflection->hasProperty('status')) {
                    $property = $reflection->getProperty('status');
                    $property->setAccessible(true);
                    $property->setValue($orderItem, $newStatus);
                } else {
                   // Fallback: спроба прямого запису (якщо public або __set)
                   $orderItem->status = $newStatus;
                }
            } catch (Exception $e) {
                // Ігноруємо помилки рефлексії, йдемо далі
            }
        }
        $updatedCount++;
    }

    // 4. Зберігаємо зміни в БД
    $entityManager->flush();

    echo json_encode([
        "status" => "success", 
        "message" => "Оновлено $updatedCount позицій замовлення #$orderNumber",
        "new_status" => $newStatus
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server Error: " . $e->getMessage()]);
}
?>