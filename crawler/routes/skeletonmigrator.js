var bot = require('nodemw');
var async = require('async');
var _ = require('underscore');




module.exports = {
	/**
	* Get page name out of a nav bar form
	* @param {String} navBarString
	*		eg. 
	*/
	getPageName: function(navbarString){
		var re = /\*+([^\*\|\n]+)(\|.*)?/g;
		var names = [];
		while(ret = re.exec(navbarString)){
			names.push(ret[1]);
		}
		return names;
	},

	/**
	*
	*/
	getPageMappingSpec: function(String){

	}

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
				var names = module.exports.getPageName(result);
				callback(null, names);
				
			} 
		});
	},

	/**
	* Install Huji development based packges for huiji.wiki
	*/

	installHuijiPackage: function(huijiDomain, link, callback){
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
			}
		})
	}
};