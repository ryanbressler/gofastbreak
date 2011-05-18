package fastbreakapp

import (
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