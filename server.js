// BASE SETUP
// ============================================================================

// Required packages
var express 	= require('express'),
	app 		= express(),
	bodyParser 	= require('body-parser');

// enable the use of bodyParser() => enable getting data from a POST request && set location for static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

// Try to set the port manually to 3000, if not available, set it automatically to a free port
var port = process.env.PORT || 3000;

// API ROUTES
// ============================================================================
var router = express.Router();

// Test route to test everything is working
router.get('/', function (req, res) {
	res.json({message: "Hello There!"});
});

// REGISTER THE ROUTES --------------------------------------------------------
// All the routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// ============================================================================
app.listen(port);
console.log('Server started at: http://localhost:' + port);