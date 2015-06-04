var bot = require('nodemw');
var async = require('async');
var config = require('../config');

module.exports = {

	/** 
	* Register the editor client bot in huiji.wiki to fetch the editor token
	* the client needs to be passed to any futher editor functions in order 
	* to make editor functions successful.
	* 
	* @param {String} huijiDomain: a mediawiki api domain in huiji.wiki
	*/

	regiEditorOnHuiji: function(huijiDomain,callback){
		var client = new bot({
			server: huijiDomain,
			path: '',
			debug: false
		});

		client.logIn(config.bot.name, config.bot.pwd, function(err,result){
        	if(err) callback(err);
        	callback(null); // pass the result from the previous function to next editor function
      	});
	},

	/**
	* Edit a list of articles on huiji.wiki domain. 
	* Should not be called if the bot if the bot is not registered
	* 
	* @param {nodemw object} huijiClient, a huijibot that has been registered
	* @param {[{ARTICLE: String, VALUE: String}]} articleList, a list of article's name and its content
	* @param {String} huijiDomain: the domain where the editor will apply 
	*/
	editArticleListToHuiji: function(huijiClient, articleList, huijiDomain, callback){
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
	},

	/**
	* Register and Created/Edit the given articleList content to huiji.wiki domain
	* 
	* @param {[{ARTICLE: String, VALUE: String}]} articleList, a list of article's name and its content
	* @param {String} huijiDomain: the domain where the editor will apply 
	* 
	*/

	huijiArticleListEditor: function(articleList, huijiDomain, callback){
		async.waterfall(
			[
				function(callback){
					module.exports.regiEditorOnHuiji(huijiDomain,callback);
				},
				function(huijiClient, callback){
					module.exports.editArticleListToHuiji(huijiClient,articleList,huijiDomain,callback);
				}
			],function(err, result){

			})
	}
}