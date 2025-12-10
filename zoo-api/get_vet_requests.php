<?php
header("Access-Control-Allow-Origin: *");
// 👇 Цей рядок КРИТИЧНО важливий для роботи з токенами
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Обробка preflight-запиту браузера
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "pet_shop");

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$sql = "SELECT * FROM vet_requests ORDER BY status DESC, created_at DESC";
$result = $conn->query($sql);

$requests = [];
while ($row = $result->fetch_assoc()) {
    $requests[] = $row;
}

echo json_encode($requests);
$conn->close();
?>