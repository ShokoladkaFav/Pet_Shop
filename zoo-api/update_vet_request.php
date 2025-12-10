<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "pet_shop");
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id']) && isset($data['status'])) {
    $stmt = $conn->prepare("UPDATE vet_requests SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $data['status'], $data['id']);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}
$conn->close();
?>