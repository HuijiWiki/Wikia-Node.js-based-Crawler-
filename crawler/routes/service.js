var express = require('express');
var crypto = require('crypto')
var bot = require('nodemw');
var config = require('../config');
var cookies =  require('cookies');
var router = express.Router();
var async = require('async');
var _ = require('underscore');


/**
* Uses request cookie to check user's session, user name, and user's permissions
* it will return error if user's session is invalid, expired , or user's name not 
* found, or user's user group does not permit this user to initiate this api call.
* Parameter: *request*. the request object from which contains the user's information
**/

function validate(req,callback){
  async.waterfall([
  gerUserName(req,callback),
  checkUserPermission(userName, toDomain, callback)
  ],function(err,result){
    if(err) callback(err);
    callback(null, result);
  }
  );
}



function checkSourceDomain(){
  //TO-DO
}

function checkTargetDomain(){
  //TO-DO
}


/**
* Get users name from the request's cookie to check user's group and permission
**/

function gerUserName(req, callback){
  
  cookie = req.cookies; 
  if(cookie == undefined){
    callback('can not find user cookie');
  }
  var huijiCookie = 'huiji_session';
  var cookieToken = cookie.get(hiujiCookie);
  if(cookieToken === undefined){
    res.send('user not logged in');
  }

  var username = huijiCookie.get('huijiUserName');
  var userId = huijiCookie.get('huijiUserId');

 if(username === undefined){
    callback('user name not found');
 }
  callback(null, username, req.toDomain);
}

/**
* Check a user's group from the user's Name. 
**/

function checkUserPermission(userName, toDomain,callback){
  client = new bot({
    server: toDomain,
    path: '',
    debug: false
  });

  params = {
    action: query,
    list:  users,
    ususers: userName,
    usprops: groups,
    format: jason
  };

  client.api.call(params, function(err, result){
    if(err) callback('user not logged in on this domain');
    var userGroups = result.query.users.groups;
    if(userGroups === undefined){
      callback('error in getting the user permissions');
    }

    if(_.intersection(userGroups, ['sysop', 'bot','bureaucrat']).length == 0){
      callback('user does not have right to make this request');
    };

    callback(null, 'user permission ok');
  });
};




/**
*
* FUNCTIONS TO CRAWL AND EDIT THE WIKI PAGE
*
**/


//a function to recursively crawl all the related templates for a specific page

function crawlAndCreateArticle(articleNanme, fromDomain, toDomain, jobType, retCallback){

  var client = new bot({
    server: fromDomain,
    path: '',
    debug: false
  });

  var params = {
    action: 'query',
    generator: 'templates',
    titles: articleName,
    format: 'jason'
  }

  async.waterfall([
    
    function(callback){//get all the templates used on the target page
      var ret = [];
      ret.push(articleName);
      getAllTemplates(client,params,ret, callback);
    }, // end of first waterfall function

    function(articles, callback){ //articles is now all the pages including templates that need to be crawled
      console.log(articles.length + ' articles needs to be created');
      crawlArticlesContent(client, articles, callback);
      
    },//end of second waterfall function


    function(arg, callback){ //register the edit bot for the source domain
      client = new bot({
        server: toDomain,
        path: '',
        debug: false
      });
      client.logIn(config.bot.name, config.bot.pwd, function(err,result){
        if(err) callback(err);
        callback(null, arg); // pass the result from the previous function to next editor function
      })
    }, //end of thrid waterfall function

    function(arg, callback){ // editor function for the source domain
      editArticleList(client, arg, callback);
    } //end of the forth waterfall function

  ], function(err,result){ //final response function for the waterfall
    if(err){
      console.log(err);
      retCallback(err);
    }
    retCallback(null, result);
  }
  );//end of async water fall function

}



function crawl(articleName, fromDomain, jobType, callback){
  async.waterfall(
    [
      function(callback){
        getAllTemplates(articlename, fromDomain, callback);
      },
      function(templates,)
    ],function(err){

  })
}


