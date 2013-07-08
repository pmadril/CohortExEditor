var Utils = {
	slugify : function(text) {
		return text.replace(/\s+/g, '-').toLowerCase();
	}
};

/*
 * Message Handler, displays an error message on the page
 */
MessageHandler = {
	displayMessage : function(message) {
		var div = document.createElement("div");
		$(div).html(message);
		$(div).attr('class', 'alert alert-info');
		$('#message-container').append(div);
		$(div).delay(800).slideUp(400);
	}
};

/*
 * Error Handler, displays an error message on the page
 */
ErrorHandler = {
	displayErrorMessage : function(message) {
		var div = document.createElement("div");
		$(div).html(message);
		$(div).attr('class', 'alert alert-error');
		$('#message-container').append(div);
		$(div).delay(800).slideUp(400);
	},
	handleGithubError : function(message, err) {
		ErrorHandler.displayErrorMessage(message + ' '
				+ ErrorHandler.getGithubErrorMessage(err));
	},
	getGithubErrorMessage : function(err) {
		var errObj = JSON.parse(err.request.responseText);
		return errObj.message;
	}
};

Loader = {
	displayLoader : function(message, progress) {
		$('#loading-modal .message').html(message);
		$('#loading-modal .bar').css('width', progress+'%');
		$('#loading-modal').modal('show');
	},
	hideLoader : function() {
		$('#loading-modal .message').html('');
		$('#loading-modal .bar').css('width', '100%');
		$('#loading-modal').modal('hide');
	},
	updateProgress : function(progress) {
		$('#loading-modal .bar').css('width', progress+'%');
	}
};

var JekyllBuilder = function() {
	YAML_FRONT_MATTER = '---\n' + 'layout: post\n' + 'title: %title\n'
			+ '---\n\n';

	this.buildPost = function(title, data) {
		filename = Utils.slugify(title);
		yaml = YAML_FRONT_MATTER.replace('%title', title);

		post = {
			filename : filename + '.md',
			body : yaml + data
		};

		return post;
	};
};

/*
 * Holder for Account/authentication info
 */
var Account = {
	authenticated : false,
	branch : '',
	name : '',
	password : '',
	repo : '',
	username : '',

	clear : function() {
		Account.authenticated = false;
		Account.name = '';
		Account.password = '';
		Account.username = '';
		Account.save();
	},

	load : function() {
		var authenticated = localStorage.getItem('Account.authenticated');
		if (authenticated) {
			Account.authenticated = authenticated === 'true';
			Account.branch = localStorage.getItem('Account.branch');
			Account.name = localStorage.getItem('Account.name');
			Account.password = localStorage.getItem('Account.password');
			Account.repo = localStorage.getItem('Account.repo');
			Account.username = localStorage.getItem('Account.username');
		}
	},

	save : function() {
		localStorage.setItem('Account.authenticated', Account.authenticated);
		localStorage.setItem('Account.branch', Account.branch);
		localStorage.setItem('Account.name', Account.name);
		localStorage.setItem('Account.password', Account.password);
		localStorage.setItem('Account.repo', Account.repo);
		localStorage.setItem('Account.username', Account.username);
	}
};

var log = {
	debug : function() {
		if (typeof console == 'undefined') {
			return;
		}
		console.debug.apply(console, arguments);
	},
	info : function() {
		if (typeof console == 'undefined') {
			return;
		}
		console.info.apply(console, arguments);
	},
	warn : function() {
		if (typeof console == 'undefined') {
			return;
		}
		console.warn.apply(console, arguments);
	},
	error : function() {
		if (typeof console == 'undefined') {
			return;
		}
		console.error.apply(console, arguments);
	}
};

var App = {
	getGithub : function(){
		return new Github({
			username : Account.username,
			password : Account.password,
			auth : "basic"
		});
	},
	init : function() {
		log.info('Initializing application');

		// Pre-start checks
		if (!localStorage) {
			alert('Your browser is not supported!  Please use a supported browser.');
		}

		// Start up the account
		Account.load();
		log.debug('Checking to see if need to login');
		if (App.loginRequired && Account.authenticated == false) {
			$('#login-modal').modal('show');
		}

		if (Account.authenticated && Account.authenticated == true) {
			log.debug("Adding logged in top section");
			$('#top-login').load('fragments/top-bar-account-info.html',
					function() {
						$('.account-name').html(Account.name);
					});
		}

		log.debug("Initializing methods");
		$.each(App.initMethods, function(index, initMethod) {
			try {
				initMethod();
			} catch (e) {
				log.error('Exception calling method ' + initMethod, e);
			}
		});
	},
	register : function(initMethod) {
		App.initMethods.push(initMethod);
	},
	parameters : {},
	initMethods : [],
	loginRequired : false
};

// perform all non-document loading here
if (window.location.href.indexOf('?') != -1) {
	var qs = window.location.href.split('?')[1].split('#')[0].split('&');
	var elem = [];
	for ( var i = qs.length - 1; i >= 0; i--) {
		elem = qs[i].split('=');
		App.parameters[elem[0]] = elem[1];
	}
}

$(document).ready(function() {
	App.init();

	// Handle login
	$('form#login').submit(function() {
		
		Loader.displayLoader("Logging in", 100);
		log.debug('Submitting login form');
		$('#login-modal .error').hide();
		$('#username').attr("disabled", "disabled");
		$('#password').attr("disabled", "disabled");
		$('#login input[type=submit]').attr("disabled", "disabled");
		
		Account.authenticated = false;
		Account.username = $('#username').val();
		Account.password = $('#password').val();
		Account.save(); 
		var gh = App.getGithub();
		var user = gh.getUser();
		user.show(null, function(err, content) {
			$('#username').removeAttr("disabled");
			$('#password').removeAttr("disabled");
			$('#login input[type=submit]').removeAttr("disabled");
			Loader.hideLoader();
			if (err) {
				var message = ErrorHandler.getGithubErrorMessage(err);
				log.debug('Login failed with message: ' + message);
				$('#login-modal .error').html('Login Failed: ' + message);
				$('#login-modal .error').show();
			} else {
				log.debug('Login successsful');
				Account.authenticated = true;
				Account.name = content.name;
				Account.username = $('#username').val();
				Account.password = $('#password').val();
				Account.save();
				$('#login-modal').modal('hide');
				window.location = 'editor-home.html';
			}
		});
		return false;
	});
});
