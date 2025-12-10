<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 👇 Підключаємося до БД прямо тут, якщо у вас немає окремого файлу db.php
$conn = new mysqli("localhost", "root", "", "pet_shop");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB Connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    $id = $data['id'];
    $stmt = $conn->prepare("DELETE FROM vet_requests WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Заявку видалено"]);
    } else {
        echo json_encode(["status" => "error", "message" => "SQL Error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "ID не передано"]);
}

$conn->close();
?>