/**
* Get the navigation bar of the target wiki
* Parse and save all the article names.
*
**/

function getAllArticlesFromNav(fromDomain, callback){
  var nvalink = "/MediaWiki:Wiki-navigation";
  var fullLink = fromDomain + navlink;
  //TO-DO
}


/**
* Get all all the templates used in the target page. 
* Use Mediawiki Generator API to fetch all the template names
* MW bot (templateClient) and parameters (params) is defined in this function
* then proceed to call its helper
**/

function getAllTemplates(articleName, fromDomain, callback){
  var templateClient = new bot({
    server: fromDomain,
    path: '',
    debug: false
  });

  var params = {
    action: 'query',
    generator: 'templates',
    titles: articleName,
    format: 'jason'
  }

  result = [];

  getAllTemplatesHelper(templateClient, params, result, callback);
}

/**
* Helper function to get all the templates. 
* Use MW Bot to get the article content, check if the flag 'query-continue' exists,
* if true, update the params and recursively crawl all the data
*/

function getAllTemplatesHelper(client, params, result, callback){
  client.api.call(params, function(err, info,next,data){
    if(err || info === undefined || data === undefined) {
    	callback('Template Crawl Error');
    }
    var allPages = info.pages;
    for(var object in allPages){ // because allPages is a dict, need to iterate over all the object in it
      result.push(allPages[object].title);
    }
 
   
    if( data['query-continue'] == undefined){
      console.log(result.length + ' template names  has been crawled'  );
      callback(null,result);
    }
    else{ // if there are still query-continue, update the params and call myself recursively
      var ctnFlag = data['query-continue'].templates.gtlcontinue;
      params.gtlcontinue = ctnFlag;
      
    getAllTemplatesHelper(client, params, result, callback);
    }
  })
}




//function to crawl the content of an articleList and store them in an array as return value 
//should be called in the crawler waterfall function

/**
* 
*/
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
        console.timeEnd('content crawling');
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
  	var pageContent = contentList[i].VALUE;
  	client.edit(pageName, pageContent, 'bot edit', function(err, result){
  		if(err) callback(err);
  		editDone++;
  		if(editDone == contentList.length){
  			callback(null, 'SUCCESS');
  		}
  	});
  }
}




/**
* Node.js based crawler and editor service endpoint. 
* 
* Sample usage query: huiji.wiki:PORT/crawler?page=Test_Target_Page&fromDomain=test.wikia.com&toDomain=test.hiuji.wiki&jobType=1
* 
* Parameters Required:
*   page: String, The target page that user wants to transfer
*   fromDomain: String, the domain where the page exists and the user wants to transfer from
*   toDomain: String, the huiji.wiki domain that user wants to transfer the page to
*   jobType : Int, 1 if it's a (wikia, huiji) ->huiji transfer, 2 if it's a huiji template manager -> huiji transfer
*                  3 if it's wiki skeleton transfer. 
* Errors: 
*   Parameter Undefined Error
*   ToDomain Not Valid Error
*   FromDomain Not Valid Error
*   BOT Error 
*   Tempalte Crawl Error
*   Content Crawl Error
*   Crawl Error
*   Edit Register Error
*   Edit Error
*
* Return Value:
*   SUCCUSS, if all the process completed
*   Errors defined above if any procedure encounters an error. 
**/

router.get('/', function(req,res){
  var page       = req.query.page;
  var fromDomain = req.query.fromDomain;
  var toDomain   = req.query.toDomain;
  var jobType = req.query.jobType; 

  if(page == undefined || fromDomain == undefined || toDomain == undefined || jobType == undefined){
    res.send('Parameter Undefined Error');
  }

  async.series(
    [
      validate(req,callback),
      crawlAndCreateArticles(page,fromDomain,toDomain,jobType),
    ],function(err){
      if(err) res.send(err);
      res.send('SUCCESS');
  }); //end of the async water process


});






module.exports = router;