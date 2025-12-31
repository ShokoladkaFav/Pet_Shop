<?php
require_once 'db.php';
try {
    $sql = "SELECT p.*, i.quantity, i.location 
            FROM product p
            LEFT JOIN inventory i ON p.product_id = i.product_id
            ORDER BY p.product_id DESC";
    $stmt = $conn->query($sql);
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>