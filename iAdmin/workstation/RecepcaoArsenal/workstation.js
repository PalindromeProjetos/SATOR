﻿(function(){
	window.addEventListener('load', function(){
		
        var json = {
			session: null,
			areasid: "10",
			areasname: "Recepção Arsenal",
			printlocate: "ZDesigner GK420t",
			guid: "A5B2D5DE-83C9-4E53-922C-EAA66EE3EEBA"
		};

		localStorage.setItem('workstation', JSON.stringify(json));

	}, false )	
})();