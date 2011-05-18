/*
     Copyright (C) 2003-2010 Institute for Systems Biology
                             Seattle, Washington, USA.
 
     This library is free software; you can redistribute it and/or
     modify it under the terms of the GNU Lesser General Public
     License as published by the Free Software Foundation; either
     version 2.1 of the License, or (at your option) any later version.
 
     This library is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
     Lesser General Public License for more details.
 
     You should have received a copy of the GNU Lesser General Public
     License along with this library; if not, write to the Free Software
     Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA

*/
package fastbreakapp

import (
	"appengine"
	"appengine/datastore"
	//"appengine/blobstore"
    "fmt"
    "http"
    "sort"
    "strings"
    "template"
    //"io"
    //"os"
)

func init() {
    http.HandleFunc("/", uiHandler)
    http.HandleFunc("/favicon.ico", faviconHandler)
   }
func faviconHandler(w http.ResponseWriter, r *http.Request){
	fmt.Fprint(w, "'false'")
}

func uiHandler(w http.ResponseWriter, r *http.Request) {
	
	c := appengine.NewContext(r)
	q := datastore.NewQuery("fileNameToKey")
	vars :=map[string]string{"checkboxes":"","transplantws":"/transplantdata","survivaldatasource":"/sampledata","genedatasource":"/genedata","jsdir":"/js","loadergif":"/images/loader.gif"}

	lastfile := ""
	
	blobs := make([]fileNameToKey,0,100)
    c.Logf("ui handler entered, vars declared")
    if _, err := q.GetAll(c, &blobs); err != nil {
    	c.Logf("%v", err)
    	fmt.Fprint(w,err.String())
        //http.Error(w, err.String(), http.StatusInternalServerError)
        return
    }
    
    blobmap := map[string]bool{}
    
    for _,blob  := range blobs {
    	//fmt.Fprint(w, blob.Filename) 
    	blobmap[blob.Filename[:28]]=true
    }
    count := len(blobmap)
    files := make([]string,0,count)
    for fn,_ := range blobmap {
    	files=append(files,fn)
    }
    sort.SortStrings(files)
    
     c.Logf("filenames found and sorted")
    for  _,basename := range files{
    	
		if (lastfile != "" && basename[:12] != lastfile [:12]){
			vars["checkboxes"] +="<br/><br/>"+basename[:12]+":<br/>"
		}
		vars["checkboxes"] += "<input type='checkbox' id='"+basename+"' name='"+basename+"'/>"+basename+" "
		lastfile=basename
		
    }
    vars["files"]="['"+strings.Join(files,"','")+"']"
    
    //fake python style string formating poorly
	
	
	pageTemplate.SetDelims("%(",")s")
	pageTemplate.Parse(pageTemplateConst)
	
	if err := pageTemplate.Execute(w, vars); err != nil {
			serveError(c, w, err)
		}
}

var pageTemplate *template.Template = template.New(nil)	

