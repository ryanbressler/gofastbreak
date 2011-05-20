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

// for testing: http://localhost:8081/transplantdata?filters=[{%22type%22:%22small%22,%22minscore%22:%2294%22},{%22type%22:%22other%22,%22minscore%22:%2294%22}]&chr=chr22&start=27593997&end=28426514&depth=2&radius=400000&file=TCGA-13-0890-10A-01W-0420-08&tqx=reqId%3A53

package fastbreakapp

import (
	"appengine"
	"appengine/memcache"
	"appengine/blobstore"
	"appengine/datastore"
    "fmt"
    "http"
    "json"
    "strings"
    "strconv"
    "os"
)


func init() {
    http.HandleFunc("/transplantdata", dataserviceHandler)
}

func parseInt(c appengine.Context, w http.ResponseWriter, input string) int {
	val,err := strconv.Atoi(input)
	if err != nil{
		serveError(c, w, err)
	}
	return val

}

type filter struct {
	Type string "type"
	Minscore string "minscore"
}
type contig struct {
	chr string
	start int
	end int
}

type edge struct {
	Chr1 string
	Pos1 int
	Chr2 string
	Pos2 int
	num_Reads int
	Score string
	Type string
	line string
}

func bisect_left(a []edge, x int, lo int, hi int) int{

	/*if lo < 0:{
		raise ValueError('lo must be non-negative')
	}*/
	if hi < 0{
		hi = len(a)
	}
	for lo < hi{
		mid := (lo+hi)/2
		if int(a[mid].Pos1) < x{
			lo = mid+1
		}else{
			hi = mid
		}
	}
	return lo
	}

func bisect_right(a []edge, x int, lo int, hi int)int{

	/*if lo < 0:
		raise ValueError('lo must be non-negative')*/
	if hi < 0{
		hi = len(a)
	}
	for lo < hi{
		mid := (lo+hi)/2
		if x < int(a[mid].Pos1){
			hi = mid
		}else{
			lo = mid+1
		}
	}
	return lo
	}


func filterEdges(c appengine.Context,filename string, chrm string, start int, end int, filters []filter) []edge {
	out:=make([]edge,0,2)
	
	
	indexname := fmt.Sprintf("%s.index.%s.json",filename,chrm)
	c.Logf("attempting to load %s from m cache",indexname)
	
	var indexjson []byte
	indexitem, err := memcache.Get(c, indexname)
	if  err == memcache.ErrCacheMiss {
		c.Logf("item not in the cache")
		//TODO: load brom blobstore
		q := datastore.NewQuery("fileNameToKey").Filter("Filename=",indexname)
		blobs := make([]fileNameToKey,0,100)
		if _, err := q.GetAll(c, &blobs); err != nil {
			c.Logf("%v", err)
			
		}
		if len(blobs) == 0 {
			return out
		}
		
		blobreader := blobstore.NewReader(c,blobs[0].BlobKey)
		
		  
		if _,readerr := blobreader.Read(indexjson); readerr!= nil && readerr != os.EOF {
			
			c.Logf("%v", readerr)
			//return
		}
		
		
		item := &memcache.Item{Key:   indexname,
			Value: indexjson,
			}
		// Add the item to the memcache, if the key does not already exist
		if err := memcache.Add(c, item); err == memcache.ErrNotStored {
			c.Logf("item with key %q already exists", item.Key)
		} else if err != nil {
			c.Logf("error adding item: %v", err)
		}

	} else if err != nil {
		c.Logf("error getting item: %v", err)
		indexjson = indexitem.Value
	}
	index := make([]edge,0,100)
	if err:=json.Unmarshal(indexjson,&index); err != nil {
		c.Logf("error parseingjson: %v", err)
	}
	/*index := memcache.get(indexname)
	if index is None:
		log("mcache loading failed, loading from blobstore")
		blob = BlobInfo.gql("where filename = '%s'"%(indexname)).get()
		if not blob is None:
			log("mcache loading failed, parseing from json")
			index = json.load(blob.open())
			log("adding to memcache")
			try:
				if not memcache.add(indexname, index):
					logging.error("Memcache set failed.")
			except ValueError:
				logging.info("Memcache value error.")
	
	if not index is None:
		leftbound = bisect_left(index,start,0,-1)
		rightbound = bisect_right(index,end,0,-1)                
		for edge in index[leftbound:rightbound]:
			#if edge < start:
			#	continue
			#if edge["Pos1"] > end:
			#	break
				
			includeme = False
			if filters != False:
				for filter in filters:
					if	edge["Type"]==filter["type"] and int(edge["Score"])>=int(filter["minscore"]) :
						includeme = True
						break
			else:
				includeme = True
			if includeme==True:
				out.append(edge)*/
	
	return out
	}

