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

/* 
This is a placeholder for an evantual port of transplantws.py 

*/

package fastbreakapp

import (
	"appengine"
    "fmt"
    "http"
    //"json"
    "strings"
    "strconv"
)


func init() {
    http.HandleFunc("/transplantdata", dataserviceHandler)
}

func pareInt(c appengine.Context, w http.ResponseWriter, input string) int {
	val,err := strconv.Atoi(input)
	if err != nil{
		serveError(c, w, err)
	}
	return val

}

func dataserviceHandler(w http.ResponseWriter, r *http.Request) {
    c := appengine.NewContext(r)
    
    /*chrm := string(r.FormValue("chr"))	//the chromosone the start region is located on
	start := parseInt(c,w,r.FormValue("start")) //the start of the start region
	end := parseInt(c,w,r.FormValue("end"))	//the end of the start region
	searchdepth := parseInt(c,w,r.FormValue("depth"))	//the depth of transversals to follow
	searchradius := parseInt(c,w,r.FormValue("radius"))  //the size of leaves
	bdoutfile := string(r.FormValue("file"))  //the breakdancer output
	filters := json.unmarshal(r.FormValue("filters"))
	key := string(r.FormValue("key"))*/
	
	reqId := 0
	responseHandler :="google.visualization.Query.setResponse"
	tqx :=string(r.FormValue("tqx")) //the google query
	for _,param := range strings.Split(tqx,";",-1){
		pair := strings.Split(param,":",-1)
		if pair[0] == "reqId"{
			reqId = pareInt(c,w,pair[1])

		}
		if pair[0] == "responseHandler"{
			responseHandler = string(pair[1])
		}
	}
    
    cols := []string{"col1","col2"}
    rows := [][]string{[]string{"val1","val2"},[]string{"val3","val4"}}
    jsonout, err := getGoogleDataTableJson(cols,rows)
    if  err != nil {
    	serveError(c, w, err)
    }
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprint(w, responseHandler+"({status:'ok',table:"+string(jsonout)+",reqId:'"+fmt.Sprint(reqId)+"'})")
}