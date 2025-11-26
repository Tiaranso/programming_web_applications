<?php
header('Content-Type: application/json');

$file = 'data.json';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        file_put_contents($file, $input); // Так, захисту від вразливостей немає :)
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No data']);
    }
} elseif ($method === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]);
    }
}
