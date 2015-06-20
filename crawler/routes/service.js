var express = require('express');
var crypto = require('crypto')
var bot = require('nodemw');
var config = require('../config');
var cookies =  require('cookies');
var router = express.Router();
var async = require('async');
var _ = require('underscore');


var pm = require('./pagemigrator');
var sm = require('./skeletonmigrator');



/**
* TODO: Add authentication middleware 
*/


/**
* Node.js based crawler and editor service endpoint. 
* 
* Sample usage query: huiji.wiki:PORT/pm?page=Test_Target_Page&fromDomain=test.wikia.com&toDomain=test.hiuji.wiki&jobType=1
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

router.get('/pm', function(req,res){
  var page       = req.query.page;
  var fromDomain = req.query.fromDomain;
  var toDomain   = req.query.toDomain;

  if(page == undefined || fromDomain == undefined || toDomain == undefined ){
    res.send('Parameter Undefined Error');
  }

  pm.migrateSinglePage(page, fromDomain,toDomain, {}, function(err, result){
    if(err){
      res.send(err);
    }
    else{
      res.send(result);
    }
  });

});

/**
* Node.js based skeleton crawler and eidtor service endpoint
* 
* Sample usage query: huiji.wiki:PORT/sm(p/n)?fromSkeletonWbsite=xxx.wikia.com&toSkeletonWebsite=test.huiji.wiki&skeleton=Mediawiki:
* Parameter Required: 
*   fromDomain: the domain where to copy the skeleton from
*   targetDomain: the domain to copy the template to
*   skeletonName: the name for the skeleton.
*       eg. For navigation bar of a wikia website, the skeleton name will be : Mediawiki:wiki-navigation
*           For huiji.wiki based website, the skeleton is managed under Manifesto  namespace. 
*/

router.get('/smp', function(req,res){
  var fromDomain = req.query.fromDomain||'templatemanager.huiji.wiki';
  var targetDomain = req.query.targetDomain;
  var skeletonName = req.query.skeletonName;
  
  console.log("smp1 : " + targetDomain);
  console.log("smp2 : " + skeletonName);
  try{
    sm.installHuijiPackage(fromDomain, targetDomain, skeletonName,function(err, result){
      if(err) throw err;
      res.send(result);
    });
  }
  catch(err){
    console.log(err);
    res.send('Error Code:'+err);
  }
});








module.exports = router;