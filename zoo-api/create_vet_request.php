<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "pet_shop");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['client_name']) || !isset($data['email'])) {
    echo json_encode(["status" => "error", "message" => "Неповні дані"]);
    exit();
}

$stmt = $conn->prepare("INSERT INTO vet_requests (client_name, email, type, description) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $data['client_name'], $data['email'], $data['type'], $data['description']);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
$conn->close();
?>