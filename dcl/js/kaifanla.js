var app = angular.module('kaifanla', ['ionic']);

//设置请求头
app.run(function($http){
    $http.defaults.headers.post=
    {'Content-Type':'application/x-www-form-urlencoded'};
});
app.config(function($ionicConfigProvider,$stateProvider,$urlRouterProvider){
    $ionicConfigProvider.tabs.position('bottom');

    $stateProvider.state('myStart',{
        url:'/start',
        templateUrl:'tpl/start.html'
    }).state('myMain',{
        url:'/main',
        templateUrl:'tpl/main.html',
        controller:'mainCtrl'
    }).state('myDetail',{
        url:'/detail/:did',
        templateUrl:'tpl/detail.html',
        controller:'detailCtrl'
    }).state('myOrder',{
        url:'/order/:total',
        templateUrl:'tpl/order.html',
        controller:'orderCtrl'
    }).state('myCenter',{
        url:'/center',
        templateUrl:'tpl/myorder.html',
        controller:'centerCtrl'
    }).state('myCart',{
        url:'/cart',
        templateUrl:'tpl/cart.html',
        controller:'cartCtrl'
    }).state('myAbout',{
        url:'/about',
        templateUrl:'tpl/about.html',
        controller:'settingCtrl'
    });
    $urlRouterProvider.otherwise('/start');
});
//自定义服务 希望每次请求时都有加载中的网络请求
app.service('$kflHttp',['$ionicLoading','$http',function($ionicLoading,$http){
    this.sendRequest=function(url,func,msg){
        $ionicLoading.show({
            template:msg
        });
        $http.get(url).success(function(data){
            func(data);
            $ionicLoading.hide();
        })
    }
}]);
app.controller('bodyCtrl',['$scope','$state',function($scope,$state){
    $scope.jump=function(desState,args){//args是键值对 {属性名：值}
        $state.go(desState,args);
    };

}]);

