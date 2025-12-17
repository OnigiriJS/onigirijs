<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$menu = [
    ['id' => 1, 'name' => 'Salmon Onigiri', 'description' => 'Fresh salmon with seasoned rice', 'price' => 3.50, 'emoji' => '🐟'],
    ['id' => 2, 'name' => 'Tuna Onigiri', 'description' => 'Spicy tuna with mayo', 'price' => 3.50, 'emoji' => '🐠'],
    ['id' => 3, 'name' => 'Umeboshi Onigiri', 'description' => 'Pickled plum, classic taste', 'price' => 3.00, 'emoji' => '🌸'],
    ['id' => 4, 'name' => 'Chicken Teriyaki', 'description' => 'Grilled chicken with teriyaki sauce', 'price' => 4.00, 'emoji' => '🍗'],
    ['id' => 5, 'name' => 'Vegetable Onigiri', 'description' => 'Fresh vegetables and herbs', 'price' => 3.25, 'emoji' => '🥬'],
    ['id' => 6, 'name' => 'Shrimp Tempura', 'description' => 'Crispy tempura shrimp', 'price' => 4.50, 'emoji' => '🍤']
];

echo json_encode($menu);
