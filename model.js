var mongoose = require('mongoose');

mongoose.connect('localhost', 'test');

var userSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: {
		type: String,
		lowercase: true
	}
});

// virtual
userSchema.virtual('fullname').get(function () {
	return this.firstname + ' ' + this.lastname;
});

// validation
userSchema.path('email').validate(function (value) {
	var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	return re.test(value);
}, 'Invalid Email');

module.exports = mongoose.model('User', userSchema);