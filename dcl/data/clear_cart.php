<?php
/**
*根据购物车详情记录编号删除该购买记录
*请求参数：
  userid-,o
*输出结果：* {"code":1,"msg":"succ"}
* 或

* {"code":400}
*/
@$userid= $_REQUEST['userid'] or die('userid required');
require('init.php');
$sql = "DELETE FROM kf_cart WHERE userid=$userid";
$result = mysqli_query($conn,$sql);
if($result){
  $output['code']=1;
  $output['msg']='succ';
}else {
  $output['code']=400;
}


echo json_encode($output);
