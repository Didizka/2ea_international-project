    app.controller('UserPageController', function($scope, $http, $location, $routeParams, RecordName){

      console.log(RecordName.getModel('record'));

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

        $http.get('user_data/User.json')
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
            
            get_QRS();
          });

    function get_QRS() {
            $http.get('user_data/User.json')
          .success(function(data) {
            for(var i = 1; i <= 10000; i++)
            {   
              averageArray[i] = (data.measurement1.sensor1[i] + data.measurement1.sensor2[i]) / 2;                
            }

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
            }
          });
        }

    function calc_QRS_time(){

        console.log(timePerSample + " sec per sample");
        var qrs_duration;
        for(var i = 0; i < r_Index.length; i++){
            qrs_duration = ((s_Index[i] - q_Index[i]) * timePerSample);
            qrs_Duration.push(qrs_duration);
        }
    }

        // Set chart options
    var options1 = {title:'ECG',
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
    });