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


app.controller('DashboardController', ['RecordName', '$scope', '$http', '$location', 'Upload', '$rootScope', '$sce', function (RecordName, $scope, $http, $location, Upload, $rootScope, $sce) {   

  // Calculate user age based on his birthdate
  $scope.calculateAge = () => {
    var birthdate = new Date($scope.user.birthdate);
    var currentDate = new Date();
    var age = currentDate - birthdate;
    $scope.user.age = Math.floor(age / (1000*60*60*24*365.25));
  }

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
        	$scope.calculateAge();
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

    $scope.throwError = (error) => {
        // $("#uploadFormFeedback").prepend('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>');
        // $rootScope.feedback = error;
        $rootScope.feedback = $sce.trustAsHtml('<strong><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + error + '</strong>');
        $("#uploadFormFeedback").removeClass('alert-success');
        $("#uploadFormFeedback").addClass('alert-danger');
    }


    // Upload new ecg
    // Get content from the file to construct the file name
    // send username, filename & file to the server
    $scope.submit = () => {
        if ($scope.file) {
          var reader = new FileReader();
          reader.readAsText($scope.file, "UTF-8");

          reader.onload = (evt) => {
              var fileContent = JSON.parse(evt.target.result);
              var fileName = fileContent.measurement1.day + "-" + fileContent.measurement1.month + "-" + fileContent.measurement1.year + " " + fileContent.measurement1.hour + "꞉" + fileContent.measurement1.minute;
              Upload.upload({
                  method: 'POST',
                  url: 'api/data/' + $scope.user.username,
                  data: { filename: fileName},
                  file: $scope.file
              }).then(function(res) {                
                  if (res.data.success) {
                    $rootScope.feedback = $sce.trustAsHtml('<strong><i class="fa fa-check" aria-hidden="true"></i> Your file has been successfully uploaded</strong>');
                    // $rootScope.feedback= "Your file has been successfully uploaded";
                    $("#uploadFormFeedback").removeClass('alert-danger');
                    $("#uploadFormFeedback").addClass('alert-success');
                  } else {
                    $scope.throwError('Error uploading your file.')
                  }
              }); 
          }
          reader.onerror = (evt) => {
              $scope.throwError('Error reading file');
          }    
        }  else {
          $scope.throwError('Please select a file for upload')
        }  
    };

    $scope.share = () => {
      var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      var linkToShare = "http://84.196.228.4/#/dashboardPage?userid=" + $scope.user._id + "&token=" + token;
      prompt('Please copy the following link and send it to your doctor, so that he can see your graphs online', linkToShare);
      
    }

    $scope.getUserForDoctor = (userid, token) => {
      var user = $http({
            method:'GET',
            url:'api/doctor/' + userid +  '/' + token
        })
        .then(function (resp) {            
            // console.log(resp.data.user);
            $scope.user = resp.data.user;
            return resp.data.user;         
        });
        return user;
    }


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
        // .catch(function (err) {
        //     alert(JSON.stringify(err));
        // });     
    }

    // Draw the graph of currently selected record
    $scope.displayGraph = () => {
        // Path to current record file
        var recordPath = 'user_data/' + $scope.user.username + '/' + $scope.selectedRecord + '.json';

        // Load the Visualization API and the corechart package.
        google.charts.load('current', {'packages':['corechart']});

        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(drawChart);

        var r_Value = [];
        var r_Index = [];
        var q_Value = [];
        var q_Index = [];
        var s_Value = [];
        var s_Index = [];
        var p_Index = [];
        var qrs_Duration = [];
        var rr_Interval = [];
        var pr_Duration = [];

        var averageArray = [];

        var secInMin = 60;
        var r_filter = 72;
        var r_offset = 350;
        var qs_offset = 100;
        var p_offset = 500;
        var slope_offset = 20;
        var sampleOffsetLow = 3500;//5700;
        var sampleOffsetHigh = 4425;//6425;
        var extra_peak_offset = 1060;

        var count_extra_beats = 0;

        //var jsonFile = '../user_data/Normal_Sinus.json';
        //var jsonFile = '../user_data/Premature_Beat.json';
        var jsonFile = 'user_data/Marko_Ecg.json';
        //var jsonFile = '../user_data/Bradycardia.json';
        //var jsonFile = '../user_data/Tachycardia.json';

        var low_filter = 57;

        var timePerSample;
        var BPM;

        $scope.p_Wave = false;
        $scope.odd_PR = false;
        $scope.odd_BPM = false;
        $scope.odd_QRS = false;
        $scope.odd_RR = false;

        function calc_R(array)
        {
            //calculates R values for QRS
            var newNumber;
            var oldNumber = 0;
            var nextNumber;

            for(var i = 0; i <= (array.length -1); i++)
            {
                newNumber = array[i];
                if(newNumber > r_filter)
                {
                    if(newNumber > oldNumber)
                    {
                        nextNumber = array[i+3];
                        if(newNumber >= nextNumber)
                        {
                            r_Value.push(newNumber.toFixed(2));
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

        function calc_P(array)
        {
            for(var index = 1; index < r_Index.length; index++)
            {
                for(var i = (r_Index[index] - p_offset); i < r_Index[index]; i++)
                {
                    if(array[i] > (low_filter))
                    {
                        var slope = (array[(i + slope_offset)] - array[i]) / ((i + slope_offset) - i);
                        //console.log(slope + " index: " + i);
                        if(slope > 0.01)
                        {
                            p_Wave = true;
                            p_Index.push(i);
                            //console.log(i);
                            break;
                        }
                    }
                }
            }
        }

        function calc_PR_Duration()
        {
            //check if there is a P wave at the first peak
            //if yes return yes else no
            //take peak 1: r_Index[0]
            //check between Q and Zero for a fluctuation
            var pr_inSec;
            for(var i = 0; i < p_Index.length; i++)
            {
                pr_inSec = (q_Index[(i+1)] - p_Index[i]) * timePerSample;
                pr_Duration.push(pr_inSec.toFixed(2));
            }
        }

        function calc_Q(array)
        {
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

                q_Value.push(q_value.toFixed(2));
                q_Index.push(q_index);
            }
        }

        function calc_S(array)
        {
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

                s_Value.push(s_value.toFixed(2));
                s_Index.push(s_index);
            }
        }

        function check_Irregularities()
        {
            var qrs_min = Math.min.apply(null, qrs_Duration);
            var qrs_max = Math.max.apply(null, qrs_Duration);
            var pr_min = Math.min.apply(null, pr_Duration);
            var pr_max = Math.max.apply(null, pr_Duration);

            //PR
            for(var i = 0; i < pr_Duration.length; i++)
            {
                if(pr_Duration[i] < 0.12 || pr_Duration > 0.2)
                {
                    $scope.odd_PR = true;
                    break;
                }
                else
                {
                    $scope.odd_PR = false;
                }
            }
            if(pr_min == pr_max)
            {
                document.getElementById("_PR").innerHTML = pr_max +" seconds";
            }
            else if(pr_min != pr_max)
            {
                document.getElementById("_PR").innerHTML = pr_min + " - " + pr_max +" seconds";
            }


            //QRS
            // 0.6 - 0.1s
            for(var i = 0; i < qrs_Duration.length; i++)
            {
                if(qrs_Duration[i] > 0.1)
                {
                    //console.log(qrs_Duration[i]);
                    $scope.odd_QRS = true;
                    break;
                }
                else
                {
                    $scope.odd_QRS = false;
                }
            }
            if(qrs_min == qrs_max)
            {
                document.getElementById("_QRS").innerHTML = qrs_max +" seconds";
            }
            else if(qrs_min != qrs_max)
            {
                document.getElementById("_QRS").innerHTML = qrs_min + " - " + qrs_max +" seconds";
            }


            //R-R intervals odd? value x up to value y , not odd? show highest value
            for(var i = 0; i < rr_Interval.length; i++)
            {
                if(rr_Interval[i] >= 0.6 && rr_Interval[i] <= 1.2)
                {
                    //normal range
                    $scope.odd_RR = false;
                }
                else if(rr_Interval[i] < 0.6 || rr_Interval[i] > 1.2)
                {
                    //odd range
                    $scope.odd_RR = true;
                    break;
                }
            }
            document.getElementById("_RR").innerHTML = Math.min.apply(null, rr_Interval) + " - "+ Math.max.apply(null, rr_Interval)+ " seconds";

            //BPM
            if(BPM < 60)
            {
                //brady
                $scope.odd_BPM = true;
            }
            else if(BPM > 100)
            {
                //tachy
                $scope.odd_BPM = true;
            }
            else
            {
                $scope.odd_BPM = false;
            }

            document.getElementById("_BPM").innerHTML = BPM;
        }

        function check_bpm()
        {
            if(BPM < 60)
            {
                document.getElementById("_BPM_text").innerHTML = "The Beats per Minte are lower than 60, this can be associated with the following Arrhythmia:"
                    +"<br>"+" Bradycardia";
            }
            else if(BPM > 100 && BPM < 250)
            {
                document.getElementById("_BPM_text").innerHTML = "The Beats per Minute are higher than 100, this can be associated with the following Arrhythmia:"
                    +"<br>"+" Tachycardia";
            }
            else if(BPM > 250)
            {
                //possibly flutter (> 250)
                document.getElementById("_BPM_text").innerHTML = "Your BPM is: " + BPM + " this may indicate an extreme form of Tachycardia, namely: Flutter";
            }
        }

        function check_premature_beats()
        {
            //No more than two odd R-R intervals -> premature atrial/ventricular beat
            //Only check for a short R-R below 0.6, since extra beat
            for (var i = 0; i < rr_Interval.length; i++) {
                //console.log(rr_Interval[i]);

                if (rr_Interval[i] < 0.6) {
                    count_extra_beats += 1;
                }
            }
            if (count_extra_beats > 0)
            {
                document.getElementById("_RR_text").innerHTML = "There is one premature beat, this can be associated with the following Arrhythmia:"+"" +
                    "<br>"+"Premature Complex";
            }
        }

        function check_any_beats()
        {
            if(r_Index.length == 0)
            {
                //No measurable heart beat
                //Asystole
                document.getElementById("_RR_text").innerHTML = "there are no visible beats, this may indicate the following Arrhythmia:"+"<br>"+"Asystole";
            }
        }

        function check_prolonged_beats()
        {
            if(Math.max.apply(null, rr_Interval) > 1.2)
            {
                document.getElementById("_RR_text").innerHTML = "The R-R intervals are prolonged";
            }
        }

        function check_PR_interval()
        {
            if(Math.min.apply(null, pr_Duration) < 0.12)
            {
                document.getElementById("_PR_text").innerHTML = "The PR interval is lower than 0.12 seconds, which means there is a shortened P wave."+"<br>"
                    +"This can be associated with the following Arrhythmia:"+"<br>"
                    +"A Junctional rhythm";
            }
            else if(Math.max.apply(null, pr_Duration) > 0.2)
            {
                document.getElementById("_PR_text").innerHTML = "The PR interval is higher than 0.20 seconds, which means there is a prolonged P wave."+"<br>"
                    +"This can be associated with the following Arrhythmia:"+"<br>"
                    +"A first degree Heart block";
            }
        }

        function check_QRS_complex()
        {
            if(Math.max.apply(null, qrs_Duration) > 0.1)
            {
                document.getElementById("_QRS_text").innerHTML = "The QRS complex is higher than 0.1 seconds, which can be assoicated with the following Arrhythmia:"
                    +"<br>"+"The BBB: Bundle Branch Block";
            }
        }

        function Arrhythmia_Text()
        {
            //console.log(odd_QRS);
            //console.log("RR: "+odd_RR);
            //No odd values
            if ($scope.odd_PR == false && $scope.odd_QRS == false && $scope.odd_BPM == false && $scope.odd_RR == false) {
                //no arrhythmia detected
                document.getElementById("_RR_text").innerHTML = "The R-R intervals are Regular";
                document.getElementById("_BPM_text").innerHTML = "The Beats per Minute are Regular";
                document.getElementById("_PR_text").innerHTML = "The PR interval is Regular";
                document.getElementById("_QRS_text").innerHTML = "The QRS complex is Regular";
            }
            else
            {
                if($scope.odd_RR == true)
                {
                    check_any_beats();
                    check_premature_beats();
                    check_prolonged_beats();
                }
                else if($scope.odd_RR == false)
                {
                    document.getElementById("_RR_text").innerHTML = "The R-R intervals are Regular";
                }

                if($scope.odd_BPM == true)
                {
                    check_bpm();
                }
                else if($scope.odd_BPM == false)
                {
                    document.getElementById("_BPM_text").innerHTML = "The Beats per Minute are Regular";
                }

                if($scope.odd_PR == true)
                {
                    check_PR_interval();
                }
                else if($scope.odd_PR == false)
                {
                    document.getElementById("_PR_text").innerHTML = "The PR interval is Regular";
                }

                if($scope.odd_QRS == true)
                {
                    check_QRS_complex();
                }
                else if($scope.odd_QRS == false)
                {
                    document.getElementById("_QRS_text").innerHTML = "The QRS complex is Regular";
                }
            }
        }

        function calc_timePerSample(array, data)
        {
            var total_time = (array.length - 1) / data.measurement1.frequency;
            timePerSample = total_time / (array.length - 1);
        }

        function smoothArray( values, smoothing )
        {
            var value = values[0]; // start with the first input
            for (var i=1, len=values.length; i<len; ++i){
                var currentValue = values[i];
                value += (currentValue - value) / smoothing;
                values[i] = value;
            }
        }

        function average_OfSensors(data)
        {
            if(data.measurement1.test_value == 1)
            {
                normal_sinus_rhythm(data);
            }
            else if(data.measurement1.test_value == 2)
            {
                premature_beat(data);
            }
            else if(data.measurement1.test_value == 3)
            {
                tachycardia(data);
            }
            else if(data.measurement1.test_value == 4)
            {
                bradycardia(data);
            }
            else if(data.measurement1.test_value == 5)
            {
                asystole(data);
            }
            else
            {
                normal_sinus_rhythm(data);
            }

            smoothArray(averageArray,100);
        }

        function normal_sinus_rhythm(data)
        {
            for(var j = 0; j < 2; j++)
            {
                for(var i = 0; i < data.measurement1.sensor1.length; i++)
                {
                    var average_sensors = data.measurement1.sensor1[i] + data.measurement1.sensor2[i];
                    averageArray.push(average_sensors / 2);
                }
            }
        }

        function premature_beat(data)
        {
            for(var j = 0; j < 2; j++)
            {
                for(var i = 0; i < data.measurement1.sensor1.length; i++)
                {
                    if(j < 1)
                    {
                        if(i >= sampleOffsetLow && i <= sampleOffsetHigh)
                        {
                            averageArray.push((data.measurement1.sensor1[i+extra_peak_offset] + data.measurement1.sensor2[i+extra_peak_offset]) / 2);
                        }
                        else
                        {
                            var average_sensors = data.measurement1.sensor1[i] + data.measurement1.sensor2[i];
                            averageArray.push(average_sensors / 2);
                        }
                    }
                    else
                    {
                        var average_sensors = data.measurement1.sensor1[i] + data.measurement1.sensor2[i];
                        averageArray.push(average_sensors / 2);
                    }
                }
            }
        }

        function tachycardia(data)
        {
            for(var i = 0; i < data.measurement1.sensor1.length; i++)
            {
                if(i >= sampleOffsetLow && i <= sampleOffsetHigh)
                {
                    averageArray.push((data.measurement1.sensor1[i+extra_peak_offset] + data.measurement1.sensor2[i+extra_peak_offset]) / 2);

                }
                //extra secondary peak
                else if(i >= 5500 && i <= 6225)
                {
                    averageArray.push((data.measurement1.sensor1[i+extra_peak_offset] + data.measurement1.sensor2[i+extra_peak_offset]) / 2);
                }
                else
                {
                    var average_sensors = data.measurement1.sensor1[i] + data.measurement1.sensor2[i];
                    averageArray.push(average_sensors / 2);
                }
            }
        }

        function bradycardia(data)
        {
            for(var i = 0; i < data.measurement1.sensor1.length; i++)
            {
                if(i >= 8700)
                {
                    averageArray[i] = 57;
                }
                else
                {
                    var average_sensors = data.measurement1.sensor1[i] + data.measurement1.sensor2[i];
                    averageArray.push(average_sensors / 2);
                }
            }
        }

        function asystole(data)
        {

        }

        function calculations()
        {
            $http.get(recordPath)
                .success(function(data) {

                    calc_timePerSample(averageArray, data);
                    calc_R(averageArray);
                    calc_Q(averageArray);
                    calc_S(averageArray);
                    calc_P(averageArray);

                    calc_QRS_inSec();
                    calc_RR_interval();
                    calc_BPM(averageArray,data);
                    calc_PR_Duration(averageArray);

                    log_Values();

                    check_Irregularities();
                    Arrhythmia_Text();
                });
        }

        function log_Values()
        {
            console.log("--------");
            console.log("R index: " + r_Index);
            console.log("R values: " + r_Value);
            console.log("--------");
            console.log("Q index: " + q_Index);
            console.log("Q values: " + q_Value);
            console.log("--------");
            console.log("S index: " + s_Index);
            console.log("S values: " + s_Value);
            console.log("--------");
            console.log("PR duration: " + pr_Duration);
            console.log("--------");
            console.log("RR intervals: " + rr_Interval);
            console.log("--------");
            console.log("QRS durations: " + qrs_Duration);
            console.log("--------");
        }

        function calc_RR_interval()
        {
            var rr_interval;
            for(var i = 0; i < (r_Index.length-1); i++){
                rr_interval = ((r_Index[i+1] - r_Index[i]) * timePerSample);
                rr_Interval.push(rr_interval.toFixed(2));
            }
        }

        function calc_QRS_inSec()
        {

            //console.log(timePerSample + " sec per sample");
            var qrs_duration;
            for(var i = 0; i < r_Index.length; i++){
                qrs_duration = ((s_Index[i] - q_Index[i]) * timePerSample);
                qrs_Duration.push(qrs_duration.toFixed(2));
            }
        }

        function calc_BPM(array, data)
        {
            var bpm;
            var samples = (array.length - 1);
            var freq = data.measurement1.frequency;
            var amount_QRS = r_Index.length;
            bpm = (secInMin/(samples/freq)) * amount_QRS;
            BPM = Math.floor(bpm);
        }

        function drawChart() {

            // Create the data table.
            var data1 = new google.visualization.DataTable();
            data1.addColumn('number', 'Time');
            data1.addColumn('number', 'EKG');

            $http.get(recordPath)
                .success(function(data) {

                    average_OfSensors(data);

                    for(var i = 0; i < averageArray.length; i++)
                    {
                        data1.addRows([
                            [i, averageArray[i]]
                        ]);
                    }

                    var chart1 = new google.visualization.LineChart(document.getElementById('chart1_div'));

                    chart1.draw(data1, options1);

                    // google.visualization.events.addListener(chart1, 'ready', function () {
                    //       document["imageTest"].src = chart1.getImageURI();
                    //   });


                    calculations();
                });

            // Set chart options
            var options1 = {title: $scope.selectedRecord,
                explorer: {axis: 'horizontal',keepInBounds: true},
                hAxis:{
                    title: 'Samples',
                },
                vAxis: {
                    title: 'mV',
                },
                width:1000,
                height:500,
                lineWidth: 2,
                chartArea: {width:'100%'},
                colors:['#a52714', '#097138', '#f1f442'],
                legend: { position: 'top' }
            };
        }
    }

    // Check how the page has been accessed:
    // 1: login: session started? yes => OK, no => login page
    // 2: doctor login with token? => OK    
    var url = $location.path();
    var params = $location.search();
    if (url == "/dashboardPage" && !params.userid && !params.token) {
      $scope.askForSession();
      $scope.profilePage();
    } else if (url == "/dashboardPage" && params.userid && params.token == "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") {
      $scope.isDoctorLoggedIn = true;
      $scope.getUserForDoctor(params.userid, params.token).then(function(user) {
        $scope.getRecords();
        $scope.calculateAge();
        $scope.userPage();
      })
    }

    // http://localhost:7000/#/dashboardPage?userid=591380ff0e53f6393806fcec&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
}]);