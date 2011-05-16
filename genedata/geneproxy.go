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
For testing:
http://localhost:8081/genedata?tq=select%20gene_symbol%2C%20chr%2C%20start%2C%20end%20where%20gene_symbol%20%3D%20'EWSR1'&tqx=reqId%3A0
*/
	
package geneproxy

import (
	"appengine"
	"appengine/urlfetch"
    //"fmt"
    "http"
    "strings"
    //"io"
    //"os"
)

func init() {
    http.HandleFunc("/genedata", geneProxy)
   }

func geneProxy(w ç, r *http.Request) {
	/*
	proxyhost = "http://fastbreak.systemsbiology.net/google-dsapi-svc/addama/systemsbiology.org/datasources/tcgajamboree/fastbreak/genes/query?"
	target = proxyhost +self.request.query

	re= fetch(target, headers={})
	
	self.response.headers['Content-Type'] = 'text/plain'
	self.response.out.write(re.content)
	*/
	c := appengine.NewContext(r)
    client := urlfetch.Client(c)
    re, _, err := client.Get("http://fastbreak.systemsbiology.net/google-dsapi-svc/addama/systemsbiology.org/datasources/tcgajamboree/fastbreak/genes/query?"+strings.Split(r.RawURL,"?",2)[1])
    if err != nil {
        http.Error(w, err.String(), http.StatusInternalServerError)
        return
    }
    //TODO : fix these next two lines so they onl include the header once
    re.Write(w)
	
	
    
}