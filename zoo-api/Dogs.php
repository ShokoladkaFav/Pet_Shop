<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once 'db.php';
try {
    $stmt = $conn->prepare("SELECT p.*, i.quantity 
                            FROM product p 
                            LEFT JOIN inventory i ON p.product_id = i.product_id 
                            WHERE p.category = 'dogs' OR p.name LIKE '%соб%' OR p.description LIKE '%соб%' 
                            ORDER BY p.product_id DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>