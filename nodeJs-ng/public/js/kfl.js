var app = angular.module('kaifanla', ['ng','ngRoute','ngAnimate']);

//设置请求头
app.run(function($http){
    $http.defaults.headers.post={'content-type':'application/x-www-form-urlencoded'};
});
//配置路由词典
app.config(function($routeProvider){
    $routeProvider.when('/myStart',{
        templateUrl:'tpl/start.html'
    }).when('/myMain',{
        templateUrl:'tpl/main.html',
        controller:'listCtrl'
    }).when('/myDetail/:did',{
        templateUrl:'tpl/detail.html',
        controller:'detailCtrl'
    }).when('/myOrder/:did',{
        templateUrl:'tpl/order.html',
        controller:'orderCtrl'
    }).when('/myCenter',{
        templateUrl:'tpl/myorder.html',
        controller:'centerCtrl'
    }).otherwise({
        redirectTo:'/myStart'
    })
});

//主控制器
app.controller('bodyCtrl',['$scope','$location',function ($scope,$location) {
        $scope.jump=function(url){
            $location.path(url);
        }
}]);
//商品列表控制器
app.controller('listCtrl',['$scope','$http','$location',function($scope,$http,$location){
    $scope.list=[];
    $http.get('/list/0').success(function(data){
       $scope.list=data;
    });
    //获取更多
    $scope.sta=true;
    $scope.listhide=false;//列表状态
    $scope.hasSearch=false;//搜索状态
    $scope.loadMore=function(){
        $http({url:'/list/'+$scope.list.length}).success(function(data){
            if(data.code<0){
                $scope.sta=false;
            }
            else{
                for(var cell of data){
                    $scope.list.push(cell);
                }
            }
        });
    };

    //传参去detail
    $scope.toDetail=function(did){
        $location.path('/myDetail/'+did);
    };

    //搜索功能
    $scope.$watch('inputText',function(){
        if($scope.inputText==''||typeof($scope.inputText)=="undefined"){
            $scope.hasSearch=false;
            $scope.listhide=false;
        }
        else{
            $http.get('/search/'+$scope.inputText).success(function(data){
                $scope.listhide=true;//不显示列表  不显示按钮
                if(data.code<0){
                    $scope.sta=false;
                    $scope.hasSearch=false;
                }
                else{
                    $scope.hasSearch=true;
                    $scope.searchList=data;
                    $scope.sta=true;
                }
            });
        }

    });
}]);

//商品详情控制器
app.controller('detailCtrl',['$scope','$location','$routeParams','$http',function($scope,$location,$routeParams,$http){
        $scope.did=$routeParams.did;
     //查询对应的商品信息
        $http.get('/detail/'+$scope.did).success(function(data){
            if(data.code<0){alert('查询出错')}
            else $scope.detail=data[0];
        });

    //订餐按钮
    //传入当前的商品ID
    $scope.order=function(did){
        $location.path('/myOrder/'+did);
    }


}]);

//订单控制器
app.controller('orderCtrl',['$scope','$routeParams','$httpParamSerializerJQLike','$http','$rootScope',function($scope,$routeParams,$httpParamSerializerJQLike,$http,$rootScope){
    $scope.status=true;
    $scope.radio={choice:1};
    $scope.id=$routeParams.did;
    //表单提交 存储数据  联系人 tel address sex
    $scope.addOrder=function(){
      var  data={
          phone:$scope.u_tel,
          sex:$scope.radio.choice,
          user_name:$scope.u_name,
          address:$scope.u_address,
          did:$scope.id,
          time:new Date().getTime()
        };
        //序列化表单数据
        var result=$httpParamSerializerJQLike(data);
        //发送数据
        $http.post('/order',result).success(function(data){
           if(data.code>0){
               $scope.status=false;
               $scope.insertId=data.id;
           }
        });
       $rootScope.phone=$scope.u_tel;
    };
    //改变状态 status=false;

}]);

//订单中心控制器
app.controller('centerCtrl',['$scope',"$http",'$location','$rootScope',function($scope,$http,$location,$rootScope){
    $scope.status=true;
    if(typeof $rootScope.phone=='undefined'){
        $scope.status=false;
    }else{
        $http.get('/orderList/'+$rootScope.phone).success(function(data){
            if(data.code<0){
                $scope.status=false;
            }else{
                $scope.orderList=data;
            }
        });
    }


    //传参去detail
    $scope.toDetail=function(did){
        $location.path('/myDetail/'+did);
    }

}]);