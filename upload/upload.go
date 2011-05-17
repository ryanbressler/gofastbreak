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

package uploadkey

import (
	"appengine"
	"appengine/blobstore"
    "fmt"
    "http"
    "io"
    "os"
)

func init() {
    http.HandleFunc("/uploadkey", keyHandler)
    http.HandleFunc("/upload", uploadHandler)
    http.HandleFunc("/uploadredirect", uploadRedirectHandler)
}

func serveError(c appengine.Context, w http.ResponseWriter, err os.Error) {
        w.WriteHeader(http.StatusInternalServerError)
        w.Header().Set("Content-Type", "text/plain")
        io.WriteString(w, "Internal Server Error")
        c.Logf("%v", err)
}

func keyHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	uploadURL, err := blobstore.UploadURL(c, "/upload")
	if err != nil {
			serveError(c, w, err)
			return
	}
	w.Header().Set("Content-Type", "text/html")
	if err != nil {
			c.Logf("%v", err)
	}
	//json.Marshal won't work with single values so this is wrongish
    fmt.Fprint(w, uploadURL)
}

uploadRedirectHandler(w http.ResponseWriter, r *http.Request){
	fmt.Fprint(w, "'true'")
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	blobs, _, err := blobstore.ParseUpload(r)
	if err != nil {
			serveError(c, w, err)
			return
	}
	blob := blobs["file"]
	/*if len(file) == 0 {
			c.Logf("no file uploaded")
			http.Redirect(w, r, "/", http.StatusFound)
			return
	}*/
	//TODO: figure out if this blobInfo object blob[0] is in datastore and queryable
	//so we can use it to list available files in the ui.
	http.Redirect(w, r, "/uploadredirect/?blobKey="+string(blob[0].BlobKey), http.StatusFound)
}

