<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name'], $data['price'], $data['supplier_id'])) {
    echo json_encode(["status" => "error", "message" => "Заповніть поля"]);
    exit;
}

try {
    $entityManager->beginTransaction();

    $product = new Product();
    $product->name = $data['name'];
    $product->category = $data['category'];
    $product->price = (float)$data['price'];
    $product->supplier_id = (int)$data['supplier_id'];
    $product->description = $data['description'] ?? '';
    $product->image_url = $data['image_url'] ?? '';

    $entityManager->persist($product);
    $entityManager->flush(); 

    if (isset($data['quantity'])) {
        $inventory = new Inventory();
        $inventory->product_id = $product->product_id;
        $inventory->quantity = (int)$data['quantity'];
        $inventory->location = $data['location'] ?? 'Warehouse A';
        
        $entityManager->persist($inventory);
        $entityManager->flush();
    }

    $entityManager->commit();
    echo json_encode(["status" => "success", "message" => "Товар додано"]);

} catch (Exception $e) {
    $entityManager->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>