<?php
require('init.php');

@$phone=$_REQUEST['phone'] or die('{"code":-1,"msg":"电话号码不能为空"}');
@$user_name=$_REQUEST['user_name'] or die('{"code":-2,"msg":"联系人不能为空"}');
@$sex=$_REQUEST['sex'] or die('{"code":-3,"msg":"性别不能为空"}');
@$adr=$_REQUEST['address']or die('{"code":-5,"msg":"地址不能为空"}');
@$did=$_REQUEST['did'] or die('{"code":-4,"msg":"商品编号不能为空"}');
@$time=$_REQUEST['time'] or die('{"code":-6,"msg":"时间不能为空"}');
$sql="insert into kf_order values(null,'$phone','$user_name',$sex,'$time','$adr',$did)";

$result=mysqli_query($conn,$sql);

//查看自增编号

if($result){
    $id=mysqli_insert_id($conn);
    echo '{"code":1,"msg":"添加成功","id":'.$id.'}';
}
else echo '{"code":-1,"msg":"添加失败"}';
?>