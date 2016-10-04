<?php
/**
 * @filesource : submit.php
 * @author : Shabeeb  <mail@shabeeb.com>
 * @abstract : simple submission php form
 * @package sample file 
 * @copyright (c) 2014, Shabeeb
 * 
 * 
 *  */
 
$post_date = file_get_contents("php://input");
$data = json_decode($post_date);
 
 
//saving to database
//save query
 
//now i am just printing the values
echo "Name : ".$data->name."n";
echo "Email : ".$data->email."n";
echo "Message : ".$data->message."n";
 
 
 
?>