func dataserviceHandler(w http.ResponseWriter, r *http.Request) {
    c := appengine.NewContext(r)
    
    chrm := string(r.FormValue("chr"))	//the chromosone the start region is located on
	start := parseInt(c,w,r.FormValue("start")) //the start of the start region
	end := parseInt(c,w,r.FormValue("end"))	//the end of the start region
	searchdepth := parseInt(c,w,r.FormValue("depth"))	//the depth of transversals to follow
	searchradius := parseInt(c,w,r.FormValue("radius"))  //the size of leaves
	bdoutfile := string(r.FormValue("file"))  //the breakdancer output
	
	filters := make([]filter,0,2)
	if err:=json.Unmarshal([]byte(r.FormValue("filters")),&filters); err != nil {
		serveError(c,w,err)
	}
	
	outcals :=[]string{"edge_id", "source_chr", "target_chr", "source_pos", "target_pos", "num_reads","type","score"}
//	key := string(r.FormValue("key"))
	
	visited := map[string]bool{}
	contigs := [][]contig{[]contig{contig{chr:chrm,start:start,end:end}}}
	adjList := [][]string{}
	for depth:=0; depth<searchdepth; depth++{
		newcontigs:=make([]contig,0,3)
		for _,con := range contigs[depth]{
			for _,edge := range filterEdges(c,bdoutfile, con.chr,con.start,con.end,filters){
				if visited[edge.line]{
					continue
				}
				adjList=append(adjList,[]string{edge.line,edge.Chr1,edge.Chr2,fmt.Sprint(edge.Pos1),fmt.Sprint(edge.Pos2),fmt.Sprint(edge.num_Reads),edge.Type,edge.Score})
				visited[edge.line]=true
				addcontig := true
				chr2 := edge.Chr2
				s := edge.Pos2-searchradius
				e := edge.Pos2+searchradius
				for _,c := range newcontigs{			
					if (chr2 == c.chr && ( (s >= c.start && s <= c.end) || (e >= c.start && e <= c.end) || (s <= c.start && e >= c.end))){
						addcontig = false
						if (s < c.start){
							c.start = s
							}
						if (e > c.end){
							c.end = e
							}
						break
					}
				}
		
				if addcontig==true{
					newcontigs=append(newcontigs,contig{chr:chr2,start:s,end:e})
					}
			
			}
		}
		contigs=append(contigs,newcontigs)
	}
	
	reqId := 0
	responseHandler :="google.visualization.Query.setResponse"
	tqx :=string(r.FormValue("tqx")) //the google query
	for _,param := range strings.Split(tqx,";",-1){
		pair := strings.Split(param,":",-1)
		if pair[0] == "reqId"{
			reqId = parseInt(c,w,pair[1])

		}
		if pair[0] == "responseHandler"{
			responseHandler = string(pair[1])
		}
	}
    

    jsonout, err := getGoogleDataTableJson(outcals,adjList)
    if  err != nil {
    	serveError(c, w, err)
    }
    
    w.Header().Set("Content-Type", "text/html")
    fmt.Fprint(w, responseHandler+"({status:'ok',table:"+string(jsonout)+",reqId:'"+fmt.Sprint(reqId)+"'})")
}