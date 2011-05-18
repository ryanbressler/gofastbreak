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
)


func init() {
    http.HandleFunc("/transplantdata", dataserviceHandler)
}

func dataserviceHandler(w http.ResponseWriter, r *http.Request) {
    c := appengine.NewContext(r)
    
    cols := [2]string{"col1","col2"}
    rows := [2][]string{[]string{"val1","val2"},[]string{"val3","val4"}}
    jsonout, err := getGoogleDataTableJson(cols[:],rows[:])
    if  err != nil {
    	serveError(c, w, err)
    }
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprint(w, string(jsonout))
}