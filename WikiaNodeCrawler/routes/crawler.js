var express = require('express');

var bot = require('nodemw');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var router = express.Router();



//need to set up the token receiver and resender of on the test.huiji.wiki side

//send back the  


router.get('/article',function(req,res){
	var page = req.query.page;
	var token = req.query.token;
	var domain = req.query.domain;

	if(page == undefined  || domain == undefined){
		res.send('Undefined value for the parameters');
		return;
	}

  


   var client = new bot({
        server: 'gameofthrones.wikia.com',
        path: ''
    }),
    params = {
        action: 'query',
        generator: 'templates',
        titles: 'A Golden Crown',
        format: 'json'
    };

 	 var templates = [];
 	 templates.push(page);
 	/* client.api.call(params, function(err , info , next , data){
      	if(err)  throw err;
      	var allPages = info.pages;
      	for(var object in allPages){
          	templates.push(allPages[object].title);
      	}
      	
        var len = templates.length;
        var workDone = 0;
        var crawledReslt = {};
        for(var i = 0; i < len; i++){
          client.getArticle(templates[i], function(err, result){
              if(err) throw err;
              workDone++;
              crawledResult[templates[i]] = result;
              if(workDone == tempaltes.length){
                console.log("done for crawling");
                res.send(crawledResult);
              }
          })
        }
  	});//end for api directAll

*/
   client.api.call(params , function(err , info , next , data) {
    if(err) throw err;
    var allPages = info.pages;
    console.log(allPages);
    for(var object in allPages){
      console.log(allPages[object].title);
    }
    res.send(info.query);
  });
});




app.get('/cao',function(req,res){
    var client = new bot({
        server: 'gameofthrones.wikia.com',
        path: ''
    }),
    params = {
        action: 'query',
        generator: 'templates',
        titles: 'A Golden Crown',
        format: 'json'
    };
    client.api.call(params , function(err , info , next , data) {
    if(err) throw err;
    var allPages = info.pages;
    console.log(allPages);
    for(var object in allPages){
      console.log(allPages[object].title);
    }
    res.send(info.query);
  });
});




module.exports = router;