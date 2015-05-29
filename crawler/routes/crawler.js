var express = require('express');
var crypto = require('crypto')
var bot = require('nodemw');
var config = require('../config');
var router = express.Router();

var async = require('async');




//a function to recursively crawl all the related templates for a specific page

function getAllTemplates(client, params, result, callback){
  client.api.call(params, function(err, info,next,data){
    if(err) callback(err);
    var allPages = info.pages;
    for(var object in allPages){ // because allPages is a dict, need to iterate over all the object in it
      result.push(allPages[object].title);
    }
 
   
    if( data['query-continue'] == undefined){
      console.log(result.length + ' template names  has been crawled'  );
      callback(null,result);
    }
    else{ // if there are still query-continue, update the params and recursively call itself
      var ctnFlag = data['query-continue'].templates.gtlcontinue;
      params.gtlcontinue = ctnFlag;
      
    getAllTemplates(client, params, result, callback);
    }
  })
}

//a function to crawl all the articles with in the Mediawiki:MediaWiki:Wiki-navigation 

function getAllNavArticles(client, params, ret, callback){
  var navbarLink = 'Mediawiki:Wiki-navigation';
  client.getArticle(navbarLink, function(err, result){
    var nvaBarArtciles = [];
    var re = /([*]+)([]) /(|[a-Z + 0-9]+)* /;
  });
}


//function to crawl the content of an articleList and store them in an array as return value 
//should be called in the crawler waterfall function
function crawlArticlesContent(client, articleList, callback){
  console.time('content crawling');
  var workDone = 0;
  var ret = [];
  for(var i = 0; i < articleList.length; i++){
    client.getArticle(articleList[i], function(err, result){
      if(err) callback(err);
      workDone++;
      ret.push({ARTICLE: this.name, VALUE: result});
      if(workDone == articleList.length){
        console.timeEnd(content crawling);
        callback(null, ret);
      }
    }.bind({name: articleList[i]}));
  }
}


//function to create the content page for the source domain. 

function editArticleList(client, contentList, callback){
  var editDone = 0;
  for(var i = 0; i < contentList.length; i++){
  	var pageName = contentList[i].ARTICLE;
  	var pageConten = contentList[i].VALUE;
  	client.edit(pageName, pageContent, 'bot edit', function(err, result){
  		if(err) callback(err);
  		editDone++;
  		if(editDone == contentList.length){
  			callback(null, 'SUCCESS');
  		}
  	});
  }
}





router.get('/im', function(req,res){
  var page = req.query.page;
  var domain = req.query.domain;
  var source = req.query.src 


  var client = new bot({
    server: domain,
    path: '',
    debug: false
  });

  var params = {
    action: 'query',
    generator: 'templates',
    titles: page,
    format: 'jason'
  }

  var templates = [];

  async.waterfall([


    function(callback){//get all the templates used on the target page
      var ret = [];
      ret.push(page);
      
      getAllTemplates(client,params, ret, callback);

    }, // end of first waterfall function

    function(arg, callback){ //arg1 is now all the pages including templates that needs to be crawled
    
      var articles = arg;
      console.log(articles.length + ' articles needs to be created');
      crawlArticlesContent(client, articles, callback);
      
    },//end of second waterfall function


    function(arg, callback){ //register the edit bot for the source domain
      client = new bot({
        server: source,
        path: '',
        debug: false
      });
      client.logIn(config.bot.name, config.bot.pwd, function(err,result){
        if(err) callback(err);
        callback(null, arg); // pass the result from the previous function to next editor function
      })
    }, //end of thrid waterfall function

    function(arg, callback){ // editor function for the source domain
    	editArticleList(cleint, arg, callback);
    } //end of the forth waterfall function

  ], function(err,result){ //final response function for the waterfall
    if(err){
      console.log(err);
      res.send(err);
    }
    res.send(result);
  }
  );//end of async water fall function
});




//the prototype of the crawler 
//saved for future refence, needs to be cleaned after the migration
//should not be called
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
      //      console.log(allPages[object].title);
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