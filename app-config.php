<?php

$host = 'localhost';        
$user = 'stncayehnr';  
$pass = 'Z79MP5c3bv';  
$dbname = 'stncayehnr';   

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
