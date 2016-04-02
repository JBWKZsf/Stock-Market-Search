
   //global variable to store the result of the lookup api
   var companyData;
   var autocompleteResult;

    $(document).ready(function() {


      /****************************** functions about the favourite list *****************************************/

         //automatically call the showFavouriteList funtion
         showFavouriteList();

         var nIntervId;

          
         function autoRefresh(){
              var nIntervId = window.setInterval(updateItemsInLS,5000);
         }


          $(function() {
              $("#toggleSwitch").change(function() {
               if($(this).prop('checked')){
                    autoRefresh();
               }
               else{
                   clearInterval(nIntervId);
               }
            })
          })

         //add the localstorage to favourite list
         function showFavouriteList(){
            if(localStorage.getItem("storedSymbol")!==null){
             var localArray=JSON.parse(localStorage.getItem("storedSymbol"));
            for (var i = 0; i < localArray.length; i++){
              console.log(localArray[i]);
               var favouriteSymbol=localArray[i];
               addToFavourite(favouriteSymbol);
            }
          }
         }
    


        //favourite list link to show details statistics
        $("#favouriteList").on('click', 'a', function(){
             var rowID_Symbol=$(this).closest('tr').attr('id');
             ajaxStockDetail(rowID_Symbol);
             var tmp=getInput(rowID_Symbol);
             var queryArray=JSON.stringify(tmp);
             ajaxStockCharts(queryArray);
             ajaxStockNews(rowID_Symbol); 
             //$("#nextslide").prop("disabled", false);
             $("#resultpadslide").carousel(1);
          })


        function updateItemsInLS(){
          
            if(localStorage.getItem("storedSymbol")!==null){
             var localArray=JSON.parse(localStorage.getItem("storedSymbol"));
            for (var i = 0; i < localArray.length; i++){
               var favouriteSymbol=localArray[i];
               updateFavouriteList(favouriteSymbol);
            }
          }
         }

        //manually refresh the data of the favourtielist
        $("#refreshButton").click(updateItemsInLS);

        //update favourite list
        function updateFavouriteList(companySymbol){
            $.ajax({
                type:"GET",
                url:"stockdata.php",
                data:{symbol:companySymbol},
                dataType:"json",
                success:function(data){
                    console.log(data);
                    updateFavouriteRow(data);  
                }
                
             })
           }

        //update individual row
        function updateFavouriteRow(data){
             adjustDataFormat(data);
              var ChangeColor;
              var ChangeCombine;
              var ChangeDirection;
             
            
              if(data.Change>=0){
                  ChangeColor="green";
                  ChangeDirection="up";
              }
              else{
                ChangeColor="red";
                ChangeDirection="down";
              }

              
              ChangeCombine=data.Change+"("+data.ChangePercent+"%)";

              $("#"+data.Symbol).find('td:eq(1)').html(data.Name);
              $("#"+data.Symbol).find('td:eq(2)').html(data.LastPrice);
              $("#"+data.Symbol).find('td:eq(3)').html("<span style='color:"+ChangeColor+"'>"+ChangeCombine+"</span>"+
                                         "<img src='"+ChangeDirection+".png'>");
              $("#"+data.Symbol).find('td:eq(4)').html(data.MarketCap);
           }

          
         

    /****************************** autocomplete *****************************************/
      $( "#companySymbol" ).autocomplete({
           source: function( request, response ){
             // another way: $.post( "stocksearch.php", { symbol: request.term }, function( data ) {
             //        console.log( data.name ); // John
             //        console.log( data.time ); // 2pm
             //      }, "json");
           $.ajax({
                type:"POST",
                url: "stockdata.php",
                data:{symbol:request.term},
                dataType:"json",
                success: function(data){
                  
                  var lab_value=[];
                  autocompleteResult=data;
                  for (var i = 0; i < data.length; i++) {
                    var item={};
                    item["label"]=data[i].Symbol+"-"+data[i].Name+"("+data[i].Exchange+")";
                    item["value"]=data[i].Symbol;
                    lab_value.push(item);
                  };

                  response(lab_value);
                   document.getElementById("errormessage").innerHTML="";   
                },
                error: function(){
                  response();
                  //document.getElementById("errormessage").innerHTML="Select a valid entry"; 
                   //貌似不行！！这个应该放在quote的结果里 $('#companySymbol').append('<div class="help-block">' + "Select a valid entry" + '</div>');
                }
              });
            },
         });
      
      


    /****************************** functions when click quote *****************************************/

      /*********** first tab functions(stock table+yahoo chart) ************/

      $("#searchForm").submit(function(event){
            event.preventDefault();
            var i;
            var tmp=0;
          for (i = 0; i < autocompleteResult.length; i++) {
              if(autocompleteResult[i].Symbol==$("#companySymbol").val()){
                var tmp=1;
                  var companySymbol=$("#companySymbol").val();
                  //request the stockdetail to show the table
                  ajaxStockDetail(companySymbol);
                  //request the news and show the newsfeed
                  ajaxStockNews(companySymbol);
                  

                  var upperCompanySymbol=companySymbol.toUpperCase();
                  var queryArray=JSON.stringify(getInput(upperCompanySymbol));
                  //request the stockchart data and show the historicalchart
                  ajaxStockCharts(queryArray);
                  break;
                }     
              }
              if(tmp==0){
                 document.getElementById("errormessage").innerHTML="Select a valid entry"; 
                 //准备换哈
              }
          
           
        });

      //ajax call which use to retrieve the data of the stock details
      function ajaxStockDetail(companySymbol){
          $.ajax({
                type:"GET",
                url:"stockdata.php",
                data:{detailSymbol:companySymbol},
                dataType:"json",
                success:function(data){
                    if (data.Status!="SUCCESS") {
                       //这里应该放那个select valid entry那个东西
                    }
                    else{
                     $("#stockTable").empty();
                     $("#nextslide").css("cursor","");
                     $("#nextslide").prop("disabled", false);
                     $("#resultpadslide").carousel(1);
                      buildStockTable(data);
                      companyData=data;
                     $("#daily_stock_chart").html("<img src="+"http://chart.finance.yahoo.com/t?s="+companySymbol+"&lang=en-US&width=400&height=300 style='min-width:100%; height:auto;'>");
                     var localArray=localStorage.getItem("storedSymbol");
                     if(localStorage.getItem("storedSymbol")!==null){
                       var localArray=JSON.parse(localStorage.getItem("storedSymbol"));
                     if($.inArray(companySymbol,localArray)==-1){
                        $("#starButton").css("color","white"); 
                      }
                      else{
                        $("#starButton").css("color","gold");
                      }
                    }
                    }   
                }   
            })
        }


        function adjustDataFormat(data){
            data.Change=data.Change.toFixed(2);
            data.ChangePercent=data.ChangePercent.toFixed(2);
            data.ChangePercentYTD=data.ChangePercentYTD.toFixed(2);

          if(data.MarketCap>1000000000000){
                data.MarketCap= (data.MarketCap/1000000000000).toFixed(2)+" Trillion";
                //data.MarketCap= data.MarketCap." Trillion";
            }
               else if(data.MarketCap>1000000000) {
                data.MarketCap= (data.MarketCap/1000000000).toFixed(2)+" Billion";
              }
               else if(data.MarketCap>1000000) {
                data.MarketCap=(data.MarketCap/1000000).toFixed(2)+" Million";
              }

           data.Timestamp=moment(data.Timestamp).format('DD MMMM YYYY, h:mm:ss a');

           data.LastPrice="$ "+data.LastPrice;
           data.High="$ "+data.High;
           data.Open="$ "+data.Open;
           data.Low="$ "+data.Low;
        }


        
        function buildStockTable(data){
            var ChangeColor;
            var YTDChangeColor;
            var ChangeCombine;
            var YTDChangeCombine;
            var ChangeDirection;
            var YTDChangeDirection;

            adjustDataFormat(data);
            
            if(data.Change>=0){
                ChangeColor="green";
                ChangeDirection="up";
            }
            else{
              ChangeColor="red";
              ChangeDirection="down";
            }
            
             if(data.ChangePercentYTD>=0){
                YTDChangeColor="green";
                YTDChangeDirection="up";
            }
            else{
              YTDChangeColor="red";
               YTDChangeDirection="down";
            }
            
            ChangeCombine=data.Change+"("+data.ChangePercent+"%)";
            YTDChangeCombine=data.ChangeYTD+"("+data.ChangePercentYTD+"%)";

            
           $("#stockTable").append("<table id='stockDetailTable' class='table table-striped'></table>");
           $("#stockDetailTable").prepend("<p>Stock details</p>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Name"+"</td><td>"+data.Name+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Symbol"+"</td><td>"+data.Symbol+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Last Price"+"</td><td>"+data.LastPrice+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Change (Change Percent)"+"</td><td>"+
                                      "<span style='color:"+ChangeColor+"'>"+ChangeCombine+"</span>"+"<img src='"+
                                      ChangeDirection+".png'>"+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Time and Date"+"</td><td>"+data.Timestamp+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Market Cap"+"</td><td>"+data.MarketCap+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Volume"+"</td><td>"+data.Volume+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Change YTD (Change Percent YTD)"+"</td><td>"+
                                      "<span style='color:"+YTDChangeColor+"'>"+YTDChangeCombine+"</span>"+"<img src='"+
                                      YTDChangeDirection+".png'>"+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"High Price"+"</td><td>"+data.High+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Low Price"+"</td><td>"+data.Low+"</td></tr>");
           $("#stockDetailTable").append("<tr><td style='font-weight:bold';>"+"Opening Price"+"</td><td>"+data.Open+"</td></tr>");
           $("#stockDetailTable").append("</table>");
        }


        

          //click the favouriteButton and add to the favourite
        $("#favouriteButton").click(function(){
            var SymbolToBeAdd=companyData.Symbol;
            var localArray=[];
            if(localStorage.getItem("storedSymbol")===null){
              $("#starButton").css("color","gold");
               localArray.push(SymbolToBeAdd);
               localStorage.setItem("storedSymbol",JSON.stringify(localArray));
               addToFavourite(SymbolToBeAdd);
            }
            else{
            
              localArray=JSON.parse(localStorage.getItem("storedSymbol"));

            if($.inArray(SymbolToBeAdd,localArray)==-1){
              $("#starButton").css("color","gold");
               localArray.push(SymbolToBeAdd);
               localStorage.setItem("storedSymbol",JSON.stringify(localArray));
               addToFavourite(SymbolToBeAdd);
            }
            else{
                $("#starButton").css("color","white");
                 $("#"+SymbolToBeAdd).remove();
                 var index=localArray.indexOf(SymbolToBeAdd);
                 localArray.splice(index,1);
                localStorage.setItem("storedSymbol",JSON.stringify(localArray));
            }
          }
             
          });


          //ajax call which use to addToFavourite list
          function addToFavourite(SymbolToBeAdd){
            $.ajax({
                type:"GET",
                url:"stockdata.php",
                data:{detailSymbol:SymbolToBeAdd},
                dataType:"json",
                success:function(data){
                    //console.log(data);
                    addFavouriteRow(data);  
                }
                
             })
           }

           //add single row to the favourite list
          function addFavouriteRow(data){
              adjustDataFormat(data);
              
              var ChangeColor;
              
              var ChangeCombine;
              
              var ChangeDirection;
             
              if(data.Change>=0){
                  ChangeColor="green";
                  ChangeDirection="up";
              }
              else{
                ChangeColor="red";
                ChangeDirection="down";
              }

              
              ChangeCombine=data.Change+"("+data.ChangePercent+"%)";

              $("#favouriteList").append("<tr id='"+data.Symbol+"'></tr>");
              $("#"+data.Symbol).append("<td><a>"+data.Symbol+"</a></td>");
              $("#"+data.Symbol).append("<td>"+data.Name+"</td>");
              $("#"+data.Symbol).append("<td>"+data.LastPrice+"</td>");
              $("#"+data.Symbol).append("<td>"+"<span style='color:"+ChangeColor+"'>"+ChangeCombine+"</span>"+
                                         "<img src='"+ChangeDirection+".png'>"+"</td>");
              $("#"+data.Symbol).append("<td>"+data.MarketCap+"</td>");
              $("#"+data.Symbol).append("<td>"+"<button class='btn btn-default'><span class='glyphicon glyphicon-trash'></span></button>"+"</td>");


          }

          

          //use favourite button to delete rows
          //favourite button sometimes act like a trash button
          $("#favouriteList").on('click', 'button', function(){
             var rowID_Symbol=$(this).closest('tr').attr('id');
              localArray=JSON.parse(localStorage.getItem("storedSymbol"));
             var index=localArray.indexOf(rowID_Symbol);
                 localArray.splice(index,1);
             localStorage.setItem("storedSymbol",JSON.stringify(localArray));
             $(this).closest('tr').remove();
          })

     /*********** third tab functions(historical chart) ************/  
          function ajaxStockNews(companySymbol){
           $.ajax({
                type:"GET",
                url:"stockdata.php",
                data:{newsSymbol:companySymbol},
                dataType:"json",
                success:function(data){
                    //console.log(data);
                    $("#news").empty();
                    var items=data.d.results;
                    //console.log(items);
                    
                   $.each(items,function(index,resobj){

                       resobj.Date=moment(resobj.Date).format('DD MM YYYY hh:mm:ss');
                       $("#news").append("<div class='newsitems'>"+
                                         "<a href='"+resobj.Url+"'>"+resobj.Title+"</a>"+"<br><br>"+
                                         resobj.Description+"<br><br>"+
                                         "<p>Publisher: "+resobj.Source+"</p>"+"<br>"+   
                                         "<p>Date: "+resobj.Date+"</p>"+
                                         "</div>"+"</br>")
                       
                   });
                } 
              })
            }


     /*********** second tab functions(historical chart) ************/      
        function ajaxStockCharts(queryArray){
          $.ajax({
                type:"GET",
                url:"stockdata.php",
                data:{chartSymbol:queryArray},
                dataType:"json",
                success:function(json){
                    //console.log(json);
                     if (!json || json.Message){
                          console.error("Error: ", json.Message);
                          return;
                      }
                     render(json);
                   
                },
                error: function(response,txtStatus){
                      console.log(response,txtStatus)
                  }
                
            })

        }
        
        
        //build the query object
        function getInput(companySymbol){
            return {
                  Normalized: false,
                  NumberOfDays: 1095,
                  DataPeriod: "Day",
                  Elements: [
                      {
                          Symbol:companySymbol,
                          Type: "price",
                          Params: ["ohlc"] 
                      }
                  ]
              }
        }
        
        //fix the date
        function fixDate(dateIn){
             var dat = new Date(dateIn);
              return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
        }
        
        //get the ohlc data especially the close data
        function getOHLC(json){
              var dates = json.Dates || [];
              var elements = json.Elements || [];
              var chartSeries = [];

              if (elements[0]){

                  for (var i = 0, datLen = dates.length; i < datLen; i++) {
                      var dat = fixDate(dates[i]);
                      var pointData = [
                          dat,
                          elements[0].DataSeries['close'].values[i]
                      ];
                      chartSeries.push(pointData);
                  };
              }
              return chartSeries;
        }
        
        
        
        //render the json object of charts
        function render(data){
                           
              var ohlc_c = getOHLC(data);
              
              // create the chart
              $("#interactive_charts").highcharts('StockChart', {
                  chart:{
                      height:500
                  },

                  navigation:{
                    buttonOptions:{
                      enabled: false
                    }
                  },
                  
                  rangeSelector: {
                    inputEnabled:false,
                    allButtonsEnabled: true,
                    buttons: [{
                            type:'week',
                            count:1,
                            text:'1w'
                          }, {
                            type: 'month',
                            count: 1,
                            text: '1m'
                          }, {
                            type: 'month',
                            count: 3,
                            text: '3m'
                          }, {
                            type: 'month',
                            count: 6,
                            text: '6m'
                          }, {
                            type: 'ytd',
                            text: 'YTD'
                          }, {
                            type: 'year',
                            count: 1,
                            text: '1y'
                          }, {
                            type: 'all',
                            text: 'All'
                          }],
                      selected: 0
                  },

                  title: {
                      text: $("#companySymbol").val().toUpperCase() + ' Stock Value'
                  },
                  
                  yAxis: {
                         min:0,
                         title: {
                                text: 'Stock Value'
                         }
                  },

                  series: [{
                      type: 'area',
                      name: $("#companySymbol").val().toUpperCase(),
                      data: ohlc_c,
                      threshold:null,
                      tooltip:{
                          valueDecimals:2,
                          valuePrefix:"$"
                      },
                      fillColor:{
                          linearGradient:{
                                  x1: 0,
                                  y1: 0,
                                  x2: 0,
                                  y2: 1
                          },
                          stops : [
                              [0, Highcharts.getOptions().colors[0]],
                              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                          ]    
                      }
                     
                      }]
              });
        }
        
  
        
    
         //slide control
         $("#nextslide").click(function(){
           $("#resultpadslide").carousel("next");
         });
         
         $("#prevslide").click(function(){
           $("#resultpadslide").carousel("prev");
         });

         $("#resultpadslide").carousel({
            interval:false 
         })
    
     
   // document.ready close  
});  


     /*javascript function that reset the form and the inner html of the search result， 
          as well as the text in the input form*/
        function ResetPage(form){
          document.getElementById("searchForm").reset();
          $("#resultpadslide").carousel(0);
          $("#nextslide").css("cursor","not-allowed");
          $("#nextslide").prop("disabled", true);
          form.company.value=""; // set the input to be empty
          document.getElementById("errormessage").innerHTML="";
       }
     
     //customize the invalid message of the required attribute of input in the form
        function InvalidMsg(textbox){
            if(textbox.value == '') {
                  textbox.setCustomValidity("Please enter Name or Symbol");
                return true;
            }
        }
   
