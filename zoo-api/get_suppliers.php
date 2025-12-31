<?php
require_once 'db.php';

try {
    $stmt = $conn->query("SELECT supplier_id, name FROM supplier");
    $suppliers = $stmt->fetchAll();
    echo json_encode($suppliers);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>