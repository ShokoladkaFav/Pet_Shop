<?php
// 1. Заголовки (залишаємо твої)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Параметри підключення (твої)
$host = 'localhost';
$db   = 'pet_shop';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

// --- ЧАСТИНА 1: Твій старий добрий PDO ($conn) ---
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $conn = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "message" => "PDO Connection failed: " . $e->getMessage()]);
    exit();
}

// --- ЧАСТИНА 2: Підключення Doctrine ($entityManager) ---
// Вона не завадить роботі PDO, але дозволить працювати новим скриптам
require_once __DIR__ . "/vendor/autoload.php";

use Doctrine\ORM\ORMSetup;
use Doctrine\ORM\EntityManager;
use Doctrine\DBAL\DriverManager;

$config = ORMSetup::createAttributeMetadataConfiguration(
    paths: [__DIR__ . "/entities"],
    isDevMode: true
);

$connectionParams = [
    'dbname'   => $db,
    'user'     => $user,
    'password' => $pass,
    'host'     => $host,
    'driver'   => 'pdo_mysql',
    'charset'  => $charset,
];

try {
    $connection = DriverManager::getConnection($connectionParams, $config);
    $entityManager = new EntityManager($connection, $config);
} catch (\Exception $e) {
    // Не зупиняємо весь сайт, якщо Doctrine не завелася, 
    // просто запишемо помилку (для відладки)
    $doctrineError = $e->getMessage();
}