module.exports = {

	LOGIN_ERR:{
		botLoginError: 'error: bot could not log into the huiji domain'
	},

	EDIT_ERR:{ //error messages used in during the edit process
		aritcleEditorError: function(articleName){
			return "error: can not edit "+ articleName+ ' to target domain';
		}
	},

	CRAWL_ERR: {

	},

	REQUEST_ERR:{
		missingParamError: 'error: key parameters are missing',
		validationError  : 'error: api secret missing for the request',
		tooLongError     : 'error: the request parameter is too long',

	}

}