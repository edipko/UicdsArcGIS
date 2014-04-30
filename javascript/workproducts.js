// JavaScript Document



  
function WorkProductsController($scope, $http) {


    $scope.WorkProductNS = globals.workproductNS;
    $scope.IncidentManagementNS = globals.incidentmanagementNS;

    $scope.uicdsURL = globals.coreAddress;

    var section = 1;
    $scope.section = function (id) {
        section = id;
    };

    var IgID;
    var mapContextData = "";


    /*
     * is function
     */
    $scope.is = function (id) {
        return section == id;
    };

    $scope.workproducts = [];
    $scope.currentWorkproduct = 0;
    $scope.selectedWorkProduct = null;

    // $scope.incidentMgmtEndpoint = $scope.uicdsURL + "/" + globals.incidentMgmtPath;
    // $scope.workproductMgmtEndpoint = $scope.uicdsURL + "/" + globals.workproductPath;

    $scope.incidentMgmtEndpoint = "";
    $scope.workproductMgmtEndpoint = "";
    $scope.mapEndpoint = globals.mapPath;

    /*
     * These will be the functions that get called
     */
    $scope.buttons = [{
        name: "AddWebMap"
    }, {
        name: "AddMapLayer"
    }, {
        name: "AddMapFeature"
    }];


    $scope.init = function () { 
	 
	 // Show the Standby Spinner
	    require(["dijit/registry"], function(registry){
	  		registry.byId("dialogAddGetIncidentsStandby").show();
        });
		
		$("#ofButtons").hide();
		$("#jsonButton").prop("checked", true);	
		$scope.refresh();
    }



    /*
     * Refrest incidents to display
     */
    $scope.refresh = function () {

        $scope.uicdsURL = $("#uicdsURL").val();
        $scope.incidentMgmtEndpoint = $scope.uicdsURL + "/" + globals.incidentMgmtPath;
        $scope.workproductMgmtEndpoint = $scope.uicdsURL + "/" + globals.workproductPath;


        var xml = xmlGetIncidentsTmpl;
        // load agreement list
        $http({
            method: 'POST',
            url: $scope.incidentMgmtEndpoint,
            withCredentials: true,
            headers: {
                "Content-Type": "text/xml",
                "X-Requested-With": null
            },
            data: xml

        }).
        success(function (data, status, headers, config) {

            // clear existing agreements object
            $scope.workproducts = [];

            // this callback will be called asynchronously
            // when the response is available
            var result = xmlToJSON.parseString(data);
            // test to see if any agreements were returned
            var workproductList =
                avail(result, 'Envelope[0].Body[0].GetIncidentListResponse[0].WorkProductList[0]');

            // add them to local array of agreements
            if (workproductList.WorkProduct && workproductList.WorkProduct.length > 0) {
                for (i = 0; i < workproductList.WorkProduct.length; i++) {
                    workproduct = workproductList.WorkProduct[i];
                    $scope.workproducts.push(workproduct);
                }
                $scope.section($scope.currentWorkproduct);

            }
			
			require(["dijit/registry"], function(registry){
	  		   registry.byId("dialogAddGetIncidentsStandby").hide();
			   registry.byId("createIncident_button").setAttribute('disabled', false);
            });
			

            // Debugging:
            // console.log("XML: " + data);

        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            alert('Refresh: An error occured while fetching incidents. Error code: ' + status);
            console.debug(data);
            console.debug(status);
            console.debug(headers);
            console.debug(config);

            require(["dijit/registry"], function(registry){
	  		   registry.byId("dialogAddGetIncidentsStandby").hide();
            });
		
        });
		
		
    };


    $scope.getWPDetails = function (workproduct) {


        //Get the IgID
        IgID = $scope.workproducts[workproduct].PackageMetadata[0].WorkProductProperties[0].AssociatedGroups[0].Identifier[0].text;

        require(["dijit/registry"], function (registry) {
            registry.byId("addWebMap_button").setAttribute('disabled', false);
            registry.byId("addMapLayer_button").setAttribute('disabled', false);
            if (jsonURL != null) {
			   registry.byId("addMapFeature_button").setAttribute('disabled', false);
			}
            
			registry.byId("addMyContent_button").setAttribute('disabled', false);
            registry.byId("igidBox").setValue(IgID);

        });


        if ($scope.lastSelected) {
            $scope.lastSelected.selected = '';
        }
        this.selected = 'selected';
        $scope.lastSelected = this;

        $scope.currentWorkProduct = $scope.workproducts.indexOf(workproduct);
        $scope.selectedWorkProduct = $scope.currentWorkProduct;

        var wp_data = {
            identifier: $scope.workproducts[workproduct].PackageMetadata[0].WorkProductIdentification[0].Identifier[0].text,
            version: $scope.workproducts[workproduct].PackageMetadata[0].WorkProductIdentification[0].Version[0].text,
            type: $scope.workproducts[workproduct].PackageMetadata[0].WorkProductIdentification[0].Type[0].text,
            checksum: $scope.workproducts[workproduct].PackageMetadata[0].WorkProductIdentification[0].Checksum[0].text,
            state: $scope.workproducts[workproduct].PackageMetadata[0].WorkProductIdentification[0].State[0].text,
        }

        // render request
        var xml = "";
        require(["dojo/_base/lang", "dojo/dom", "dojo/domReady!"], function (lang, dom) {
            xml = lang.replace(xmlGetProductTmpl, wp_data);
        });

        // Load Workproduct
        $http({
            method: 'POST',
            url: $scope.workproductMgmtEndpoint,
            headers: {
                "Content-Type": "text/xml"
            },
            withCredentials: true,
            data: xml
        }).
        success(function (data, status, headers, config) {
			//viewRawXML(data);
            var result = xmlToJSON.parseString(data);
			var inc_name = result.Envelope[0].Body[0].GetProductResponse[0].WorkProduct[0].Digest[0].Event[0].Identifier[0].text;
			var inc_desc = result.Envelope[0].Body[0].GetProductResponse[0].WorkProduct[0].Digest[0].Event[0].Descriptor[0].text;
			var latlng = result.Envelope[0].Body[0].GetProductResponse[0].WorkProduct[0].Digest[0].Location[0].GeoLocation[0].CircleByCenterPoint[0].CircleByCenterPoint[0].pos[0].text;
			var latlng_array = latlng.split(" ");
			var latitude = latlng_array[0];
			var longitude = latlng_array[1];
			pan2location(longitude, latitude);
	
            $("#incident_name").val(inc_name);
			$("#incident_descriptor").val(inc_desc);
			
            var wp_data = {
                igid: IgID
            }

            //alert("Incident is associated with: " + IgID);
        }).error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            alert('An error occured while attempting to load the work product from the core. Error code: ' + status);
            console.debug("DATA:" + data);
            console.debug("STATUS: " + status);
            console.debug("HEADERS: " + headers);
            console.debug("CONFIG: " + config);

        });;

    }




    /*
     * Submit new Map
     */

    $scope.submitMap = function () {
        IgID = $("#igidBox").val()

      //  require(["dijit/registry"], function(registry){
	  //		registry.byId("dialogAddWebMap").hide();
      //  });
	  
	  
	  // Show the Standby Spinner
	    require(["dijit/registry"], function(registry){
	  		registry.byId("dialogAddWebMapStandby").show();
        });
		
        var wp_data = {
            igid: IgID
        }

        /*
         * Get All workproducts
         */
        var xml = "";
        require(["dojo/_base/lang", "dojo/dom", "dojo/domReady!"], function (lang, dom) {
            xml = lang.replace(xmlGetAllWorkProductsTmpl, wp_data);
        });


        $http({
            method: 'POST',
            url: $scope.workproductMgmtEndpoint,
            headers: {
                "Content-Type": "text/xml"
            },
            withCredentials: true,
            data: xml
        }).
        success(function (data, status, headers, config) {
			console.log("In Success");
            var result = xmlToJSON.parseString(data);
            var workproductList =
                avail(result, 'Envelope[0].Body[0].GetAssociatedWorkProductListResponse[0].WorkProductList[0]');
            var mapViewContext = "";

            if (workproductList.WorkProduct && workproductList.WorkProduct.length >
                0) {
                for (i = 0; i < workproductList.WorkProduct.length; i++) {
                    workproduct = workproductList.WorkProduct[i];
                    // wps.push(workproduct);
                    var dataItemID = workproduct.PackageMetadata[0].DataItemID[0].text;
                    if (dataItemID.indexOf("MapViewContext") == 0) {
                        mapViewContext = dataItemID;
                    }
                }

                if (mapViewContext.indexOf("MapViewContext") == 0) {

                    var wp_data = {
                        igid: IgID,
                    }

                    /*
                     * Get the associated MapView
                     */
                    var xml = "";
                    require(["dojo/_base/lang", "dojo/dom", "dojo/domReady!"], function (lang, dom) {
                        xml = lang.replace(xmlGetMapViewTmpl, wp_data);
                    });

                    $http({
                        method: 'POST',
                        url: $scope.workproductMgmtEndpoint,
                        headers: {
                            "Content-Type": "text/xml"
                        },
                        withCredentials: true,
                        data: xml
                    }).
                    success(function (data, status, headers, config) {
                        /*
                         * Remove the SOAP envelope and just keep the WorkProduct data
                         */
                        // break the textblock into an array of lines
                        var lines = data.split('>');
                        lines.splice(0, 30);
                        // Find the <str:WorkProductProperties> and mark it for deletion

                        // We need to find a few tags so we can remove them
                        var wpp_start;
                        var wpp_end;
                        var ll_end;
                        for (l = 0; l < lines.length; l++) {
                            var string = lines[l].replace(/\s+/g, '');
                            switch (string) {
                            case "<str:WorkProductProperties":
                                //console.log("Found start");
                                wpp_start = l;
                                break;
                            case "</str:WorkProductProperties":
                                // console.log("Found end");
                                wpp_end = l;
                                break;
                            case "</wmc:LayerList":
                                // console.log("Found end ll");
                                ll_end = l;
                                break;
                            }
                        }
                        var linesToDelete = wpp_end - wpp_start;
                        //console.log("Start: " + wpp_start + " - End: " + wpp_end + " - layerlist: " + ll_end);		
                        lines.splice(ll_end + 0, 7);
                        lines.splice(wpp_start + 0, linesToDelete + 8, "<map:incidentId/");
                        // remove 3 lines at the end of the file
                        //lines.splice(lines.length - 7, 7);
                        // join the array back into a single string
                        mapContextData = lines.join('>');
                      //  viewRawXML(mapContextData);
                        $scope.submitMapData();

                    }).
                    error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        require(["dijit/registry"], function(registry){
	  		               registry.byId("dialogAddWebMapStandby").hide();
						   registry.byId("dialogAddWebMap").hide();
                        });
						
						alert('SubmitMap: An error occured while fetching the MapView. Error code: ' + status);
                        console.debug("DATA:" + data);
                        console.debug("STATUS: " + status);
                        console.debug("HEADERS: " + headers);
                        console.debug("CONFIG: " + config);
                    });;
                } else { // if MapViewContext
                    /*
                     * Current Incident does not have a MapViewContext so we will need to create one
                     */
                    $("#getData").modal('toggle');
					require(["dijit/registry"], function(registry){
	  		               registry.byId("dialogAddWebMapStandby").hide();
						   registry.byId("dialogAddWebMap").hide();
                    });
                    alert("No Default MapContext");

                }
                
            } else {
		       require(["dijit/registry"], function(registry){
	              registry.byId("dialogAddWebMapStandby").hide();
				  registry.byId("dialogAddWebMap").hide();
			   });
			   alert('ERROR!!! No WorkProduct! Note the selected IG and contact the Administrator');
			}
        }).error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            //
            console.debug("DATA:" + data);
            console.debug("STATUS: " + status);
            console.debug("HEADERS: " + headers);
            console.debug("CONFIG: " + config);
			require(["dijit/registry"], function(registry){
	              registry.byId("dialogAddWebMapStandby").hide();
				  registry.byId("dialogAddWebMap").hide();
			});
			alert('SubmitMap: An error occured fetching WorkProducts for the Incident. Error code: ' + status);

        });


    };


    $scope.setVar = function (e) {
        myMapURL = e;
    }

    $scope.submitMapData = function () {
	    require(["dijit/registry"], function(registry){
	       registry.byId("dialogAddWebMapStandby").show();
	    });
        var url = encodeURIComponent($("#mapURL").val());
        var name = $("#mapTitle").val();
        var title = $("#mapName").val();
        var format = $("#mapFormat").val();
		var cdata = $("#mapCData").val();
		var srs = $("#mapSRS").val();

        var wp_data = {
            igid: IgID,
            url: url,
            name: name,
            title: title,
            format: format,
			cdata: cdata,
            srs: srs
        }
        var layer = "";

        require(["dojo/_base/lang", "dojo/dom", "dojo/domReady!"], function (lang, dom) {
            layer = lang.replace(xmlNewMapLayerTmpl, wp_data);
        });


        wp_data = {
            defaultMapBody: mapContextData,
            newLayer: layer,
        }

        var xml = "";
        require(["dojo/_base/lang", "dojo/dom", "dojo/domReady!"], function (lang, dom) {
            xml = lang.replace(xmlAddMapLayerTmpl, wp_data);
        });


        $http({
            method: 'POST',
            url: $scope.workproductMgmtEndpoint,
            headers: {
                "Content-Type": "text/xml"
            },
            withCredentials: true,
            data: xml
        }).
        success(function (data, status, headers, config) {
            //viewRawXML(data);
			alert("Successfully added");
			require(["dijit/registry"], function(registry){
	              registry.byId("dialogAddWebMapStandby").hide();
				  registry.byId("dialogAddWebMap").hide();
			});
			
        }).error(function (data, status, headers, config) {
			$("#dialogAddWebMapStandby").hide();
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            require(["dijit/registry"], function(registry){
	              registry.byId("dialogAddWebMapStandby").hide();
				  registry.byId("dialogAddWebMap").hide();
			});
			alert('SubmitMapData: An error occured submitting data to UICDS. Error code: ' + status);
			console.debug("XML:" + xml);
            console.debug("DATA: " + data);
            console.debug("STATUS: " + status);
            console.debug("HEADERS: " + headers);
            console.debug("CONFIG: " + config);

        });
    }

} // End Function


