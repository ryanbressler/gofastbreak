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
    "fmt"
    "http"
    "os"
    "json"
)

type googleDataTable struct {
    cols	[]map[string]string
    rows	[]map[string][]map[string]string
}

//there must be a better way to do this
func getGoogleDataTableJson(cols []string,rows [][]string) ([]byte, os.Error){
	out := googleDataTable{cols: make([]map[string]string,len(cols)),
							rows: make([]map[string][]map[string]string,len(rows))}
	
	///all these inner layers should be strucs to make this simpler/faster
	for _,col := range cols{
		out.cols=append(out.cols,map[string]string{"id":col,"type":"string"})
		}
	for _,row := range rows{
		rowout := make([]map[string]string,len(row))
		for _,val := range row{
			rowout=append(rowout,map[string]string{"v":val})
			}
		out.rows=append(out.rows,map[string][]map[string]string{"c":rowout})
	}
	
	
	return json.Marshal(out)
	

	}

func init() {
    http.HandleFunc("/transplantdata", dataserviceHandler)
}

func dataserviceHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello, world!")
}