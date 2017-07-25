<?php
require('init.php');
@$aid=$_REQUEST['aid'];
if(!$aid) $aid=0;
$last=5;
$sql="select name,price,img_sm,material,did from kf_dish limit $aid,$last";
$result=mysqli_query($conn,$sql);

$rows=mysqli_fetch_all($result,MYSQLI_ASSOC);
    if($rows){
        echo json_encode($rows);
    }
    else echo'{"code":-1,"msg":"没有更多信息"}';

?>