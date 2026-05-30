<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$file = __DIR__ . '/likes_data.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo file_exists($file) ? file_get_contents($file) : '{}';
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = json_decode(file_get_contents('php://input'), true);
  $slug = $body['slug'] ?? '';
  if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid slug']);
    exit;
  }

  $fp = fopen($file, 'c+');
  flock($fp, LOCK_EX);
  $content = stream_get_contents($fp);
  $data = ($content ? json_decode($content, true) : null) ?? [];
  $data[$slug] = ($data[$slug] ?? 0) + 1;
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($data));
  flock($fp, LOCK_UN);
  fclose($fp);

  echo json_encode($data);
  exit;
}

http_response_code(405);
