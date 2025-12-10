<?php
require 'db.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['order_number'])) {
    echo json_encode(["status" => "error", "message" => "Order Number missing"]);
    exit;
}

try {
    $orderRepo = $entityManager->getRepository(Order::class);
    $orders = $orderRepo->findBy(['order_number' => $data['order_number']]);

    foreach ($orders as $order) {
        $entityManager->remove($order);
    }
    
    $entityManager->flush();

    echo json_encode(["status" => "success", "message" => "Deleted " . count($orders) . " items"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>