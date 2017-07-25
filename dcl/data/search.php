<?php
require('init.php');
@$input=$_REQUEST['input']or die('{"code":-1,"msg":"请输入查询关键字"}');
$sql="select * from kf_dish where name like '%$input%'";
$result=mysqli_query($conn,$sql);

$rows=mysqli_fetch_all($result,MYSQLI_ASSOC);
if($rows){
    echo json_encode($rows);
}else{
    echo '{"code":-2,"msg":"没有找到相关产品"}';
}





?>