<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['action'])) {
    echo json_encode(["status" => "error", "message" => "Немає дії"]);
    exit;
}

try {
    if ($data['action'] === 'create') {
        $stmt = $pdo->prepare("INSERT INTO supplier (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['contact_person'], $data['phone'], $data['email'], $data['address']]);
        echo json_encode(["status" => "success"]);
    } 
    elseif ($data['action'] === 'update') {
        $stmt = $pdo->prepare("UPDATE supplier SET name=?, contact_person=?, phone=?, email=?, address=? WHERE supplier_id=?");
        $stmt->execute([$data['name'], $data['contact_person'], $data['phone'], $data['email'], $data['address'], $data['supplier_id']]);
        echo json_encode(["status" => "success"]);
    } 
    elseif ($data['action'] === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM supplier WHERE supplier_id = ?");
        $stmt->execute([$data['supplier_id']]);
        echo json_encode(["status" => "success"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>