// XML Templates for the IncidentManagement Service  
var xmlGetIncidentsTmpl = ['<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">',
    '<soapenv:Header xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"/>',
    '<soapenv:Body xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">',
    '<dir:GetIncidentListRequest xmlns:dir="http://uicds.org/IncidentManagementService"/>',
    '</soapenv:Body>',
    '</soapenv:Envelope>'
].join('\n');

var xmlGetProductTmpl = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">',
    '<SOAP-ENV:Header xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"/>',
    '<SOAP-ENV:Body xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">',
    '<wp:GetProductRequest xmlns:precisb="http://www.saic.com/precis/2009/06/base"',
    'xmlns:preciss="http://www.saic.com/precis/2009/06/structures"',
    'xmlns:wp="http://uicds.org/WorkProductService">',
    '<str:WorkProductIdentification xmlns:str="http://www.saic.com/precis/2009/06/structures">',
    '<base:Identifier xmlns:base="http://www.saic.com/precis/2009/06/base">{identifier}</base:Identifier>',
    '<base:Version xmlns:base="http://www.saic.com/precis/2009/06/base">{version}</base:Version>',
    '<base:Type xmlns:base="http://www.saic.com/precis/2009/06/base">{type}</base:Type>',
    '<base:Checksum xmlns:base="http://www.saic.com/precis/2009/06/base">{checksum}</base:Checksum>',
    '<base:State xmlns:base="http://www.saic.com/precis/2009/06/base">{state}</base:State>',
    '</str:WorkProductIdentification>',
    '</wp:GetProductRequest>',
    '</SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>'
].join('\n');

