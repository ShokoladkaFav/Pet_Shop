<?php
require 'db.php';

try {
    $repo = $entityManager->getRepository(Product::class);
    $products = $repo->findAll();

    $result = array_map(function($p) {
        return [
            'product_id' => $p->product_id,
            'name' => $p->name,
            'category' => $p->category,
            'price' => $p->price,
            'description' => $p->description,
            'image_url' => $p->image_url,
            'supplier_id' => $p->supplier_id
        ];
    }, $products);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>