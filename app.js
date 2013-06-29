
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path');

var app = express();

var config = require('./config');

var User = require('./models/user');

var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy;

// setting for passport
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findOne(id, function (err, user) {
		done(err,user);
	});
});

passport.use(new FacebookStrategy({
		clientID: config.development.fb.appId,
		clientSecret: config.development.fb.appSecret,
		callbackURL: config.development.fb.url + 'fbauthed'
	}, function (accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			var query = User.findOne({'fbId': profile.id});
			query.exec(function (err, oldUser){
				if (oldUser) {
					console.log('Existing User: ' + oldUser + ' found and logged in!');
					done(null, oldUser);
				}
				else {
					var newUser = new User();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					newUser.email = profile.emails[0].value;

					newUser.save(function (err) {
						if (err) throw err;
						console.log('New user: ' + newUser.name + ' created and logged in!');
						done(null, newUser);
					});
				}
			});
		});
	}
));

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('1f5129b5993ec5c8157a854d8c2dc6b0'));
app.use(express.bodyParser());
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/fbauth', passport.authenticate('facebook', {scope: 'email'}));
app.get('/fbauthed', passport.authenticate('facebook', {failureRedirect: '/'}), routes.loggedin);
app.get('/logout', function (req, res) {
	req.logOut();
	res.redirect('/');
});

app.get('/settings', ensureAuthenticated, function (req, res) {
	res.render('settings', {title: 'Express', user: req.user});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

function ensureAuthenticated (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
