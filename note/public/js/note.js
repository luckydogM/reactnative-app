//创建模块
var app=angular.module('myNote',['ionic']);
//自定义指令
app.directive('ngDrag',function($rootScope,$http){
    return {
        restrict:'EA',
        scope:{},
        link:function(scope,ele,attrs){
            //找到拥有此属性的元素 ele[0]
            //添加属性draggable="true"
            ele[0].draggable=true;
           // 给元素绑定拖拽事件
            var startx=0,starty=0;
            //此处待优化？？？
            ele[0].ondragstart=function(e){
                //获取元素当前的位置 //获取当前的最大的zindex+1；
                e.target.style.zIndex=++$rootScope.maxZindex;
                startx=e.clientX-e.target.offsetLeft;
                starty=e.clientY-e.target.offsetTop;
            };
            ele[0].ondrag=function(e){
                    var ex= e.clientX;
                    var ey= e.clientY;
                    if(ex<=0||ey<=0) return;
                    var left=e.clientX-startx;
                    var top=e.clientY-starty;
                    if(top<=50 || top>=450){
                        return;
                    }
                    if(left<=0 || left>=1200) return;
                    e.target.style.left=left+'px';//计算鼠标前后差值并加上之前note与父元素的距离
                    e.target.style.top=top+'px';
                };
            ele[0].ondragend=function(e){
                    var tar=e.target;
                    //记录当前元素的位置
                    scope.left=tar.offsetLeft;
                    scope.top=tar.offsetTop;
                    //隔2s向数据库存储left top zindex
                   updateLeft(scope.left,scope.top,tar.style.zIndex,tar.id);
                };
            //在此定义一个更新方法 并暴露给$rootscope
            function updateLeft(left,top,zindex,id){
                    setTimeout(function(){
                        $http.get('/update/'+left+'/'+top+'/'+zindex+'/'+id).success(function(data){
                            if(data.code<0) console.log('更新失败');
                        });
                    },500);
                }
        }
    }
});
//自定义指令 接收输入的参数
app.directive('contenteditable',function(){
    return {
        require:'ngModel',
        link:function(scope,ele,attrs,ctrl){
            ele.bind('keyup',function(){
                scope.$apply(function(){
                    var html=ele.html();
                    ctrl.$setViewValue(html);
                })
            });
            ctrl.$render=function(){
                ele.html(ctrl.$viewValue);
            };
            ctrl.$render();
        }
    }
});
//自定义指令监控 是否在输入
app.directive('ngInputend',function($rootScope){
    return{
        restric:'A',
        scope:{
            callBack:'@'
        },
        link:function(scope,ele,arrts){
            //需要传入2个参数 function 和 duration
            var timer,dosomething=function(){
                if (!timer) return;
                timer= null;
                $rootScope[scope.callBack]();
            };
           ele.on('keyup keypress',function(e){
               if (timer) clearTimeout(timer);
               timer= setTimeout(function(){
                   dosomething();
               },500);
           }).on('blur',function(){
               dosomething();
           })
        }
    }
});
//自定义服务
app.factory('$public',function(){
    return {
        key: 'trash',
        random: function (min, max) {
            return parseInt(Math.random() * (max - min + 1) + min);
        },
        randomColor: function (min, max) {
            var r = this.random(min, max);
            var g = this.random(min, max);
            var b = this.random(min, max);
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        get: function () {
            return JSON.parse(localStorage[this.key] || '{}');
        },
        set: function (id, data) {
            //取出存储
            var note = this.get();
            if (note[id]) {//如果内层中已经存储了内容 就用新内容覆盖
                Object.assign(note[id], data);
            } else note[id] = data;
            localStorage[this.key] = JSON.stringify(note);
        },
        remove: function (id) {
            var note = this.get();
            delete note[id];
            localStorage[this.key] = JSON.stringify(note);
        },
        removeAll: function () {
            localStorage.removeItem(this.key);
        }
    }
});
//配置路由词典
app.config(function($stateProvider,$urlRouterProvider){
    $stateProvider.state('note',{
        url:'/myNote',
        templateUrl:'tpl/note.html',
        controller:'noteCtrl'
    }).state('list',{
        url:'/myList',
        templateUrl:'tpl/trash22.html'
    }).state('center',{
        url:'/myCenter',
        templateUrl:'tpl/center.html'
    }).state('trash',{
        url:'/myTrash',
        templateUrl:'tpl/trash.html',
        controller:'trashCtrl'
    }).state('login',{
        url:'/myLogin',
        templateUrl:'tpl/login.html'
    }).state('reg',{
        url:'/myReg',
        templateUrl:'tpl/register.html'
    });
        $urlRouterProvider.otherwise('/myNote');
});

//body控制器
app.controller('bodyCtrl',['$scope','$state',function($scope,$state){
    //定义一个公共的跳转方法
    $scope.jump=function(desState,args){
        $state.go(desState,args);
    };

}]);

//note 控制器
app.controller('noteCtrl',['$scope','$http','$httpParamSerializerJQLike','$public','$rootScope',function($scope,$http,$httpParamSerializerJQLike,$public,$rootScope){
    $scope.zindex=0;
    $scope.index=null;//用来保存下标
    $scope.id=null;//用来保存ID
    $scope.input={
        title:'',
        content:'',
        timer:''
    };
    $scope.noteList=[];//初始化数据
    //1.查找数据中最大的zindex
    $http.get('/zindex').success(function(data){
        if(data.code<0) {
            $scope.zindex=0;
        }else{
            $scope.zindex=data[0]['max(nzindex)'];
            //将最大zindex保存在rootscope中
            $rootScope.maxZindex=$scope.zindex;
        }
    });
    var uid=1;//模拟数据  2.获取该用户的所有数据
    $http.get('/noteList/'+uid).success(function(data){
        $scope.noteList=$scope.noteList.concat(data);//这里自动向数据库发出请求 请求uid对应的信息
    });
    //3.新建note
    $scope.addNote=function(){//需向服务器发请求
        var color=$public.randomColor(180,250);
        //随机left
        var left=$public.random(100,window.innerWidth-220);
        var top=$public.random(60,window.innerHeight-320);
        //需要发送到服务器的数据
        $scope.data={
            id:null,
            nleft:left,
            ntop:top,
            nzindex:++$rootScope.maxZindex,
            title:'title',
            content:'msg..',
            color:color,
            updatatime:new Date(),
            timer:null,
            uid:uid
        };
        var result=$httpParamSerializerJQLike($scope.data);
        //使用序列化
        $http.get('/addNote?'+result).success(function(data){
            $scope.noteList=$scope.noteList.concat(data);
        });

        //向数组中添加数据 格式为对象
        //这里需要一个数组
    };

    //4.输入事件
    //数据监听
    $scope.acceptId=function(id,index){
        $scope.changeId=id;
        $scope.index=index;
    };
    //存储标题
    $rootScope.updateTitle=function(){
        $http.get('/updateTitle/'+$scope.noteList[$scope.index].title+'/'+$scope.changeId).success(function(data){
            if(data.code<0) console.log('更新失败');
        });
    };
    //存储内容
    $rootScope.updateContent=function(){
        $http.get('/updateContent/'+$scope.noteList[$scope.index].content+'/'+$scope.changeId).success(function(data){
            if(data.code<0) console.log('更新失败');
        });
    };
    //存储定时器
    $rootScope.updateTimer=function(){
        var now=new Date().getTime();
        var newMs=new Date($scope.noteList[$scope.index].timer).getTime();
        if(newMs>now){
            $http.get('/updateTimer/'+newMs+'/'+$scope.changeId).success(function(data){
                if(data.code<0) console.log('更新失败');
            });
        }
    };

    //5.删除note
    $scope.delete=function(index,id){
        //获取当前元素的id
        $http.get('/delete?id='+id).success(function(data){
            if(data.code>0){
                console.log($scope.noteList[index]);
                //将此条note存储在localstorge中
                $public.set(id,$scope.noteList[index]);///??????/
                //先给它在dom树上移出 再发送请求删除数据库对应的数据
                $scope.noteList.splice(index,1);
            }
        });
    };
}]);

//trash控制器
app.controller('trashCtrl',['$scope','$public','$httpParamSerializerJQLike','$http',function($scope,$public,$httpParamSerializerJQLike,$http){
    $scope.editEnable=false;
    $scope.content='垃圾箱是空的！';
    //编辑按钮
    $scope.edit=function(){
        if($scope.editEnable){
            $scope.editEnable=false;
        }else{
            $scope.editEnable=true;
        }

    };
    $scope.showContent=function(id){
      $scope.content=$scope.trashList[id].content;
    };
    //获得localStroge的内容
    $scope.trashList=$public.get();

    //1.删除一项的功能  ok
    $scope.remove=function(id){
        $public.remove(id);
        //刷新视图
        $scope.trashList=$public.get();
    };
    //2.删除所有功能  ok
    $scope.removeAll=function(){
        $public.removeAll();
        //刷新视图
        $scope.trashList=$public.get();
    };

    //3.多选删除功能   待实现  用CheckBox

    //4.恢复功能  用CheckBox  单条数据恢复ok  需要恢复具体的note 设置一个提交事件将CheckBox的选择结构提交出来{name:xxx,value:on/off} zepto.js
    $scope.renew=function(id){
        var result=$httpParamSerializerJQLike($scope.trashList[id]);//将它序列化作为参数传过去
        $http.get('/addNote?'+result).success(function(data){
            if(data.code<0){
                alert('恢复失败');
            }else{
                $scope.remove(id);
            }
        });
    };

}]);