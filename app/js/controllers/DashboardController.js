app.factory('RecordName', function () {
    var factory = {};
    var model = {};

    factory.setModel = function(key, value) {
       model[key] = value;
    }
    factory.getModel = function(key) {
       return model[key];
    };
    return factory;
});


app.controller('DashboardController', ['RecordName', '$scope', '$http', '$location', 'Upload', function (RecordName, $scope, $http, $location, Upload) {   
    
    // Get user if he has successfully logged in and started a session
    $scope.askForSession = () => { 
        $http({
            method:'GET',
            url:'/api/session/',
            headers: {'Content-Type':'application/json'}
        })
        .then(function (data){ 
        	// if session is started, get the user, otherwise redirect to login view
        	data.data.session ? $scope.user = data.data.session : $location.path("/login");
        	// Calculate users age based on the current date and his birthdate
        	var birthdate = new Date($scope.user.birthdate);
        	var currentDate = new Date();
        	var age = currentDate - birthdate;
        	$scope.user.age = Math.floor(age / (1000*60*60*24*365.25));
        	// console.log($scope.user);
    	});
    }
    
    // Display the profile page
    $scope.profilePage = () => { 
    	$scope.dashboardView = '/views/profilePage.html';
    };

    // Display the user page
    $scope.userPage = () => {  
        $scope.dashboardView = '/views/userPage.html';
    };  

    // Display the upload page
    $scope.uploadPage = () => {  
        $scope.dashboardView = '/views/uploadPage.html';  
    };  

    // Logout
    $scope.logout = () => {  
        $http({
            method:'GET',
            url:'/api/logout/',
            headers: {'Content-Type':'application/json'}
        })
        .then((data) => { 
        	if (data.data.logout) {
        		alert("You've been successfully logged out");
        		$location.path("/login");        		
        	}
    	}); 
    };  
    

    // Upload new ecg
    // Get content from the file to construct the file name
    // send username, filename & file to the server
    $scope.submit = () => { 
        var reader = new FileReader();
        reader.readAsText($scope.file, "UTF-8");

        reader.onload = (evt) => {
            var fileContent = JSON.parse(evt.target.result);
            var fileName = fileContent.measurement1.day + "-" + fileContent.measurement1.month + "-" + fileContent.measurement1.year + " " + fileContent.measurement1.hour + ":" + fileContent.measurement1.minute;
            Upload.upload({
                method: 'POST',
                url: 'api/data/' + $scope.user.username,
                data: { filename: fileName},
                file: $scope.file
            }).then(function(res) {
                // file is uploaded successfully
                console.log(res);
            }); 
        }
        
        reader.onerror = (evt) => {
            console.log("error reading file");
        }        
    };

    // Get records on 'view existing records' section load
    $scope.getRecords = () => {
        $http({
            method:'GET',
            url:'api/data/' + $scope.user.username
        })
        .then(function (resp) {            
            $scope.user.records = resp.data.records; 

            // delete .json from the records
            for (var i = 0; i <  $scope.user.records.length; i++) {
                $scope.user.records[i] = $scope.user.records[i].replace('.json', '');
            }
            
            // prevent that first option is blank
            $scope.selectedRecord = $scope.user.records[0]; 
        
            // Display default record
            $scope.displayGraph();
        });     
    }

    // Draw the graph of currently selected record
    $scope.displayGraph = () => {
        // Path to current record file
        var recordPath = 'user_data/' + $scope.user.username + '/' + $scope.selectedRecord + '.json';


        // Load the Visualization API and the corechart package.
      google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
   
     var r_Value = [];
     var r_Index = [];
     var q_Value = [];
     var q_Index = [];
     var s_Value = [];
     var s_Index = [];
     var qrs_Duration = [];

     var r_filter = 95;
     var r_offset = 100;
     var qs_offset = 200;

     var timePerSample;

    function calc_R(array) {
      //calculates R values for QRS
      var newNumber;
      var oldNumber = 0;
      var nextNumber;
        
      for(var i = 0; i <= array.length; i++)
      {
       newNumber = array[i];
       if(newNumber > r_filter)
       {
        if(newNumber > oldNumber)
        {
          nextNumber = array[i+3];
          if(newNumber >= nextNumber)
          {
              r_Value.push(newNumber);
              r_Index.push(i);
              i += r_offset;
              oldNumber = 0;
             // console.log(i);
          }
          else
          {
              oldNumber = newNumber;
          }
       }
      }
     }
    }

    function calc_Q(array){
        //Get lowest point left and lowest point right of each peak
        //R values = Peaks
        //Use the index of the peaks

        var q_value;
        var q_index;

        for(var i = 0; i < r_Index.length; i++)
        {
            var newArray = [];
            for(var j = (r_Index[i]-qs_offset);j < r_Index[i]; j++)
            {
                newArray.push(array[j]);
            }

            q_value = Math.min.apply(Math,newArray);
            q_index = newArray.indexOf(q_value);
            q_index = q_index + r_Index[i] - qs_offset;

            q_Value.push(q_value);
            q_Index.push(q_index);
        }
    }

    function calc_S(array){
     var s_value;
     var s_index;

     for(var i = 0; i < r_Index.length; i++)
     {
       var newArray = [];
       for(var j = r_Index[i];j <= (r_Index[i] + qs_offset); j++)
       {
           newArray.push(array[j]);
       }

       s_value = Math.min.apply(Math,newArray);
       s_index = newArray.indexOf(s_value);
       s_index = s_index + r_Index[i];

       s_Value.push(s_value);
       s_Index.push(s_index);
     }
    }

    function drawChart() {

        // Create the data table.
        var data1 = new google.visualization.DataTable();
        data1.addColumn('number', 'Time');
        data1.addColumn('number', 'EKG');

        var dataArray = [];
        var averageArray = [];  

        $http.get(recordPath)
          .success(function(data) {
            dataArray = data.measurement1.sensor1;
            for(var i = 1; i <= 10000; i++)
            {   
              averageArray[i] = (data.measurement1.sensor1[i] + data.measurement1.sensor2[i]) / 2

              data1.addRows([
                [i, averageArray[i]]          
              ]);                
            }

            var chart1 = new google.visualization.LineChart(document.getElementById('chart1_div'));
            chart1.draw(data1, options1);
            
            get_QRS(data);
          });

    function get_QRS(data) {            
            $scope.record = data.measurement1;
                console.log($scope.record);
                for(var i = 1; i <= 10000; i++)
                {   
                  averageArray[i] = (data.measurement1.sensor1[i] + data.measurement1.sensor2[i]) / 2;                
                }

            averageArray[i] = (data.measurement1.sensor1[i] + data.measurement1.sensor2[i]) / 2; 

            var test = averageArray.length / data.measurement1.frequency;
            timePerSample = test / averageArray.length;

            calc_R(averageArray);
            calc_Q(averageArray);
            calc_S(averageArray);

                
            calc_QRS_time();

            for(var i = 0; i < r_Index.length; i++)
            {
                console.log("Value: Q: "+ q_Value[i] + ", R: "+ r_Value[i] + ", S: " + s_Value[i]);
                console.log("Index: Q: "+ q_Index[i] + ", R: "+ r_Index[i] + ", S: " + s_Index[i]);
                console.log("-------------------------------------------");
                console.log("QRS Duration: "+ qrs_Duration[i]);
            }        }
        
    function calc_QRS_time(){

        console.log(timePerSample + " sec per sample");
        var qrs_duration;
        for(var i = 0; i < r_Index.length; i++){
            qrs_duration = ((s_Index[i] - q_Index[i]) * timePerSample);
            qrs_Duration.push(qrs_duration);
        }
    }

        // Set chart options
    var options1 = {title: $scope.selectedRecord,
          hAxis:{
           title: 'Samples'
          },
           vAxis: {
           title: 'mV'
          },
           width:750,
           height:250,
           lineWidth: 2,
           chartArea: {width:'95%'},
           colors:['#a52714', '#097138', '#f1f442']
        };
      }  
    }    


    // Get the user if logged in, redirect if not and display profile page as default view of the dashboard
    $scope.askForSession();
    $scope.profilePage();
}]);