// BASE SETUP
// ============================================================================

// Required packages
var express 	= require('express'),
app 		= express(),
bodyParser 	= require('body-parser'),
mongoose	= require('mongoose'),
session 	= require('express-session'),
fs 			= require('fs'),
multer		= require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		console.log(req.params.username);
		cb(null, __dirname + '/app/user_data/' + req.params.username);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

var upload = multer({storage : storage});

var checkUploadPath = function (req, res, next) {
	var path = __dirname + '/app/user_data/' + req.params.username;
	fs.exists(path, function (exists) {
		if (exists) {
			next();
		} else {
			fs.mkdir(path, function (err) {
				if (err) {
					console.log(err);
					next();
				}
				next();
			});
		}
	});
}

// Connect to the Database
mongoose.connect('mongodb://localhost:27017/ecg');

// Import user model
var User = require(__dirname + '/app/js/models/user');

// enable the use of bodyParser() => enable getting data from a POST request && set location for static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

// Try to set the port manually to 3000, if not available, set it automatically to a free port
var port = process.env.PORT || 3000;

// Enable session variable
app.use(session({secret: 'ecg'}));
var sess;

// API ROUTES
// ============================================================================
var router = express.Router();

var createHomeDir = function(username) {
	var dir = __dirname + '/app/user_data/' + username
	// console.log(dir);
	try {
		fs.mkdirSync(dir);
		console.log('Home dir has been created: ' + dir);
	} catch (err) {
		console.log(err);
	}
	// if (!path.existsSync(dir)) {
	// 	fs.mkdidrSync(dir);
	// 	console.log('Home directory has been created');
	// } else {
	// 	console.log('Home directory already exists');
	// }
}

// Test route to test everything is working
router.get('/', function (req, res) {
	res.json({message: "API works"});
});

// CRUD for user
// CREATE new user
router.route('/users')
.post(function (req, res) {
	console.log(req.body);
			// Save temp username as unique
			var tempUsername = req.body.username;
			var isUnique = true;
			
			// Get all the users to check the uniqness of the username
			User.find(function (err, users) {
				if (err) console.log(err);		
					// If the username already exists, set isUnique to false	
					users.forEach(function (user) {
						if (user.username == tempUsername) {
							console.log(user.username);
							isUnique = false;
						}
					});		
					
					// If the username is unique, create a new user object and save it to the database
					if (isUnique) {
						var user = new User();
						// console.log(req.body);
						user.firstname = req.body.firstname;
						user.lastname = req.body.lastname;
						user.username = req.body.username;
						user.password = req.body.password;
						user.birthdate = req.body.birthdate;
						user.email = req.body.email;
						user.weight = req.body.weight;
						user.length = req.body.length;
						user.medication = req.body.medication;
						user.heartcondition = req.body.heartcondition;
						user.coffeine = req.body.coffeine;
						user.smoker = req.body.smoker;

						createHomeDir(user.username);

						user.save(function (err) {							
							if (err) console.log(err);
							// Return true to the client for further user notification
							return res.json({message: isUnique});
						});

					} else {
					// Return false to the client for further user notification
					return res.json({message: isUnique});
				}	
			});		
		});	

// FIND existing user
router.route('/users/:username/:password')
.get(function (req, res) {
		// Create temp user and set his username and password
		var doesUserExist = true;
		var tempUser = new User();
		tempUser.username = req.params.username;
		tempUser.password = req.params.password;

		// Search database for given username: should return only 1 record
		User.find({username: tempUser.username, password: tempUser.password}, function (err, users) {
			if (err) console.log(err);
			if (users.length != 0 && users[0].username === tempUser.username && users[0].password === tempUser.password) {
					// Start session & return true to the client
					sess = req.session;
					sess.user = users[0];
					res.json({message: doesUserExist});
				} else {		
					// Return false to the client
					doesUserExist = false;			
					res.json({message: doesUserExist});
				}	
			});
	})

	// UPDATE existing user
	.put(function (req, res) {
		res.json({message: "UPDATE user based on username"});
	})
	.delete(function (req, res) {
		res.json({message: "DELETE user based on username"});
	});



// CRD for userdata. NO Update
router.route('/data/:username')
.get(function(req, res){
	res.json({message: "GET user graph"});
})
.post(checkUploadPath, upload.single('file'), function(req, res){
	res.json({message: "POST user graph"});

})
.delete(function(req, res){
	res.json({message: "DELETE user graph"});
});



// sessionStorage
// ============================================================================
// Check if session has been started. If started, send the user object back without his password (frontend), otherwise return false
router.route('/session')
.get(function(req, res){
	sess = req.session;
	if (sess.user) {
		delete sess.user.password;
		res.json({session: sess.user});
	} else {
		res.json({session: false});
	}
});

// Logout: destroy current session and send result back
router.route('/logout')
.get(function(req, res){
	sess = null;
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
			res.json({logout: false});
		} else {
			res.json({logout: true});
		}
	});
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// ============================================================================
app.listen(port);
console.log('Server started at: http://localhost:' + port);

