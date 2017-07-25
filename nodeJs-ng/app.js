const http=require('http');
const mysql=require('mysql');
const express=require('express');
const qs=require('querystring');

//创建express对象
var app=express();
//创建服务器
var server=http.createServer(app);
//监听端口
server.listen(8080);

//创建连接池
var pool=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'',
    database:'kaifanla',
    connectLimit:10
});

app.get('/',(req,res)=>{
   res.sendFile(__dirname+'/public/kaifanla.html');
});
app.use(express.static('public'));
//查询列表
app.get('/list/:aid',(req,res)=>{
    var aid=parseInt(req.params.aid);
    var sql="select name,price,img_sm,material,did from kf_dish limit ?,4";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[aid],(err,result)=>{
                if(result.length>0){
                    res.json(result);
                }
                else{
                    res.send('{"code":-1,"msg":"查询失败"}');
                }
                conn.release();
            });
        }
    })
});

//搜索功能
app.get('/search/:input',(req,res)=>{
    var keyword=req.params.input;
    if(typeof keyword=="undefined") return;
    var sql="select * from kf_dish where name like ?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,['%'+keyword+'%'],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.length>0){
                        res.json(result);
                    }else{
                        res.send('{"code":-1,"msg":"无相关产品"}');
                    }
                }
              conn.release();
            });
        }
    })
});

//详情页
app.get('/detail/:did',(req,res)=>{
    var did=parseInt(req.params.did);
    var sql="select * from kf_dish where did=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[did],(err,result)=>{
               if(err) throw err;
                else{
                   if(result.length>0) res.json(result);

                   else res.send('{"code":-1,"msg":"没有相关产品"}');
               }
            });
        }
    })
});

//订单信息
app.post('/order',(req,res)=>{
   req.on('data',function(data){
       var info=qs.parse(data.toString());
       var phone=info.phone;
       var uname=info.user_name;
       var sex=info.sex;
       var adr=info.address;
       var time=info.time;
       var did=info.did;
       var sql="insert into kf_order values(null,?,?,?,?,?,?)";

       pool.getConnection((err,conn)=>{
           if(err) throw err;
           else{
               conn.query(sql,[phone,uname,sex,time,adr,did],(err,result)=>{
                   if(err) throw err;
                   else{
                       if(result.affectedRows>0){
                           var id=result.insertId;
                           res.send('{"code":1,"msg":"添加成功","id":'+id+'}');
                       }else{
                           res.send('{"code":-1,"msg":"添加失败"}');
                       }
                   }
                   conn.release();
               });
           }
       })

   })
});

//订单中心
app.get('/orderList/:phone',(req,res)=>{
    var phone=req.params.phone;
    if(!phone||typeof phone=='undefined') {
        res.send('{"code":-3,"msg":"请填写手机号"}');
        return;
    }
    var sql="select d.img_sm,o.did,o.oid,o.order_time,o.user_name from kf_order o,kf_dish d where o.did=d.did and o.phone=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[phone],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.length>0){
                        res.json(result);
                    }else{
                        res.send('{"code":-1,"msg":"查询失败"}');
                    }
                }
            });
        }
    })
});