var express = require('express');
var errno = require('errno')
//var shand = require('sequelize-handler');
//var mongoose = require('mongoose');
//var Vinay = require('./employee');
var nodemailer = require('nodemailer');//nodemailer module
var config = require('config.json')('./config/mv.json');
var bodyParser = require('body-parser');
var cacher = require('sequelize-redis-cache');
var redis = require('redis');
var fs = require("fs");
var port = process.env.port || 1007;
var app = express();
/*app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());*/
app.use(bodyParser())
app.use(express.static(__dirname + '/public'));
//cors headers
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/insertData',function(req,res)
	{
		res.sendFile( __dirname + "/create.html" );
	});
var rc = redis.createClient(6379, 'localhost');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('mydb', 'root', 'mani123', {
  host: "127.0.0.1",
  port: 3306,
  maxConcurrentQueries: 1000,
  dialect: 'mariadb'
  })
  
  sequelize.sync().then(function(){
  console.log('DB connection sucessful.');
},function(err){
  // catch error here
  
  //console.log(err);
  
  console.error('database connection problem'+ err.code)
  
 // console.log('database connection problem'+ errmsg(err))

});
  
  var User = sequelize.define('tab',{
			
			eName:Sequelize.STRING,
			eEmail: Sequelize.STRING
		 },
			{
				timestamps:false
			});
 
app.post('/api/insert', function(req, res) 
	{
		var name=req.body.ename;
		var email=req.body.email;
		console.log(name+""+email)
		 
			User.create({
			eName:name,
			eEmail:email
		}).then(function(mani) {
			console.log(mani.get({
			plain: true
			}));
		});
	});

app.post('/api/retrieve', function(req, res,err) 
	{
		var email=req.body.email;
		
		var cacheObj = cacher(sequelize, rc)
		.model('tab')
		.ttl(1000);
		var datacache=cacheObj.findAll({ where: { eEmail:email } })
  datacache.then(function(user) {
    console.log(user); // sequelize db object 
    console.log(cacheObj.cacheHit); // true or false 
	res.json({"output":user})

	//console.log( res.status(200).json({ "output":user }));
  })
  if(datacache==""){
	  
  datacache.catch(function(err){
	  console.log('catch function')
  })
  }
  
  })	//console.log('error is'+res.status(422).send(err));
  
	
	
	app.post('/api/update', function(req, res) 
	{
		var email=req.body.email;
		var name=req.body.name;
   
			User.find({where:{eEmail:email}}).then(function(upd){
				if(upd){
					upd.update({
						eName:name,
						eEmail:email
					}).then(function(){
						console.log('update success')
					})
					
				}
			
			})
	})



app.listen(port);
console.log('Server is running on port ' + port);
