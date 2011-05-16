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
/*from google.appengine.ext.blobstore import BlobInfo 

blobs = BlobInfo.all()


print 'Content-Type: text/plain'
print ''
for blob in blobs.run():
	print "%s\n"%(blob.filename)*/
	
package list

import (
	"appengine"
	"appengine/blobstore"
    "fmt"
    "http"
    "io"
    "os"
)

func init() {
    http.HandleFunc("/list", listHandler)
   }

func listHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	
	
	biq = NewQuery("BlobInfo")
    /*if err = datastore.Get(c, key, &e2); err != nil {
    	c.Logf("%v", err)
        http.Error(w, err.String, http.StatusInternalServerError)
        return
    }
	
	*/
	
	w.Header().Set("Content-Type", "text/html")
	
    fmt.Fprint(w, "hello")
}