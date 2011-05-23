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
This is a simple utilit file to list the files that have been uploaded into blobstore.
*/

package fastbreakapp

import (
	"appengine"
	"appengine/datastore"
	"fmt"
	"http"
)

func init() {
	http.HandleFunc("/list", listHandler)
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	q := datastore.NewQuery("fileNameToKey")
	blobs := make([]fileNameToKey, 0, 100)
	if _, err := q.GetAll(c, &blobs); err != nil {
		c.Logf("%v", err)
		fmt.Fprint(w, err.String())
		//http.Error(w, err.String(), http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "N blobs:", len(blobs), "<br/>")
	w.Header().Set("Content-Type", "text/html")
	for i := 0; i < len(blobs); i++ {
		fmt.Fprint(w, blobs[i].Filename, "<br/>")
	}
}