//note: python version has backticks around label
const pageTemplateConst=`<?xml version="1.0" ?>

<html xmlns="http://www.w3.org/1999/xhtml" 

                 xmlns:svg="http://www.w3.org/2000/svg"

     xmlns:xlink="http://www.w3.org/1999/xlink"

     lang="en-US">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<title>Transplant</title>

<style>
body { 
font: 8pt helvetica neue;
color: #666;
}
td { 
font: 8pt helvetica neue;
color: #666;
}
input {
font: 10pt helvetica neue;
}
.outlined {
	color: #666;
	border-color: #F5F5F5;
	border-width: 2px 2px 2px 2px;
	border-style: solid;
	border-spacing: 0px;
	
	}

</style>
	
<script type="text/javascript" src="http://www.google.com/jsapi"></script>
<script type="text/javascript">
  google.load("visualization", "1", {packages:["table"]});
  //google.load("prototype", "1.6");
</script>
<script type="text/javascript" src="%(jsdir)s/transplant.js"></script>

<script type="text/javascript" >


filenames = %(files)s;
transplantws = "%(transplantws)s";
survivaldatasource = "%(survivaldatasource)s";
genedatasource = "%(genedatasource)s";
loadingpatientinfo = true;
patients = {};
sampletypes = {};
progstyle ={"Poor":"border-color: #F5B9B9;","Good":"border-color: #B9F5B9;","Medium":"border-color: #F5F5B9;"};
samplelabels = {"10":"Blood","11":"Adjacent","01":"Tumor"};
ajloader = "%(loadergif)s";

patientrequested = {} 
patientcount = 0;
patientloadedcount =0;

document.onkeypress = keyPress;

function keyPress() {
	if (window.event.keyCode == 13)
	{
		event.returnValue=false;
		event.cancel = true;
		loadgeneandgrow();
	}
}

function loadgeneandgrow()
{
	genelocready = false;
	filenamesready = false;
	
	
	
	//Get gene location
	var gene_symbol = document.getElementById("gene").value;
	var querystring = "select gene_symbol, chr, start, end where gene_symbol = ""+gene_symbol+""";
	this.log("loading: " + querystring +" from " + genedatasource);
	var query = new google.visualization.Query(genedatasource);
	query.setQuery(querystring);	
	query.send(savegeneloc);
	
	var utlpats = getQueryVariable("patients");
	
	patientrequested = {}
	for (var i in utlpats)
	{
		var pat = utlpats[i].split("/").pop()
		log("pat " + pat + " from " + utlpats[i]);
		patientrequested[pat]=true;
	}
	
	//getfilenames
	/*filenames = [];
	
	var utlpats = getQueryVariable("patients");
	patientcount = utlpats.length;
	patientloadedcount =0;
	
	for (var i in utlpats)
	{
		var req = new XMLHttpRequest();
		var patientindex = fileindex+utlpats[i]+"/Pickle";
		req.open("GET", patientindex, true);
		req.onreadystatechange = function (){
			if (req.readyState == 4 ) {
				var files = eval("(" + req.responseText + ")").references;
				for (var j in files)
				{
					log("adding file name"+files[j].local);
					filenames.push(files[j].local);
				}
				patientloadedcount++;
				grow();
			}
		};
		req.send(null);
	}*/
}

function savegeneloc(response)
{
	log("gene location data recieved");
	if (response.isError()) {
    	log("Error in query: " + response.getMessage() + " " + response.getDetailedMessage());
    	return;
  	}
  	var data = response.getDataTable();
  	var radius = parseInt(document.getElementById("radius").value);
	document.getElementById("chr").value = "chr"+data.getValue(0,1);
	document.getElementById("start").value = data.getValue(0,2)-radius;
	document.getElementById("end").value = data.getValue(0,3)+radius;
	genelocready = true;
	grow();
}
function grow()
{
	loadingpatientinfo = true;
	document.getElementById("visdiv").innerHTML="<center><img src=""+ajloader+""/><br/>Loading Patient Data...<\/center>";
	loadthese=[];
	drawthese=[];

	patients = {}
	sampletypes = {"10":true,"11":true,"01":true};
	
	
	
	for (var i in filenames)
	{
		var filename = filenames[i];
		if(document.getElementById(filename).checked)
		{
			loadthese.push(filename);
			
			var patientid = filename.substring(0,12);
			var sampletype = filename.substring(13,15)
			log("patient "" + patientid + "" sampletype "" + sampletype + """)
			
			if(!patients.hasOwnProperty(patientid))
			{
				patients[patientid] = {samples:{}}
			}
			if(!patients[patientid].samples.hasOwnProperty(sampletype))
			{
				patients[patientid].samples[sampletype]=[];
			}
			patients[patientid].samples[sampletype].push(filename);
			
			
			sampletypes[sampletype] = true
			
			/*var filename = filenames[i];
			loadthese.push(filename);
			var patientid = filename.substring(0,12)
			var sampletype = filename.substring(13,15)
			log("patient "" + patientid + "" sampletype "" + sampletype + """)
			
			if(!patients.hasOwnProperty(patientid))
			{
				patients[patientid] = {samples:{}}
			}
			if(!patients[patientid].samples.hasOwnProperty(sampletype))
			{
				patients[patientid].samples[sampletype]=[];
			}
			patients[patientid].samples[sampletype].push(filename);
			
			
			sampletypes[sampletype] = true*/
		}
	}
	loadAll();
	drawTable()
	
	/*log("building survival query");
	var orarray = []
	for (var patient in patients)
	{
		orarray.push("(PATIENT_ID = ""+patient+"")");
		
	}
	
	var patientquery = "select * where " + orarray.join(" or ") + "order by "label" desc, time_years asc";
	
	var query = new google.visualization.Query(survivaldatasource);
	query.setQuery(patientquery);
	
	log("sending query " + patientquery + " to " + survivaldatasource);
	query.send(handleSurvivalResponse);*/
	
	
	
	
			
}






</script>
<script type="text/javascript" src="%(jsdir)s/transplantpage.js" ></script>
<style>
body { margin: 30px; text-align: left; white-space: nowrap;}

</style>

</head>

<body>

<div>
<form>
Data Files:<br/>
<input type="checkbox" id="checkallb" onchange = "script:checkallf();" /> Check All
<div style="width:95%%;height:300;overflow:auto;border:2px grey solid;">
%(checkboxes)s
</div>
<br/>
<center>
<table>
<tr>
<td>
Root Location:<br/><br/>
Gene: <input type="text" id="gene" value ="EWSR1" /><br/>
Chromosome:<input type="text" id="chr" disabled="true" />&nbsp;&nbsp;<br/>
Start:<input type="text" id="start" disabled="true" />&nbsp;&nbsp;
End:<input type="text" id="end" disabled="true" /><br/><br/>
Break Point width:<br/>
Use Data Field: 
<select id="widthfield">
  <option value=5>Number of Reads</option>
  <option value=8>Score</option>
  <option value=false>No Decoration</option>
</select>
</td>
<td>
&nbsp;&nbsp;&nbsp;&nbsp;
</td>
<td>
Tree Parameters:<br/><br/>
Maximum Branch Depth:<input type="text" id="depth" value="2"/>&nbsp;&nbsp;
Search Radius:<input type="text" id="radius" value="400000"/><br/>
<input type="checkbox" id="includesmall" checked="true"/>Include Breakpoints Found by Distance &nbsp;&nbsp;Minimum Score:<input type="text" id="minsmallscore" value="94"/><br/>
<input type="checkbox" id="includeother" checked="true"/>Include breakpoints foune by orientation or chromosome &nbsp;&nbsp;Minimum Score:<input type="text" id="minotherscore" value="94"/>
</td>
</tr>
</table>
<br/><br/>
<input type="button" value="Regrow Transplants" onclick="script:loadgeneandgrow();"/>
</center>
</form>
</div>

<div id="visdiv" style="white-space: nowrap;"></div>
</body>
</html>`