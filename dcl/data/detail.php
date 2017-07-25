<?php
require('init.php');
@$did=$_REQUEST['did'] or die('{"code":-1;"msg":"商品编号必须"}');

$sql="select * from kf_dish where did=$did";
$result=mysqli_query($conn,$sql);

$row=mysqli_fetch_assoc($result);

if($row){
    echo json_encode($row);
}
else echo '{"code":-2,"msg":"商品不存在"}';
?>