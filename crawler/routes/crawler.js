var bot = require('nodemw');
var async = require('async');


/**
* Get all all the templates used in the target page. 
* Use Mediawiki Generator API to fetch all the template names
* MW bot (templateClient) and parameters (params) will be defined,
* then proceed to call its helper to recursively get all the 
* template name info
* 
* @param {String} page, the target page name 
* @param {String} mwDomain, the mediawiki domain API url where the target page is in
*
**/

function getAllTemplatesInArticle(page, mwDomain, callback){
  var templateClient = new bot({
    server: mwDomain,
    path: '',
    debug: true
  });

  var params = {
    action: 'query',
    generator: 'templates',
    titles: page,
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
    if(err ) {
    	callback(err);
      return;
    }
    if(info === undefined || data === undefined){
      callback(null,result);
      return;
    }
    var allPages = info.pages;
    for(var object in allPages){ // because allPages is a dict, need to iterate over all the object in it
      result.push(allPages[object].title);
    }
 
   
    if( data['query-continue'] == undefined){ //if there is no query-continue, callback
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




/**
* Fetch the wikitext content for each of the artciles in the article list
* @param {[String]} articleList: an array of article names
* @param {String} mwDomain: the mediawiki Domain where the article list exists
**/

function getArticleListContent(articleList, mwDomain, callback){
	var client = new bot({
		server: mwDomain,
		path : '',
		debug: false
	});



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

/**
* Given a target article and the corresponding mediawiki domain
* fetch all the content in the article along with all the templates
* @param {String} article: the target article name
* @param {String} mwDomain: the mediawiki domain that the target article reside in 
*/
function fetchAllContentInArticle(article, mwDomain, ftCallback){
	async.waterfall(
		[
		function(callback){
			getAllTemplatesInArticle(article, mwDomain,callback);
		},
		function(pageList, callback){
			pageList.push(article);
			getArticleListContent(pageList, mwDomain, callback);
		}
		],function(err,result){
			if(err){
        ftCallback(err);
      }
      else{
        ftCallback(null,result);
      }
		});

};


module.exports = {
	getAllTemplatesInArticle : getAllTemplatesInArticle,
	fetchAllContentInArticle : fetchAllContentInArticle,
  getArticleListContent    : getArticleListContent
};