var xmlGetAllWorkProductsTmpl = ['<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">',
    '<soapenv:Header xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"/>',
    '<soapenv:Body xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">',
    '<wp:GetAssociatedWorkProductListRequest xmlns:wp="http://uicds.org/WorkProductService"',
    'xmlns:precisb="http://www.saic.com/precis/2009/06/base">',
    '<precisb:Identifier xmlns:precisb="http://www.saic.com/precis/2009/06/base"',
    'precisb:label="">{igid}</precisb:Identifier>',
    '</wp:GetAssociatedWorkProductListRequest>',
    '</soapenv:Body>',
    '</soapenv:Envelope>'
].join('\n');

var xmlGetMapViewTmpl = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">',
    '<SOAP-ENV:Header />',
    '<SOAP-ENV:Body>',
    '<m:GetMapsRequest xmlns:m="http://uicds.org/MapService">',
    '<m:IncidentId>{igid}</m:IncidentId>',
    '</m:GetMapsRequest>',
    '</SOAP-ENV:Body>',
    '</SOAP-ENV:Envelope>'
].join('\n');

var xmlNewMapLayerTmpl = ['<wmc:Layer hidden="false" queryable="false">',
    '<wmc:Server service="OGC:WMS" title="My Map Server" version="1.1.0">',
    '<wmc:OnlineResource xlink:href="{url}" xmlns:xlink="http://www.w3.org/1999/xlink"/>',
    '</wmc:Server>',
    '<wmc:Name>{name}</wmc:Name>',
    '<wmc:Title>{title}</wmc:Title>',
    '<wmc:Format>{format}</wmc:Format>',
	'<wmc:Abstract>{cdata}</wmc:Abstract>',
    '<wmc:SRS>{srs}</wmc:SRS>',
    '</wmc:Layer>'
].join('\n');

var xmlAddMapLayerTmpl = ['<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:map="http://uicds.org/MapService"',
    'xmlns:con="http://www.opengis.net/context" xmlns:str="http://www.saic.com/precis/2009/06/structures"',
    'xmlns:base="http://www.saic.com/precis/2009/06/base">',
    '<soapenv:Header/>',
    '<soapenv:Body>',
    '<map:UpdateMapRequest>',
    '{defaultMapBody}',
    '{newLayer}',
    '</wmc:LayerList>',
    '</wmc:ViewContext>',
    '</map:UpdateMapRequest>',
    '</soapenv:Body>',
    '</soapenv:Envelope>'
].join('\n');