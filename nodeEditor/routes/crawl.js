var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bot = require('nodemw');
var r = require('rethinkdb');
var q = require('q');
var request = require('request');
var router = express.Router();


//confidential configuration 
var config = {
	host:{
		server: 'test.huiji.wiki',
		username: '米拉西斯',
		pwd: 'fireandblood',
	},
	remoteHost:{
		server: 'huiji.rocks:3000',
		secret: 'Huiji123'
	},
	database:{
		host: 'localhost',
		port: 28015,
		db: 'crawler'
	}
	
}

//start the db server and configure it with the configuration settings from the config file
var conn;
r.connect(config.database).then(function(c){
	//connect the database
	conn = c; //update connection
	return r.dbCreate(config.database.crawler).run(conn);
})
.then(function(){
	return r.tableCreate('job').run(conn);
})
.then(function(){
	return q.all(
		//create all the required feilds in rethinkdb
		r.table('job').indexCreate('origUrl').run(conn);
		r.table('job').indexCreate('targetUrl').run(conn);
		r.table('job').indexCreate('usr').run(conn);
		r.table('job').indexCreate('jobType').run(conn);
		r.table('job').indexCreate('pageName').run(conn);
		r.table('job').indexCreate('pageContent').run(conn);
		r.tbale('job').indexCreate('jobId').run(conn);
	);
})
.error(function(err){
	if( err.msg.indexOf("already exists")== -1 ){
		console.log(err);
	}
})
.finally(function(){
	//update to notifiy the user ? or not?
	console.log('setting up rethink db server done');
})


//parameter needed for this function call.
//valid user
//valid original domain
//valid targer domain
//jobType: 1. a template mediawiki website; 2. a mediawiki page

function generatejobId(var usr, var target){

};


router.post('/create', function(req, res){
	var usr = req.params.user;
	var origUrl = req.params.origUrl;
	var targetUrl = req.params.targetUrl;
	var jobType = req.params.targetUrl;

	var jobId = 0;
	

});


router.get('/verify', function(req,res){
	var token = req.params.token;
	var jobId = req.params.jobId;
	res.send('test verify');
});


router.get('/', function(req, res){
	var client = new bot({
		server: config.host.server,
		path: '/',
		debug: true,
		username: config.username,
		password: config.pwd,
		concurrency: 5
	});
	client.logIn('米拉西斯','fireandblood',function(err,result){
		if(err) throw err;
		client.edit('guxi_test','test for guxi','test sum',function(err, info){
			if(err) throw err;
			res.send(info);
		});
	})
});

module.exports = router;