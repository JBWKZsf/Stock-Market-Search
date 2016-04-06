<?php
        if(isset($_GET["symbol"])){
        
        //construct the url of xml file
        $json_url="http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=".$_GET["symbol"];
           
        $json_content=file_get_contents($json_url);
      
              
          echo $json_content;
                      
        }
?>      
<?php
         
         
        
          if(isset($_GET["detailSymbol"])){

              $json_url="http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=".$_GET["detailSymbol"];

              $json_content=file_get_contents($json_url);
             
              
              echo $json_content;
              
             
          }
        
?>
<?php

   if(isset($_GET["newsSymbol"])){

   	$accountKey = '7t/8zDNjil1gzGEZfkJEAxAnwsHQ7A9kVs4+HIiusCk';

    $context = stream_context_create(array(
	    'http' => array(
	        'request_fulluri' => true,
	        'header'  => "Authorization: Basic ".base64_encode($accountKey.":".$accountKey)
	    )
    ));

	$request = "https://api.datamarket.azure.com/Bing/Search/v1/News?Query=".urlencode("'".$_GET["newsSymbol"]."'")."&".urlencode("$")."format=json";

  
    $response = file_get_contents($request,0,$context);

    echo $response;

}

?>
<?php

   if(isset($_GET["chartSymbol"])){




	 $request = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=".rawurlencode($_GET["chartSymbol"]);

   
    $response = file_get_contents($request);

    echo $response;

   }
 ?>
        


