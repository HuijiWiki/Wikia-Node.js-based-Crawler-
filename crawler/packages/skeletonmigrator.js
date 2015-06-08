var bot = require('nodemw');
var async = require('async');
var _ = require('underscore');

var editor = require('./editor');
var crawler = require('./crawler');



module.exports = {
	/**
	* Get page names out of a nav bar form
	* @param {String} navBarString
	*		eg. 
	*/
	getPageNames: function(navbarString){
		var re = /\*+\s*([^\*\|\n]+)\s*(\|.*)?/g;
		var names = [];
		while(ret = re.exec(navbarString)){

			names.push(ret[1]);
		}
		return names;
	},

	/**
	*
	*/
	getPageMappingSpec: function(mappingStr){
		var mappingList = mappingStr.split('Article Map:')[1];
		var re = /(\S+)\s*(?:->)\s*(\S+)\n/g;
		var pageSpec = {};
		while(ret = re.exec(mappingList)){

			if(ret[1].trim().length> 0 && ret[2].trim().length>0){ //ensure that the page name is not blank
				pageSpec[ret[1]] = ret[2];
			}

		}
		return pageSpec;
	},

	/**
	*
	*/
	getNavbarContent: function(mwDomain, link, callback){
		var client = new bot({
			server: mwDomain,
			path: '',
			debug: true
		});

		client.getArticle(link, function(err, result){
			if(err){
				callback(err);
			}
			else{
				console.log(result);
				var names = module.exports.getPageNames(result);
				callback(null, names);
				
			} 
		});
	},

	/**
	* Get Huji development based packges for huiji.wiki
	*/

	getHuijiPackageInfo: function(huijiDomain, link, callback){
		var client = new bot({
			server: huijiDomain,
			path: '',
			debug: true
		});
		client.getArticle(link, function(err, result){
			if(err){
				callback(err);
			}
			else{
				var strList = result.split('Articles:\n');
			//	console.log(strList);
				var pageSpec = module.exports.getPageMappingSpec(strList[0]);
				var pages = module.exports.getPageNames(strList[1]);
				callback(null, pages, pageSpec);
			}
		})
	},

	/**
	* Install Huiji Manifest packages
	*/

	installHuijiPackage: function(huijiDomain, toDomain, link, hpCallback){
		var pageSpecInfo = {};
		async.waterfall(
			[
				function(callback){
					module.exports.getHuijiPackageInfo(huijiDomain, link, callback);
				},
				function(pageList, pageSpec, callback){
					pageSpecInfo = pageSpec;
					crawler.getArticleListContent( pageList,huijiDomain, callback);
				},
				function(contentList, callback){
					editor.huijiArticleListEditor(contentList, pageSpecInfo, toDomain, callback);
				}
			],function(err,result){
				if(err){
					hpCallback(err);
				}
				else{
					hpCallback(null, 'Install Huiji Package SUCCESS');
				}

			});
	}

};