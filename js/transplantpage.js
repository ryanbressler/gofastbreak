// 
// 
//  
//      Copyright (C) 2003-2010 Institute for Systems Biology
//                              Seattle, Washington, USA.
//  
//      This library is free software; you can redistribute it and/or
//      modify it under the terms of the GNU Lesser General Public
//      License as published by the Free Software Foundation; either
//      version 2.1 of the License, or (at your option) any later version.
//  
//      This library is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//      Lesser General Public License for more details.
//  
//      You should have received a copy of the GNU Lesser General Public
//      License along with this library; if not, write to the Free Software
//      Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA
 
loadthese=[];
transplants=[];
locationhistory=[];
drawthese=[];

var Url = {
 
	// public method for url encoding
	encode : function (string) {
		return escape(this._utf8_encode(string));
	},
 
	// public method for url decoding
	decode : function (string) {
		return this._utf8_decode(unescape(string));
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

function getQueryVariable(variable) { 
  var query = Url.decode(window.location.search.substring(1)); 
  var vars = query.split("&"); 
  var returnarray = [];
  for (var i=0;i<vars.length;i++) { 
    var pair = vars[i].split("="); 
    if (pair[0] == variable) { 
      returnarray.push(pair[1]); 
    } 
  }
  
  //if(returnarray.length > 1)
  	return returnarray;
 //if(returnarray.length == 1)
 // 	return returnarray[0];
  
} 



function checkallf()
{
	val = document.getElementById("checkallb").checked;
	for( i in filenames)
	{
		document.getElementById(filenames[i]).checked = val;
	}
}

function log(msg)
{
	if(window.console && console.debug)
	{
		console.log(msg)
	}
}



function getlabelrow(patient)
{
	var html = "<tr><td></td>"
	var patientsamples = {"01":true};
	for (var st in sampletypes)
	{
		if(patients[patient].samples.hasOwnProperty(st))
		{
			patientsamples[st]=true;
		}
	}
	if( !patientsamples["11"] && !patientsamples["10"] )
	{
		patientsamples["10"] = true;
	}
	
	for (var type in sampletypes)
	{
		if(patientsamples[type])
		{
			var label = "Tissue type " + type + (samplelabels[type] === undefined ? "" :" ("+samplelabels[type]+")") ;
			html += "<td><center>"+label+"</center></td>";
		}
	}
	
	return html+"</tr>";
}

function datafields(patient,style)
{
	var newhtml="";
	
	var patientsamples = {"01":true};
	for (var st in sampletypes)
	{
		if(patients[patient].samples.hasOwnProperty(st))
		{
			patientsamples[st]=true;
		}
	}
	if( !patientsamples["11"] && !patientsamples["10"] )
	{
		patientsamples["10"] = true;
	}
	for (var st in sampletypes)
	{
		if(patientsamples[st])
			{
			if(style!==undefined && style.length > 0)
			{
				newhtml+="<td class ='outlined' style='"+style+"'>"
			}
			else
			{
				newhtml+="<td class ='outlined'>";
			}
			if(patients[patient].samples.hasOwnProperty(st))
			{
	
				newhtml+="<table><tr><td>";
				
				for (var i in patients[patient].samples[st])
				{
					var filename = patients[patient].samples[st][i];
	
					newhtml+="<div id='"+filename+"div' ><center><img src='"+ajloader+"'/><\/center><\/div><br/><center>"+filename.split(".break")[0]+"</center><br/>";
				}
				
				newhtml+="</td></tr></table></td>";
			}
			else
			{
				newhtml+="<center>No Data</center></td>";
			}
		}
		
	
	}
	return newhtml;
}

function drawTable()
{
	/*log("survival response recieved");
	if (response.isError()) {
    	log('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    	return;
  	}
  	var survivaldata = response.getDataTable();*/
  	
  	var newhtml ="<center><div id='legenddiv'></div></center><br/>";
	
	newhtml+="<center><table cellspacing='4'>";
	

	knownoutcomes ={}
	//var labels = getlabelrow();
	/*for (var row = 0; row < survivaldata.getNumberOfRows(); row++) {
		
		var patient=survivaldata.getValue(row,1);
		if(patients[patient])
		{
			var prog = survivaldata.getValue(row,4);
			var age = survivaldata.getValue(row,2);
			var survival = Math.round(survivaldata.getValue(row,3)*100)/100;
			
			newhtml+=getlabelrow(patient)+"<tr><td>Patient: "+patient+"<br/>Prognosis: "+prog+"<br/>Survival Years: "+survival+"<br/>Age: "+age+"<br/></td>";
			if(knownoutcomes[patient]!==true)
			{
				newhtml+=datafields(patient,progstyle[prog])
				knownoutcomes[patient] = true;
			}
			else
			{
				var errortd = "<td>Duplicate row due to multiple survival times in database.</td>";
				newhtml+=errortd+errortd+errortd;
			}
			newhtml+="</tr>";
		}
		
		
	
	}*/
	
	for(var patient in patients)
	{
		if(knownoutcomes[patient]!==true)
		{
			newhtml+=getlabelrow(patient)+"<tr><td>Patient: "+patient+"<br/>No Data</td>";
			newhtml+=datafields(patient,"")
			newhtml+="</tr>";
		}
	}
	
	newhtml+="</table></center>";
	
	document.getElementById('visdiv').innerHTML=newhtml;
	org.systemsbiology.visualization.transplant.colorkey(org.systemsbiology.visualization.transplant.chrmcolors.human,document.getElementById('legenddiv'));
	loadingpatientinfo = false;
	for( var i in drawthese)
	{
		drawVis(drawthese[i].file,drawthese[i].data)
	}
	drawthese = [];
  	
}

function handleResponse(response, i)
{
	var file = loadthese[i];
	log("response recieved i is " + i + " file is " + loadthese[i] );
	if (response.isError()) {
    	log('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    	return;
  	}
  	var data = response.getDataTable();
  	log("data table created");
  	
  	
  	if(loadingpatientinfo)
  	{
  		drawthese.push({file:file,data:data});
  	}
  	else
  	{
  		drawVis(file,data)
  	}
  	
	


}

function getfilters()
{
		filters = [];
		for(var type in {"small":true,"other":true})
		{
			if(document.getElementById('include'+type)!==undefined && document.getElementById('include'+type).checked ==true)
			{
				log("including type " + type);
				filters.push({type:type,minscore:document.getElementById('min'+type+'score').value});
			}
		}
		
		return filters;

}

function drawVis(file,data)
{
	
  	log("drawing "+ file);
  	var div = document.getElementById(file+'div');
  	if(div==null)
  	{
  		log("No survival data found for " + file);
  		//NO Survival data found
  	}
  	else
  	{
		var vis = new org.systemsbiology.visualization.transplant(div);
		transplants.push(vis);
		log("vis created");
		google.visualization.events.addListener(vis, 'select', getSelectionHandler(vis) );
		google.visualization.events.addListener(vis, 'recenter', getRecenterListener(vis) );
		var filters = getfilters();
		vis.draw(data,{widthfield:document.getElementById('widthfield').value,filters:filters,chr:document.getElementById('chr').value,depth:document.getElementById('depth').value , start:document.getElementById('start').value, end:document.getElementById('end').value, radius:document.getElementById('radius').value, dataservice:transplantws+'?file='+file, geneds:genedatasource });
		log("vis drawn");
	}
}

function getRecenterListener(vis)
{
	return function (loc) {
		log("recenter event"); 
		locationhistory.push(loc);
		document.getElementById('chr').value = loc.chr;
		document.getElementById('start').value = loc.start;
		document.getElementById('end').value = loc.end;
		for(var i in transplants)
		{
			if(transplants[i]!=vis)
				transplants[i].recenteronlocation(loc.chr,loc.start,loc.end);
		}
	}
		
}

function getSelectionHandler(vis)
{
	return function () {
		log("selection event"); 
		var loc = vis.recenteronrow(vis.getSelection());
		locationhistory.push(loc);
		document.getElementById('chr').value = loc.chr;
		document.getElementById('start').value = loc.start;
		document.getElementById('end').value = loc.end;
		for(var i in transplants)
		{
			if(transplants[i]!=vis)
				transplants[i].recenteronlocation(loc.chr,loc.start,loc.end);
		}
	}
		
}

function getResponseHandler(i)
{
	return function(re) { handleResponse(re, i); };
}

function loadAll()
{
	if (loadthese.length == 0)
		return;
		
	var filterstring = JSON.stringify(getfilters());
	for(var i = 0; i < loadthese.length; i++)
	{
		var query = new google.visualization.Query(transplantws+'?filters='+filterstring+'&chr='+document.getElementById('chr').value+'&start='+document.getElementById('start').value+'&end='+document.getElementById('end').value+'&depth='+document.getElementById('depth').value+'&radius='+document.getElementById('radius').value+'&file='+loadthese[i]);
		query.send(getResponseHandler(i));
	}
}