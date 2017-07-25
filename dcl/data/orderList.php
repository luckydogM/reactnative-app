<?php
require('init.php');
@$phone=$_REQUEST['phone']or die('{"code":-1,"msg":"用户电话号必须"}');
$sql="select d.img_sm,o.did,o.oid,o.order_time,o.user_name from kf_order o,kf_dish d where o.did=d.did and o.phone='$phone'";
$result=mysqli_query($conn,$sql);

$rows=mysqli_fetch_all($result,MYSQLI_ASSOC);
//多表查询  查询对应did的图片   订单编号 图片 下单时间（做处理 格式化）  联系人
if($rows){
    echo json_encode($rows);
}
else echo '{"code":-2,"msg":"暂时没有订单，快去下单吧！"}';



?>