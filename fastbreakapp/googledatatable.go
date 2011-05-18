package fastbreakapp

import (
    "os"
    "json"
)

type DataTable struct {
    Cols	[]dtColHead "cols"
    Rows	[]dtRow "rows"
}

type dtVal struct {
    Val	string "v"
}

type dtRow struct {
    ColVals	[]dtVal "c"
}

type dtColHead struct {
    Id string "id"
    Type string "type"
}


func getGoogleDataTableJson(cols []string,rows [][]string) ([]byte, os.Error){
	
	out := DataTable{Cols: make([]dtColHead,0,len(cols)),
							Rows: make([]dtRow,0,len(rows))}
	
	for _,col := range cols{
		out.Cols=append(out.Cols,dtColHead{Id:col,Type:"string"})
		}
	for _,row := range rows{
		rowout := make([]dtVal,0,len(row))
		for _,val := range row{
			rowout=append(rowout,dtVal{Val: val})
			}
		out.Rows=append(out.Rows,dtRow{ColVals:rowout})
	}

	
	return json.Marshal(out)
	

	}