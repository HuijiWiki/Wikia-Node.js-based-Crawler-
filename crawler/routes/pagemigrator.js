var crawler = require('./crawler');
var editor = require('./editor');
var auth = require('./huijiauth');

var async = require('async');

module.exports = {
	migrateSinglePage: function(page, fromDomain, toDomain, pageSpec,  mpCallback){
		async.waterfall(
			[
				function(callback){
					crawler.fetchAllContentInArticle(page, fromDomain, callback);
				},
				function(contentList, callback){
					editor.huijiArticleListEditor(contentList, pageSpec, toDomain,callback);
				}
			], function(err, result){
				if(err){
					mpCallback(err);
				}
				else{
					mpCallback(null, result);
				}
			});
	}

	
}