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
   Foundation, Incon., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA

*/
/* code in this file generates a json serialized google datatable. See:

http://code.google.com/apis/chart/interactive/docs/dev/implementing_data_source.html#jsondatatable

It creates only the table elment of the response. transplatws is responsible for the rest.*/

package fastbreakapp

import (
	"os"
	"json"
)

type DataTable struct {
	Cols []dtColHead "cols"
	Rows []dtRow     "rows"
}

type dtVal struct {
	Val string "v"
}

type dtRow struct {
	ColVals []dtVal "c"
}

type dtColHead struct {
	Id   string "id"
	Type string "type"
}


func getGoogleDataTableJson(cols []string, rows [][]string) ([]byte, os.Error) {

	out := DataTable{Cols: make([]dtColHead, 0, len(cols)),
		Rows: make([]dtRow, 0, len(rows))}

	for _, col := range cols {
		out.Cols = append(out.Cols, dtColHead{Id: col, Type: "string"})
	}
	for _, row := range rows {
		rowout := make([]dtVal, 0, len(row))
		for _, val := range row {
			rowout = append(rowout, dtVal{Val: val})
		}
		out.Rows = append(out.Rows, dtRow{ColVals: rowout})
	}

	return json.Marshal(out)

}
