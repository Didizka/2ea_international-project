app.controller('UserPageController', function($scope, $http, $location, $routeParams){
      
    // Load the Visualization API and the corechart package.
      google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      function drawChart() {

        // Create the data table.
        var data1 = new google.visualization.DataTable();
        data1.addColumn('string', 'Time');
        data1.addColumn('number', 'Heart Rate');
          
        var data2 = new google.visualization.DataTable();
        data2.addColumn('string', 'Time');
        data2.addColumn('number', 'Heart Rate');
          
        for(var i = 1; i <= 5000; i+=10)
        {          
            data1.addRows([
                [i.toString(), Math.random()*100]          
        ]);  
            data2.addRows([
                [i.toString(), Math.random()*100]          
        ]);
        }        

        // Set chart options
        var options1 = {title:'My ECG 1',
                        width:5000,
                        height:500,
                        lineWidth: 2,
                        chartArea: {width:'95%'}
                      };

        var options2 = {title:'My ECG 2',
                        width:5000,
                        height:500,
                        lineWidth: 2,
                        chartArea: {width:'95%'}
                      };
          
        // Instantiate and draw our chart, passing in some options.
        var chart1 = new google.visualization.LineChart(document.getElementById('chart1_div'));
        chart1.draw(data1, options1);
          
        var chart2 = new google.visualization.LineChart(document.getElementById('chart2_div'));
        chart2.draw(data2, options2);
      }  
});