app.controller('mainCtrl',['$scope','$kflHttp',function($scope,$kflHttp){
    $scope.list=[];
    $scope.ifSearch=false;
    $scope.hasSearch=true;
    $scope.info={
        input:''
    };
   $scope.hasMore=true;
   $kflHttp.sendRequest('data/list.php',function(data){
       $scope.list=data;
   },'列表加载中...');

    //加载更多 传入index
    $scope.addMore=function(){
        $kflHttp.sendRequest('data/list.php?aid='+$scope.list.length,function(data){
                if(data.length<5){
                    $scope.list=$scope.list.concat(data);
                    $scope.hasMore=false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            },'正在加载中...')
    };
    //搜索
    $scope.$watch('info.input',function(newvalue,oldvalue){
        if(newvalue.length>0){
            $scope.ifSearch=true;
           //$http.get('data/search.php?input='+$scope.info.input).success(function(data){
           //    if(data.length>0){
           //        $scope.searchText=data;
           //    }else{
           //        $scope.hasSearch=false;
           //    }
           //
           //});
            $kflHttp.sendRequest('data/search.php?input='+$scope.info.input,function(data){
                    if(data.length>0){
                        $scope.searchText=data;
                    }else{
                        $scope.hasSearch=false;
                        $scope.searchText=[];//清空搜索表
                    }

                },'正在搜索...')
        }else{
            $scope.hasSearch=true;
            $scope.ifSearch=false;
        }
    });
}]);
app.controller('detailCtrl',['$scope','$stateParams','$kflHttp','$ionicPopup',function($scope,$stateParams,$kflHttp,$ionicPopup){
    //$http.get('data/detail.php?did='+$stateParams.did).success(function(data){
    //    $scope.detail=data;
    //});
    $kflHttp.sendRequest('data/detail.php?did='+$stateParams.did,function(data){
            $scope.detail=data;
        },'详情加载中...');

    //添加到购物车
    $scope.addCart=function(){
        $kflHttp.sendRequest('data/cart_update.php?did='+$stateParams.did+'&uid=1&count=-1',function(data){
            if(data.code>0){
                $ionicPopup.confirm({
                    title:'添加购物车成功',
                    template:'是否去查看购物车'
                }).then(function(res){
                    if(res) {
                        $scope.jump('myCart');
                    }
                })
            }
        },'详情加载中...');

    }
}]);
app.controller('orderCtrl',['$scope','$kflHttp','$httpParamSerializerJQLike','$stateParams',function($scope,$kflHttp,$httpParamSerializerJQLike,$stateParams){
    var cartDetail=sessionStorage['myOrder'];
    $scope.alert=false;
    $scope.order={
        user_name:'',
        phone:'',
        addr:'',
        userid:1,
        totalprice:$stateParams.total,
        cartDetail:cartDetail
    };
    $scope.toOrder=function(){
        var result=$httpParamSerializerJQLike($scope.order);
        $kflHttp.sendRequest('data/order_add.php?'+result,function(data){
            if(data[0].msg=='succ'){
                $scope.alert=true;
                $scope.oid=data[0].oid;

                //下单成功后删除购物车  传入userid
                $kflHttp.sendRequest('data/clear_cart.php?userid=1',function(result){
                    if(result.code=='404') console.log('清除购物车失败');
                })
            }
        });
    }
}]);
app.controller('centerCtrl',['$scope','$kflHttp',function($scope,$kflHttp){
    $kflHttp.sendRequest('data/order_getbyuserid.php?userid=1',function(result){
        $scope.orderInfo=result.data;
    });



}]);
//购物车控制器
app.controller('cartCtrl',['$scope','$kflHttp','$ionicPopup',function($scope,$kflHttp,$ionicPopup){
    $scope.cartList=[];
    $scope.editText='编辑';
    $scope.editEnabled=true;
    $kflHttp.sendRequest('data/cart_select.php?uid=1',function(result){
        $scope.cartList=result.data;
    },'购物车加载中...');
    //计算总和
    $scope.sumAll=function(){
        var totalPrice=0;
        for(var i=0;i<$scope.cartList.length;i++){
            var dish=$scope.cartList[i];
            totalPrice+=dish.price*dish.dishCount;
        }
        return totalPrice;
    };
    //切换编辑状态
    $scope.toggleEdit=function(){
        if($scope.editEnabled==true){
            $scope.editText='完成';
            $scope.editEnabled=false;
        }else{
            $scope.editText='编辑';
            $scope.editEnabled=true;
        }
    };
    //向购物车减少数量
    $scope.minusFromCart=function(index){
        var count=$scope.cartList[index].dishCount;
        if(count>1) {
            count--;
            $kflHttp.sendRequest('data/cart_update.php?uid=1&did='+$scope.cartList[index].did+'&count='+count,function(data){
                $ionicPopup.confirm({
                    template:'更新成功'
                });
                $scope.cartList[index].dishCount--;
            })
        }
        //先通知服务器更新

        //再更新本地
    };
    //向购物车增加数量
    $scope.plusToCart=function(index){
        var count=$scope.cartList[index].dishCount;
        count++;
        $kflHttp.sendRequest('data/cart_update.php?uid=1&did='+$scope.cartList[index].did+'&count='+count,function(data){
            $ionicPopup.alert({
                template:'更新成功'
            });
            $scope.cartList[index].dishCount++;
        })
    };

    //去下单
    $scope.ToOrder=function(){
        //将当前数组序列化
        var myOrder=angular.toJson($scope.cartList);
        sessionStorage['myOrder']=myOrder;
        $scope.jump('myOrder',{total:$scope.sumAll()});
    };
    //删除商品的功能
    $scope.deleteFromCart=function(index){
        $kflHttp.sendRequest('data/cart_delete.php?ctid='+$scope.cartList[index].ctid,function(data){
            if(data.code==1){
                $scope.cartList.splice(index,1);
            }
        })
    }
}]);
//设置界面控制器
app.controller('settingCtrl',['$scope','$ionicModal',function($scope,$ionicModal){
    //先实例化
    $ionicModal.fromTemplateUrl('modal.html',{
        scope:$scope
    }).then(function(result){
        $scope.myModal=result;
    });
    $scope.showModal=function(){
        $scope.myModal.show()
    };
    $scope.hideModal=function(){
        $scope.myModal.hide();
    }
}]);