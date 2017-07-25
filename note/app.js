const http=require('http');
const mysql=require('mysql');
const express=require('express');
const qs=require('querystring');

var app=express();

var server=http.createServer(app);

server.listen(8080);

var pool=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'',
    database:'note',
    connectionLimit:10
});

//发送静态资源
app.use(express.static('public'));
//查找所有note
app.get('/noteList/:uid',(req,res)=>{
    var uid=parseInt(req.params.uid);
    var sql="select * from notes where uid=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[uid],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.length>0){
                        res.json(result);
                    }else{
                        res.send('{"code"-1,"msg":"查询失败"}');
                    }
                }
                conn.release();
            });
        }
    });
});
//添加note
app.get('/addNote',(req,res)=>{
    var id=req.query.id;
    var title=req.query.title;
    var content=req.query.content;
    var uptime=req.query.updatatime;
    var timer=req.query.timer;
    var left=req.query.nleft;
    var top=req.query.ntop;
    var zindex=req.query.nzindex;
    var color=req.query.color;
    var uid=req.query.uid;
    var sql="insert into notes values(?,?,?,?,?,?,?,?,?,?)";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[id,left,top,zindex,title,content,color,uptime,timer,uid],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.affectedRows>0){
                        pool.getConnection((err,conn)=>{
                            var sql="select * from notes where id=?";
                            conn.query(sql,[result.insertId],(err,result)=>{
                                if(err) throw err;
                                else{
                                    if(result.length>0){
                                        res.json(result);
                                    }else{
                                        res.send('{"code":-2,"msg":"查询自增失败"}');
                                    }
                                }
                                conn.release();
                            });
                        })
                    }else{
                        res.send('{"code":-1,"msg":"添加失败"}');
                    }
                }
                conn.release();
            });
        }
    })
});

//查找zindex
app.get('/zindex',(req,res)=>{
    var sql="select max(nzindex) from notes";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,(err,result)=>{
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

//删除note功能
app.get('/delete',(req,res)=>{
    var id=parseInt(req.query.id);
    var sql="delete from notes where id=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[id],(err,result)=>{
                if(result.affectedRows>0){
                    //重新读取页面
                    res.send('{"code":1,"msg":"删除成功"}');
                }else{
                    res.send('{"code":-1,"msg":"删除失败"}');
                }
                conn.release();
            });
        }
    })
});

//更新left top zindex
app.get('/update/:left/:top/:zindex/:id',(req,res)=>{
   var left=req.params.left;
   var top=req.params.top;
   var zindex=req.params.zindex;
   var id=req.params.id;
    var sql="UPDATE notes SET nleft=?,ntop=?,nzindex=? WHERE id=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[left,top,zindex,id],(err,result)=>{
                if(result.affectedRows>0){
                    res.send('{"code":1,"msg":"更新成功"}');
                }
                else{
                    res.send('{"code":-1,"msg":"更新失败"}');
                }
                conn.release();
            });
        }
    });
});

//更新title
app.get('/updateTitle/:title/:id',(req,res)=>{
    var title=req.params.title;
    var id=req.params.id;
    var sql="update notes set title=? where id=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[title,id],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.affectedRows>0){
                        res.send('{"code":1,"msg":"更新成功"}')
                    }
                    else{
                        res.send('{"code":-1,"msg":"更新失败"}')
                    }
                }
                conn.release();
            })
        }
    });
});
//更新content
app.get('/updateContent/:content/:id',(req,res)=>{
    var content=req.params.content;
    var id=req.params.id;
    var sql="update notes set content=? where id=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[content,id],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.affectedRows>0){
                        res.send('{"code":1,"msg":"更新成功"}')
                    }
                    else{
                        res.send('{"code":-1,"msg":"更新失败"}')
                    }
                }
                conn.release();
            })
        }
    });
});
//更新timer
app.get('/updateTimer/:timer/:id',(req,res)=>{
    var timer=req.params.timer;
    var id=req.params.id;
    var sql="update notes set timer=? where id=?";
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        else{
            conn.query(sql,[timer,id],(err,result)=>{
                if(err) throw err;
                else{
                    if(result.affectedRows>0){
                        res.send('{"code":1,"msg":"更新成功"}')
                    }
                    else{
                        res.send('{"code":-1,"msg":"更新失败"}')
                    }
                }
                conn.release();
            })
        }
    });
});