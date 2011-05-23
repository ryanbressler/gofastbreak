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
This is a simple proxy that passes get requests onto a hardcoded target and returns the
body.


Use a url like this for testing:
http://localhost:8081/genedata?tq=select%20gene_symbol%2C%20chr%2C%20start%2C%20end%20where%20gene_symbol%20%3D%20'EWSR1'&tqx=reqId%3A0
*/
	
package geneproxy

import (
	"appengine"
	"appengine/urlfetch"
   // "fmt"
    "http"
    "strings"
    "io"
    //"os"
)

func init() {
    http.HandleFunc("/genedata", geneProxy)
   }

func geneProxy(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	target := "http://fastbreak.systemsbiology.net/google-dsapi-svc/addama/systemsbiology.org/datasources/tcgajamboree/fastbreak/genes/query?"
    client := urlfetch.Client(c)
    c.Logf("%v", r.RawURL)
    re, _, err := client.Get(target+strings.Split(r.RawURL,"?",2)[1])
    if err != nil {
        http.Error(w, err.String(), http.StatusInternalServerError)
        c.Logf("%v", err)
        return
    }
    
    
   	w.Header().Set("Content-Type", "text/html")
    //w.SetHeader("Content-Type", re.Header["Content-Type"])
  	w.WriteHeader(re.StatusCode)

  	io.Copy(w, re.Body)

  	re.Body.Close()
    
	
	
    
}