<?php
session_start();

$logFile = 'server_logs.json';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'clear') {
    file_put_contents($logFile, json_encode([]));
    echo json_encode(['status' => 'cleared']);
    exit;
}

if ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data) {
        // фіксація серверного часу (microtime для точності)
        $t = microtime(true);
        $micro = sprintf("%06d", ($t - floor($t)) * 1000000);
        $d = new DateTime(date('Y-m-d H:i:s.' . $micro, $t));
        $serverTime = $d->format("Y-m-d H:i:s.u");

        $data['serverTime'] = $serverTime;

        // збереження у файл
        $currentLogs = [];
        if (file_exists($logFile)) {
            $currentLogs = json_decode(file_get_contents($logFile), true);
            if (!is_array($currentLogs)) $currentLogs = [];
        }
        
        $currentLogs[] = $data;
        file_put_contents($logFile, json_encode($currentLogs));
        
        echo json_encode(['status' => 'success', 'serverTime' => $serverTime]);
    } else {
        echo json_encode(['status' => 'error']);
    }
} 
elseif ($method === 'GET' && $action === 'get') {
    if (file_exists($logFile)) {
        echo file_get_contents($logFile);
    } else {
        echo json_encode([]);
    }
}
