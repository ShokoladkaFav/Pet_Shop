<?php
require 'db.php';

try {
    // DQL запит для об'єднання таблиць
    $dql = "SELECT i.inventory_id, i.quantity, i.location, p.name as product_name, p.category, s.name as supplier_name 
            FROM Inventory i 
            JOIN Product p WITH i.product_id = p.product_id 
            LEFT JOIN Supplier s WITH p.supplier_id = s.supplier_id 
            ORDER BY i.inventory_id DESC";

    $query = $entityManager->createQuery($dql);
    $inventory = $query->getResult();
    
    echo json_encode($inventory);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>