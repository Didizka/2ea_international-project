// BASE SETUP
// ============================================================================

// Required packages
var express 	= require('express'),
	app 		= express(),
	bodyParser 	= require('body-parser'),
	mongoose	= require('mongoose');

// Connect to the Database
mongoose.connect('mongodb://127.0.0.1:27017/ecg');

// Import user model
var User = require(__dirname + '/app/js/models/user');

// enable the use of bodyParser() => enable getting data from a POST request && set location for static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

// Try to set the port manually to 3000, if not available, set it automatically to a free port
var port = process.env.PORT || 3000;

// API ROUTES
// ============================================================================
var router = express.Router();

// Middleware to use for all requests
router.use(function (req, res, next) {
	console.log('middleware for router enabled');
	next();
});

// Test route to test everything is working
router.get('/', function (req, res) {
	res.json({message: "API works"});
});

// CRUD for user
router.route('/users')
	.post(function (req, res) {
			var tempUsername = req.body.username;
			var unique = true;
			User.find(function (err, users) {
					if (err) console.log(err);			
					users.forEach(function (user) {
						if (user.username === tempUsername) {
							unique = false;
						}
					});		
					res.json({records: users.length, message: unique});	
			});
				// var user = new User();
			// user.firstname = req.body.firstname;
			// user.lastname = req.body.lastname;
			// user.username = req.body.username;
			// user.password = req.body.password;
			// user.birthdate = req.body.birthdate;
			// user.email = req.body.email;
			// user.weight = req.body.weight;
			// user.length = req.body.length;
			// user.medication = req.body.medication;
			// user.heartConditions = req.body.heartConditions;
			// user.coffeine = req.body.coffeine;
			// user.smoker = req.body.smoker;
			// user.save(function (err) {
			// 	if (err) console.log(err);
			// 	res.json({message: "POST: Register new user", 
			// 				firstname: user.firstname, 
			// 				lastname: user.lastname});
			// });
	});


router.route('/users/:username')
	.get(function (req, res) {
		User.find({name: req.body.username}, function (err, user) {
			if (err) console.log(err);
			res.json({message: "GET user based on username", records: user.length, username: user[0].username});

		});

	})
	.put(function (req, res) {
		res.json({message: "UPDATE user based on username"});
	})
	.delete(function (req, res) {
		res.json({message: "DELETE user based on username"});
	})


// CRD for userdata. NO Update
router.route('/data/:username')
	.get(function(req, res){
		res.json({message: "GET user graph"});
	})
	.post(function(req, res){
		res.json({message: "POST user graph"});
	})
	.delete(function(req, res){
		res.json({message: "DELETE user graph"});
	});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// ============================================================================
app.listen(port);
console.log('Server started at: http://localhost:' + port);

