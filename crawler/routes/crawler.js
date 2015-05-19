var express = require('express');
var crypto = require('crypto')
var bot = require('nodemw');
var config = require('../config');
var router = express.Router();

var jobQueue = {};


//need to set up the token receiver and resender of on the test.huiji.wiki side





//the prototype of the crawler 
router.get('/article',function(req,res){
	var page = req.query.page;
	var token = req.query.token;
	var domain = req.query.domain;
	console.log()
	if(page == undefined  || domain == undefined){
		res.send('Undefined value for the parameters');
		return;
	}
  
  //if the token is not given, send 
  if(token == undefined){
    res.send();
  }

	//assume valid token
	var client = new bot({
    	server: domain,
    	path: '',
    	debug: false
  	}); //end of declaration of bot

  	var params = {
        action: 'query',
        generator: 'templates',
        titles:  page,
        format: 'json'
 	 }; //end of declaration of params

 	 var templates = [];
 	 templates.push(page);
 	 client.api.call(params, function(err , info , next , data){
      	if(err)  throw err;
      	var allPages = info.pages;
      	for(var object in allPages){
          	templates.push(allPages[object].title);
            console.log(allPages[object].title);
      	}
      	
        var len = templates.length;
        var workDone = 0;
        var crawledResult = [];
        for(var i = 0; i < len; i++){
          console.log(templates[i] + " to be crawled");
          client.getArticle(templates[i], function(err, result){
              if(err) throw err;
              workDone++;
              console.log("done for crawling" + templates[i]) ;
              crawledResult.push({ARTICLE: this.name, VALUE: result});
              if(workDone == templates.length){
                
                res.contentType('application/json');
                res.send(JSON.stringify(crawledResult));
              }
          }.bind({name: templates[i] } ))
        }
  	});//end for api directAll
});





module.exports = router;