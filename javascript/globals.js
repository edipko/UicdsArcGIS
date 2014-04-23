// JavaScript Document
var globals = (function () {

	// core identification
	var incidentMgmtPath = '/uicds/core/ws/services/IncidentManagementService';
	var workproductPath = '/uicds/core/ws/services/ProductService';
	var mapPath = '/uicds/core/ws/services/MapService';

	// service namespaces
	var incidentmanagementNS = 'http://uicds.org/IncidentManagementService';
    var workproductNS = 'http://uicds.org/WorkProductService';
	
	

	// make them public
	return {
		incidentMgmtPath: incidentMgmtPath,
		workproductPath: workproductPath,
		mapPath: mapPath,
        incidentmanagementNS: incidentmanagementNS,
		workproductNS: workproductNS,
    };
}());

