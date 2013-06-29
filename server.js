var User = require('./model.js');

// populate database
//var user = new User();
//user.firstname = 'Artem';
//user.lastname = 'Kashin';
//user.email = 'dev.tema@gmail.com';
//user.save(function (error, user) {
//	if(error)
//		console.log(error);
//	else
//		console.log("User saved " + user.fullname);
//});

// query
User.findOne({'lastname': 'Kashin'}, function (error, user) {
	if(error)
		console.log(error);
	else
		console.log('Hi, ' + user.fullname);
});