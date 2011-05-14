// 
// 
//  
//      Copyright (C) 2003-2010 Institute for Systems Biology
//                              Seattle, Washington, USA.
//  
//      This library is free software; you can redistribute it and/or
//      modify it under the terms of the GNU Lesser General Public
//      License as published by the Free Software Foundation; either
//      version 2.1 of the License, or (at your option) any later version.
//  
//      This library is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//      Lesser General Public License for more details.
//  
//      You should have received a copy of the GNU Lesser General Public
//      License along with this library; if not, write to the Free Software
//      Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA
// Namespace, implemented as a global variable.
if(!org) {
    var org = {};
    if(!org.systemsbiology)
        org.systemsbiology = {};
    if(!org.systemsbiology.visualization)
        org.systemsbiology.visualization = {};
}


org.systemsbiology.visualization.transplant = function(container) {
	this.containerElement = container;
	this.logbase = .5;//Math.log(10);
	this.svgNS = "http://www.w3.org/2000/svg";
	//this.history = [];
	this.textstyle = "font-size:12;font-family:'helvetica neue';";
	this.genelabelstyle = "font-size:8;font-family:'helvetica neue';";
	//this.colorlist = ["cornflowerblue","yellowgreen","darkorange","goldenrod","darkkhaki","mediumslateblue","darksalmon"]
	//create or preserve the global array used by swf visualizations to acces their js counterparts
	if(window.isbSWFvisualizations === undefined)
	{
		isbSWFvisualizations = [];
		isbSWFvisualizations["SWFcount"]=0;
	}
	else
	{
		isbSWFvisualizations["SWFcount"]++;
	}
	this.visindex = isbSWFvisualizations["SWFcount"];
	this.SWFid= "transplant"+this.visindex;
	isbSWFvisualizations[this.SWFid] = this;
}



org.systemsbiology.visualization.transplant.prototype.sortNum=function (a, b){ return (a-b); }

org.systemsbiology.visualization.transplant.prototype.drawPath=function(id, start,end,color,onclick,region,arc)//,width,color)
{
	arc = arc == undefined ? 0 : arc;
	var arcscale = this.arcscale;
	var root = start.x;
	var basey = start.y
	p = function(x)
	{
		var rv = basey+arcscale*arc*Math.sqrt((x-root)/arcscale);
		//log(" X " + x + " Y " + y + " rv " + rv);
		return rv;
	}
	
	var width = 3;
	var smooth = arc == 0? Math.round((end.x-start.x)/2) : Math.round((end.x-start.x)/100);
	
	var path = document.createElementNS(this.svgNS, "svg:path");
 	
 	var normalstyle ="fill:none;stroke:"+color+";"//+";stroke-width:"+width;
 	var mousestyle ="fill:none;stroke:"+color+";stroke-width:"+(width+1);
 	path.setAttributeNS( null, "id", id);
 	if(arc==0)
 	{
 		path.setAttributeNS( null, "d", "M "+start.x+" "+start.y+" C "+(start.x+smooth)+" "+start.y+" "+(end.x-smooth)+" "+end.y+" "+end.x+" "+end.y );
 	}
 	else
 	{
		var iby = 20;
		var xbreak = (end.x -start.x)/iby;
		var paths = "M "+start.x+" "+p(start.x) + " Q "+(start.x+1)+" "+p(start.x+1)+" "+( start.x+2)+" "+p(start.x+2);
		for(var i = 1; i <= iby; i++)
		{
			var x2 = start.x + i*xbreak;
			var x1 = start.x + (2*i-1)*.5*xbreak;
			paths += " Q " + x1 + " " + p(x1) + " "+ x2 + " " + p(x2);
		}
		path.setAttributeNS( null, "d", paths );
		}
 	path.setAttributeNS( null, "style",normalstyle );
 	path.setAttributeNS( null, "stroke-width",width);
 	path.setAttributeNS(null, "z-index",1);
 	if(onclick!==undefined)
 	{
 		path.setAttributeNS( null, "onclick", onclick);	
 	}
 	
 	var svg = this.svg;
 	var text = this.linktotext;
 	
 	
 	
 	if(region!==undefined)
 	{
		path.addEventListener("mouseover", function (evt) { evt.target.setAttributeNS( null, "style",mousestyle ); org.systemsbiology.visualization.transplant.updatetext(text,region);}, false);
 		path.addEventListener("mouseout", function (evt) { evt.target.setAttributeNS( null, "style",normalstyle ); org.systemsbiology.visualization.transplant.updatetext(text," "); }, false);

 	}
 	//this.svg.appendChild(path);
 	return path;
}

org.systemsbiology.visualization.transplant.prototype.label =function (pos,msg,anchor,onclick,mouseover)
{
	return this.fancylabel(pos,msg,anchor,0,this.textstyle,onclick,mouseover);


}

org.systemsbiology.visualization.transplant.prototype.line =function (s,e,style,onclick,mouseover)
{
	var line = document.createElementNS(this.svgNS, "svg:line")
    line.setAttributeNS(null, "x1", s.x);
    line.setAttributeNS(null, "y1", s.y);
    line.setAttributeNS(null, "x2", e.x);
    line.setAttributeNS(null, "y2", e.y);
    line.setAttributeNS(null, "style", style);
    line.setAttributeNS(null, "z-index",10);
    if(onclick!==undefined)
 	{
 		line.setAttributeNS( null, "onclick", onclick);	
 	}
 	
 	var svg = this.svg;
 	var text = this.linktotext;
 	
 	if(mouseover!==undefined)
 	{
		line.addEventListener("mouseover", function (evt) {  org.systemsbiology.visualization.transplant.updatetext(text,mouseover);}, false);
 		line.addEventListener("mouseout", function (evt) {  org.systemsbiology.visualization.transplant.updatetext(text," "); }, false);

 	}
 	
 	return line;
    //this.svg.appendChild(line);
}

org.systemsbiology.visualization.transplant.prototype.fancylabel =function (pos,msg,anchor,angle,style,onclick,mouseover)
{
	var data = document.createTextNode(msg);

    var text = document.createElementNS(this.svgNS, "svg:text");
    text.setAttributeNS(null, "x", pos.x);
    text.setAttributeNS(null, "y", pos.y-5);
    text.setAttributeNS(null, "fill", "black");
    text.setAttributeNS(null, "text-anchor", anchor);
    text.setAttributeNS(null, "rotate", angle);
    //text.setAttributeNS(null, "z-index", 10);
    text.setAttributeNS( null, "style", style);
	if(onclick!==undefined)
 	{
 		text.setAttributeNS( null, "onclick", onclick);	
 	}
 	if(mouseover!==undefined)
 	{
 		var svg = this.svg;
 		var motext = this.linktotext;
		text.addEventListener("mouseover", function (evt) { /*evt.target.setAttributeNS( null, "style",mousestyle ); */org.systemsbiology.visualization.transplant.updatetext(motext,mouseover);}, false);
 		text.addEventListener("mouseout", function (evt) { /*evt.target.setAttributeNS( null, "style",normalstyle ); */org.systemsbiology.visualization.transplant.updatetext(motext," "); }, false);

 	}
    text.appendChild(data);
    return text;
    //this.svg.appendChild(text);

}


org.systemsbiology.visualization.transplant.prototype.drawDecoration = function (cx,rx,cy,ry,rotation,label,onclickstring,mouseover)
{
	
	var ellipse = document.createElementNS(this.svgNS, "svg:ellipse")
 	var normalstyle ="fill:none;stroke:#888;stroke-width:1";
 	var mousestyle ="fill:none;stroke:#777;stroke-width:2";
 	ellipse.setAttributeNS( null, "id", label);
 	ellipse.setAttributeNS( null, "cx", cx);
 	ellipse.setAttributeNS( null, "cy", cy);
 	ellipse.setAttributeNS( null, "rx", rx);
 	ellipse.setAttributeNS( null, "ry",ry);
 	ellipse.setAttributeNS( null, "style",normalstyle );
 	ellipse.setAttributeNS( null, "transform","rotate("+rotation+" " + cx + " " + cy +")" );
 	//ellipse.setAttributeNS(null,"transform","translate(0 0) rotate(0 0 0) scale(0) ")
 	if(onclickstring!==undefined)
 	{
 		ellipse.setAttributeNS( null, "onclick", onclickstring);	
 	}
 	
 	var svg = this.svg;
 	var text = this.linktotext;
 	
 	if(mouseover!==undefined)
 	{
		ellipse.addEventListener("mouseover", function (evt) { evt.target.setAttributeNS( null, "style",mousestyle ); org.systemsbiology.visualization.transplant.updatetext(text,mouseover);}, false);
 		ellipse.addEventListener("mouseout", function (evt) { evt.target.setAttributeNS( null, "style",normalstyle ); org.systemsbiology.visualization.transplant.updatetext(text," "); }, false);

 	}
 	//this.svg.appendChild(ellipse);
 	return ellipse;

}


org.systemsbiology.visualization.transplant.prototype.labelDecoration = function (x,top,bottom,label,onclickstring,mouseover)
{

	var group = document.createElementNS(this.svgNS, "svg:g");
	group.appendChild(this.line({x:x,y:top},{x:x,y:bottom-5},"stroke:#d9d9d9;stroke-width:1",onclickstring,mouseover));
	group.appendChild(this.fancylabel({x:x,y:bottom+4},label,"middle",0,this.genelabelstyle,onclickstring,mouseover));
	return group;
}

org.systemsbiology.visualization.transplant.prototype.log = function(msg){}


//////////////////functions to be called on the flat edges during transversal
org.systemsbiology.visualization.transplant.prototype.drawChr = function(vis,depth,oriantation, root,stumpchr,stumpstart,stumpend,rowid,end,scale)
{
	vis.log("drawChr called with "+vis+depth+oriantation+ root+stumpchr+stumpstart+stumpend+rowid+end);
	rowid = (rowid=="") ? "root" : rowid;
	var onclickstring = "isbSWFvisualizations['"+vis.SWFid+"'].selected=\'"+rowid+"\';"+
            " google.visualization.events.trigger(isbSWFvisualizations['"+vis.SWFid+"'], 'select', {chr:\'"+
                stumpchr+"\',start:"+stumpstart+",end:"+stumpend+",gene:null,cancel_bubble:true});";
	var region = stumpchr+":"+stumpstart+"-"+stumpend;
	var arc = depth == 0 || vis.grided === true ? 0 : -1 * oriantation;
	return vis.drawPath(rowid,root,end,vis.colors[stumpchr],onclickstring,region,arc);
}

org.systemsbiology.visualization.transplant.prototype.decorateChr = function(vis,depth,oriantation, root,stumpchr,stumpstart,stumpend,rowid,end,scale)
{
	arc = depth ==0 ? 0 : -1*oriantation;
	
	//create closures/functions for parabola and its derivitive (in degrees)
	var arcscale = vis.arcscale;
	var origin = root.x;
	var basey = root.y;
	var p = function(x) { return basey; }
	var pprime = function(x) { return 0; }
	
	
	if(vis.grided===false)
	{
		p = function(x)
		{
			var rv = x-origin >0 ? basey+arcscale*arc*Math.sqrt((x-origin)/arcscale) : basey;
			//log("arcscale "+ arcscale + " arc +"+ arc+" origin " + origin+" X " + x + " Y " + basey + " rv " + rv);
			return rv;
		}
		
		pprime = function(x)
		{
			if (arc == 0)
				return 0;
			var rv=90;
			if(x > origin)
			{
				rv = (arcscale*arc)/(Math.sqrt(arcscale*(x-origin))*2);
				rv = Math.atan(rv);
				rv = Math.round(180 *rv/Math.PI);
			}
			return rv;
			//return x > origin ? Math.round(180 * Math.atan((arcscale*arc*((x-origin)/arcscale)^(-.5))/2)/Math.PI) : 90;
		}
	}
	
	vis.log("decorateChr called with "+vis+depth+oriantation+ root+stumpchr+stumpstart+stumpend+rowid+end+scale);
	var labeloffset = 1; 
	
	var group = document.createElementNS(vis.svgNS, "svg:g");
	
	
	for (var i in vis.chrs[stumpchr].decorations)
	{
		var top = vis.origin.y-2;
		var bottom = vis.origin.y;
		
		
		var dec = vis.chrs[stumpchr].decorations[i];
		vis.log("drawing decoration " + dec.label);

		if((dec.start<stumpend && dec.start > stumpstart) || (dec.end<stumpend && dec.end > stumpstart) || (dec.end>stumpend && dec.start < stumpstart))
		{
			var sx=scale(dec.start-1);//,y:root.y};
			
			var ex=scale(dec.end+1);//,y:root.y};
			//s.y=p(root.y,(s.x+e.x)/2);
			//e.y=s.y;
			
			var cy = p((sx+ex)/2);
			
			//var c = (s.x+e.x)/2;
			var l=depth==0?dec.label:"";

			var oc = "isbSWFvisualizations['"+vis.SWFid+"'].internalrecenteronlocation('"+stumpchr+"',"+(dec.start-vis.radius)+","+(dec.end+vis.radius)+",\'" + dec.label+"\');";
			
			var mo =dec.mouseover;
			var rx = (Math.abs((ex-sx)/2));
			var cx = (ex+sx)/2;
			rx = rx > 2? rx : 2;
			var r = pprime(cx);

			if(cx >= origin && cx <= end.x )
				group.appendChild(vis.drawDecoration(cx,rx,cy,3,r,l,oc,mo));
			if(depth==0)
			{
				
				
				//vis.log("labeloffset is " + labeloffset);
				var offsetb= vis.origin.y + labeloffset*vis.padby;
				//var offsetb= vis.origin.y + 4*vis.padby;
				group.appendChild(vis.labelDecoration(cx,top,offsetb,dec.label,oc,mo));
				labeloffset++;
				labeloffset = (labeloffset==6?1:labeloffset);
				
				
			}
		}
		
		
	}
	//if(arc == 0 && depth != 0)
	//	group.setAttributeNS( null, "transform","rotate(-90 " + root.x + " " + root.y +")" );
	return group;
	//vis.svg.appendChild(group);
}
/////////////////functions to be called on the curved edges during transversal

org.systemsbiology.visualization.transplant.prototype.drawCurve = function(vis,depth,oriantation, root,stumpchr,stumpstart,stumpend,rowid,sproutpoint,branchx,y)
{
	//vis.log("drawCurve called with "+vis+depth+oriantation+ root+stumpchr+stumpstart+stumpend+rowid+sproutpoint+branchx+y);
	var curve = vis.drawPath("",sproutpoint,{x:branchx,y:y},vis.colors[stumpchr]);
	var width = 1;
	if(vis.widthfield && rowid)
	{
		width = Math.log(parseInt(vis.data.getValue(rowid,vis.widthfield)))/vis.logbase;
		curve.setAttributeNS(null, 'stroke-width', width);
		
		//this.log ("width is "+ width);
	}
	
	var svg = vis.svg;
 	var text = vis.linktotext;
 	var mo = "Break from " + vis.data.getValue(rowid,1)+", "+ vis.data.getValue(rowid,3)+ " to "  + vis.data.getValue(rowid,2) + ", " + vis.data.getValue(rowid,4) + " Score: "+vis.data.getValue(rowid,7) +" Reads: "+ vis.data.getValue(rowid,5);
 	
 	
	curve.addEventListener("mouseover", function (evt) { evt.target.setAttributeNS(null, 'stroke-width', 4); org.systemsbiology.visualization.transplant.updatetext(text,mo);}, false);
 	curve.addEventListener("mouseout", function (evt) { evt.target.setAttributeNS(null, 'stroke-width', width); org.systemsbiology.visualization.transplant.updatetext(text," "); }, false);

 	
	curve.setAttributeNS(null, 'stroke-opacity', .4);
	curve.setAttributeNS(null, 'stroke-linecap', 'round');
	return curve;
}

org.systemsbiology.visualization.transplant.prototype.decorateCurve = function(vis,depth,oriantation, root,stumpchr,stumpstart,stumpend,rowid,sproutpoint,branchx,y)
{
	return document.createElementNS(vis.svgNS, "svg:g");
	//vis.log("decorateCurve called with "+vis+depth+oriantation+root+stumpchr+stumpstart+stumpend+rowid+sproutpoint+branchx+y);
}

////////////////function to tranverse branche and sub branches  through recursion calling flatF and curveF to perform variouse recurion 
org.systemsbiology.visualization.transplant.prototype.traverse = function(depth,oriantation, root,stumpchr,stumpstart,stumpend,rowid,flatF,curveF)
{
	this.log("depth "+depth+" drawing branch:"+ [depth, root.x,root.y,stumpchr,stumpstart,stumpend,this.xscale].join(", "));
	var group = document.createElementNS(this.svgNS, "svg:g");
	if(stumpstart==stumpend)
		return group;
	//var group = document.createElementNS(this.svgNS, "svg:g");
	//draw root line in vis coordinates
	var scalefactor = this.xscale;//*Math.pow(parseInt(this.nestfactor),parseInt(depth));
	var scale = function(x){
		//alert("scale " + [root.x,this.xscale,x,stumpstart].join(", "));
		return Math.round(root.x+scalefactor*(x-stumpstart));
	}
	var end={x:scale(stumpend),y:root.y};
	if(oriantation == -1)
	{
		 scale = function(x){
		//alert("scale " + [root.x,this.xscale,x,stumpstart].join(", "));
			return Math.round(root.x+scalefactor*(stumpend-x));
		}
	}
	this.log("calling flatF");
	group.appendChild(flatF(this,depth,oriantation,root,stumpchr,stumpstart,stumpend,rowid,end,scale));
	if(depth>=this.depth)
	{
		this.log("Branch of depth excedes depth limit; pruned.");
		return group;
	}
	depth++;
	var offsetfactor = ((this.origin.y-this.padby))/(Math.pow(this.chrn+4,depth));
	//grow branches from sprouts
	if(!this.chrs[stumpchr])
		return group;
	for ( var sprout in this.chrs[stumpchr].branches )
	{
		sprout = parseInt(sprout);
		if(sprout > stumpstart && sprout < stumpend)
		{
			if(depth>1 && stumpchr == this.stumpchr || (oriantation != 0 && (sprout<this.stumpstart || sprout > this.stumpend)) )// && sprout > this.stumpstart && sprout < this.stumpend)
			{
				continue;
			}
			
			for(var row = 0; row < this.chrs[stumpchr].branches[sprout].length; row++)
			{
				
				row=parseInt(this.chrs[stumpchr].branches[sprout][row])
				if(row in this.visited )
				{
					continue;
				}
				
				//this.log(scale);
				var chr2=this.data.getValue(row,2);
				var pos2=parseInt(this.data.getValue(row,4));
				var offsetor = oriantation == 0 ? 1 : oriantation;
				var y=root.y - offsetor*(this.offsets[chr2]+2)*offsetfactor;
				
				this.log("depth "+depth+" sprouting "+[stumpchr,sprout,"to",chr2,pos2,"via row",row].join(" "));
				var sproutx=scale(sprout);
				var branchx=sproutx+this.sproutshift;
				var sproutpoint = {x:sproutx, y:root.y};
				var contig = this.contigsByRow[row];
				var lastin = contig.inpoints[0].pos;
							
				var  firstin= contig.inpoints[contig.inpoints.length-1].pos;
				var scaledlength = Math.round(scalefactor*Math.abs(firstin - lastin));
				
				var by = y;
				var ty = y-scaledlength;
				this.log("by is " + by + " ty is " + ty);
				
				/*var drawme = false;
				if(contig.drawnAt === undefined)
				{
					contig.drawnAt={start:{x:branchx,y:by}, end:{x:branchx,y:ty}};
					contig.drawnNTimes=0;
					drawme = true;
				}
				
				if(contig.drawnNTimes<=1)
				{
					contig.drawnNTimes++;
					drawme = true;
				}*/
				if(contig.drawnAt === undefined)
				{
					contig.drawnAt = {};
					contig.drawnNTimes=0;
				}	
				
				if(!contig.drawnAt.hasOwnProperty(depth) && contig.drawnNTimes<=1)
				{
					this.log("continuing not drawn at " + depth);
					contig.drawnNTimes++;
					contig.drawnAt[depth]={start:{x:branchx,y:by}, end:{x:branchx,y:ty}};

					var branchgroup = document.createElementNS(this.svgNS, "svg:g");
					var top = this.traverse(depth,1,{x:branchx,y:ty},chr2,lastin,contig.end,row,flatF,curveF);
					if (top)
					{
						if(this.grided)
							top.setAttributeNS( null, "transform","rotate(-90 " + branchx + " " + ty +")" );
						
						branchgroup.appendChild(top);
					}
					
					var mid = this.traverse(depth,0,{x:branchx,y:by},chr2,firstin,lastin,row,flatF,curveF);
					if ( mid )
					{
						mid.setAttributeNS( null, "transform","rotate(-90 " + branchx + " " + by +")" );
						branchgroup.appendChild(mid);
					}							
					var bot = this.traverse(depth,-1,{x:branchx,y:by},chr2,contig.start,firstin,row,flatF,curveF);
					if ( bot )
					{
						if(this.grided)
							bot.setAttributeNS( null, "transform","rotate(90 " + branchx + " " + by +")" );
						else
							bot.setAttributeNS( null, "transform","rotate(-180 " + branchx + " " + by +") translate(" + branchx + " " + by +") scale(1, -1) translate(-" + branchx + " -" + by +")" );
						
						branchgroup.appendChild(bot);
					}

					branchgroup.setAttributeNS( null, "transform","translate("+branchx+" "+by+") scale("+ Math.pow(this.nestfactor, depth) +") translate(-"+branchx+" -"+by+")");
					//branchgroup.setAttributeNS( null, "transform","translate("+branchx+" "+by+") scale("+ this.nestfactor +") translate(-"+branchx+" -"+by+")");
					group.appendChild(branchgroup);
				}
				else
				{
	
				}
				
				if(contig.drawnAt.hasOwnProperty(depth))
				{
				
					this.visited[row]=true;
					this.log("curve f at depth" + depth);
					var tox = contig.drawnAt[depth].start.x;
					var toy = lastin != firstin ? contig.drawnAt[depth].start.y - Math.pow(this.nestfactor, parseInt(depth)) * scaledlength * (pos2 - firstin) / (lastin-firstin) : contig.drawnAt[depth].start.y;
					this.log("calling curveF");
					group.appendChild(curveF(this,depth,oriantation, root,stumpchr,stumpstart,stumpend,row,sproutpoint,tox,toy));
					//group.appendChild(curveF(this,depth,oriantation, root,stumpchr,stumpstart,stumpend,row,sproutpoint,sproutpoint.x,sproutpoint.y));
				}
			}
		}
	}
	return group;

}


org.systemsbiology.visualization.transplant.prototype.draw = function(data, options) {
	//paramaters
	//TODO: handle bad params
	this.data = data;
	this.options = options;
	
	this.dataservice = options.dataservice;
	
	this.stumpchr = options.chr;
	this.stumpstart = parseInt(options.start);
	this.stumpend = parseInt(options.end);
	this.radius = parseInt(options.radius);
	this.depth = parseInt(options.depth) || 3;
	this.padby=10;
	this.xscale=1;
	this.width = parseInt(options.width) || 550;
	this.height = parseInt(options.height) || 350;
	this.containerElement.style.width=this.width;
	this.containerElement.style.height=this.height;
	//this.chrshift=10;
	this.bottompad = 5*this.padby;
	this.origin = {x:this.padby+10,y:this.height-this.bottompad};
	this.colors = options.colors || org.systemsbiology.visualization.transplant.chrmcolors.human;
	this.geneds = options.geneds;
	this.drawdone = false;
	this.genesloading = 0; 
	this.arcscale = 4; 
	this.filters = options.filters || null;//options.minscore || 99;
	this.grided = options.grided || false;
	this.nestfactor = options.nestfactor || .6;
	this.widthfield = options.widthfield ? parseInt(options.widthfield) : false;
	this.trackds = options.trackds;
	this.sample_id = options.sample_id;
    this.refgenomeUri = options.refgenomeUri;
    this.sproutshift=0;
    this.allowSelfStumpAdjust=true;
    this.trackScale = 5;

	var chrClause = function(c, s, e)
	{ 
		var isin = function(n,s,e)
		{
			return "("+n+" < "+e + " and " + n + " > " + s + " )";
		}
		return "(chromosome ='"+c+"' and ("+isin("start",s,e)+" or "+isin("end",s,e)+"))"
	}
	
	this.chrClauses = [chrClause(this.stumpchr,this.stumpstart,this.stumpend)];
    this.chromosomeRangeUris = [];
    this.chromosomeRangeUris.push(this.refgenomeUri + "/" + this.stumpchr + "/" + this.stumpstart + "/" + this.stumpend);

	
	
	//this.incols=["edge_id" "source_chr", "target_chr", "source_pos", "target_pos", "size", "num_reads","type"]
	
	
	
	//set up svg
	//TODO: check to see if this name needs to be unique
	this.svg = document.createElementNS(this.svgNS, "svg:svg");
	 

	
	//index datatable rows by chr and by position
	this.chrs = {};
	this.contigsByRow={};
	this.visited = {};
	this.chrs[this.stumpchr]={};
	this.chrs[this.stumpchr].branches={};
	this.chrs[this.stumpchr].contigs=[{start:this.stumpstart,end:this.stumpend,inpoints:[]}]
	this.chrs[this.stumpchr ].shift=0;
	this.log("indexing rows");
	for (var row = 0; row < data.getNumberOfRows(); row++) {
		this.log("indexing row "+row);
		var includeme = true;
		//handles on server now
		/*if(this.filters == null || this.filters.length==0)
		{
			includeme = true;
		}
		else
		{
			for(var fi = 0; fi<this.filters.length; fi++)
			{
				//log("row: " + row+ " "+data.getValue(row,1) + " "+data.getValue(row,2)+" "+data.getValue(row,7)+" "+data.getValue(row,8)+ " " + " filter: " + fi + " " + this.filters[fi].type + " " +this.filters[fi].minscore)
				if(data.getValue(row,7)==this.filters[fi].type && parseInt(data.getValue(row,8))>=this.filters[fi].minscore )
				{
					this.log("marking as included")
					includeme = true;
				}
			}
		}*/
		if(includeme==true)
		{
			this.log("including")
			var chr1=data.getValue(row,1);
			var chr2=data.getValue(row,2);
			var pos1=parseInt(data.getValue(row,3));
			var pos2=parseInt(data.getValue(row,4));
			//this.chrClauses.push(chrClause(chr2,pos2-this.radius,pos2+this.radius));
			this.log("Checking to see structre exsists")
			//this.chrs[chr1]=this.chrs[chr1]||{branches:{},shift:0};
			if(!this.chrs[chr1])
			{
				this.chrs[chr1]={};
				this.chrs[chr1].branches={};
				this.chrs[chr1].contigs=[];
				this.chrs[chr1].shift=0;
			}
			//this.chrs[chr2]=this.chrs[chr2]||{branches:{},shift:0};
			if(!this.chrs[chr2])
			{
				this.chrs[chr2]={};
				this.chrs[chr2].branches={};
				this.chrs[chr2].contigs=[];
				this.chrs[chr2].shift=0;
			}
			if(!this.chrs[chr1].branches[pos1])//=this.chrs[chr1].branches[pos1]||[];
				this.chrs[chr1].branches[pos1] = [];
			
			var addcontig = true;
			var s = pos2 - this.radius;
			var e = pos2 + this.radius;
			for(var i = 0; i < this.chrs[chr2].contigs.length; i++)
			{
				var c = this.chrs[chr2].contigs[i];
				
				if(s >= c.start && s <= c.end || e >= c.start && e <= c.end || s <= c.start && e >= c.end)
				{
					addcontig = false;
					if (s < c.start)
						c.start = s;
					if (e > c.end)
						c.end = e;
					c.inpoints.push({pos:pos2,row:row})
					this.contigsByRow[row]=c;
					break;
				}
			
			}
			if (addcontig)
			{
				var c = {start:s,end:e,inpoints:[{pos:pos2,row:row}]};
				this.chrs[chr2].contigs.push(c);
				this.contigsByRow[row]=c;
			}
			
			//this.chrs[chr1].branchkeys.push(pos1);
			var addrow = true;
			
			this.log("Checking to see if allready indexed")
			for (var oldrow = 0; oldrow < this.chrs[chr1].branches[pos1].length; oldrow++)
			{
				this.log("comparing with oldrow "+ oldrow)
				oldrow = parseInt(oldrow);
				if(chr2==data.getValue(oldrow,2) && pos2==parseInt(data.getValue(oldrow,4)))
				{
					addrow=false;
				}
			}
			if(addrow)
			{
				this.chrs[chr1].branches[pos1].push(row);
			}
			this.log("checking max min")
		}
	}
	
	var i = 0;
	var colori=0;
	this.offsets={}
	this.log("indexing chrs pas 1");
	for ( var chr in this.chrs)
	{
		for (var ci = 0; ci < this.chrs[chr].contigs.length; ci ++)
		{
			var c = this.chrs[chr].contigs[ci];
			this.chrs[chr].contigs[ci].inpoints = this.chrs[chr].contigs[ci].inpoints.sort(function(a,b){return b.pos-a.pos;});
			this.chrClauses.push(chrClause(chr,c.start,c.end));
            this.chromosomeRangeUris.push(this.refgenomeUri + "/" + chr + "/" + c.start + "/" + c.end);
		}
		this.offsets[chr]=i;
		i++;
		
	}
	this.chrn = i;
	
    this.handleChromosomeRangeItems();
    if(this.allowSelfStumpAdjust)
    {
		this.stumpend = this.chrs[this.stumpchr].contigs[0].end;
		this.stumpstart = this.chrs[this.stumpchr].contigs[0].start;
	}
	var max = this.stumpend+.5*(this.stumpend-this.stumpstart);
	var min = this.stumpstart;
	
	this.log("calculating scale factor using: " + [this.width, this.padby, max, min].join(" "));
	this.xscale = (this.width-2*this.padby)/(max-min) || 1;

	this.linktotext = this.addtextbox("regiontext",10,20," ");
	this.svg.appendChild(this.linktotext);
	this.loadingtext = this.addtextbox("loadingtext",160,75," ");
	this.svg.appendChild(this.loadingtext);
	
	//draw tree by recusivelly drawing branches
	//(depth, root,stumpchr,stumpstart,stumpend,rowid,flatF,curveF)
	this.svg.appendChild(this.traverse(0,1,this.origin,this.stumpchr,this.stumpstart,this.stumpend,"",this.drawChr,this.drawCurve));
	
	this.containerElement.innerHTML="";
	this.containerElement.appendChild(this.svg);
	this.drawdone = true;
	this.showloadinggenes();
	for ( var c in this.contigsByRow)
	{
		delete this.contigsByRow[c].drawnAt;
	}
	this.decorateTree();
	if (this.trackds && this.sample_id)
		this.loadTrackData();
	
}

org.systemsbiology.visualization.transplant.prototype.loadTrackData = function()
{
	
	//var querystring = 'select * where sample_id = \''+this.sample_id+'\' and chr = \''+this.stumpchr+'\' and start >= '+this.stumpstart+' and start < '+this.stumpend+ " order by start asc";
	var querystring = 'select * where sample_id = \''+this.sample_id+'\' and chr = \''+this.stumpchr+'\' and start > '+this.stumpstart+' and start < '+this.stumpend+ ' order by start asc';

	this.log("loading: " + querystring +" from " + this.trackds +"/query");
	var query = new google.visualization.Query(this.trackds+"/query");
	query.setQuery(querystring);
	
	// create a closure so the function handeler is executed in the proper context
	var vis = this;
	query.send(function (response) { vis.drawTrackData(response); });
}

org.systemsbiology.visualization.transplant.prototype.drawTrackData = function(response)
{
	this.log("track data recieved by " + this.SWFid);
	if (response.isError()) {
    	this.log('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    	this.showerror("Error loading gene data.");
    	return;
  	}
  	var data = response.getDataTable();
  	
  	for (var row = 0; row < data.getNumberOfRows(); row++) 
  	{
  		var value = data.getValue(row,4);
  		value = value < 1 ? 0 : Math.log(value);
  		var height = this.trackScale * value;
		var x1 = this.padby + this.xscale*(data.getValue(row,2) -this.stumpstart);
		var y1 = this.origin.y;
		var distance = this.xscale*data.getValue(row,3);
		var rect = document.createElementNS(this.svgNS, "svg:rect");
		
		rect.setAttributeNS(null, "x", x1);
		rect.setAttributeNS(null, "y", y1);
		rect.setAttributeNS(null, "width", distance);
		rect.setAttributeNS(null, "height", height);
		rect.setAttributeNS(null, "fill", this.colors[this.stumpchr]);
		rect.setAttributeNS(null, 'fill-opacity', .3);
		this.svg.appendChild(rect);
  	
  	}
  	
}

org.systemsbiology.visualization.transplant.prototype.handleGeneResponse = function(response)
{
	this.log("gene data recieved by " + this.SWFid);
	if (response.isError()) {
    	this.log('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    	this.showerror("Error loading gene data.");
    	return;
  	}
  	var data = response.getDataTable();
  	
  	
  	for (var row = 0; row < data.getNumberOfRows(); row++) {
		//gene_symbol, chromosome, start, end
		var n = data.getValue(row,0);
		var chr = data.getValue(row,1);
		var s = data.getValue(row,2);
		var e = data.getValue(row,3);
		
  		if(!this.chrs[chr])
		{
			this.chrs[chr]={};
		}
		if(!this.chrs[chr]["decorations"])
		{
			this.chrs[chr]["decorations"]={};
		}
		this.log("adding dec "+ chr + " " + s + " " + e + " " + n);
		this.chrs[chr].decorations[n]={label:n,start:s,end:e,mouseover:""+n+", "+chr+":"+s+"-"+e};
  	
  	}

	this.genesloading--;
	this.decorateTree();


}

org.systemsbiology.visualization.transplant.prototype.handleChromosomeRangeItems = function()
{
    if (!this.refgenomeUri) {
        return;
    }

    var me = this;

    this.genesloading = this.chromosomeRangeUris.length;
  	for (var i = 0; i < this.chromosomeRangeUris.length; i++) {
        var chromUri = this.chromosomeRangeUris[i];

//        new Ajax.Request(chromUri + "/genes", {
//            method: "get",
//            onSuccess: function(o) {
          geneRequestPool.request(chromUri, function(o){
                var json = o.responseJSON;
                if (json && json.items) {
                    for (var it = 0; it < json.items.length; it++) {
                        var geneObj = json.items[it];
                        var name = geneObj.label;
                        var chromosome = geneObj.chromosome;
                        geneObj.mouseover = ""+name+", "+chromosome+":"+geneObj.start+"-"+geneObj.end;

                        if(!me.chrs[chromosome]) {
                            me.chrs[chromosome]={};
                        }
                        if(!me.chrs[chromosome]["decorations"]) {
                            me.chrs[chromosome]["decorations"]={};
                        }

                        me.chrs[chromosome].decorations[name]=geneObj;
                    }
                }
                me.genesloading--;
                me.decorateTree();
            })
//            onComplete: function(o) {
//                me.genesloading--;
//                me.decorateTree();
//            }
//        });
    }
};

org.systemsbiology.visualization.transplant.prototype.decorateTree = function()
{
	this.log("decorateTree called with geneslaoded="+this.genesloaded+" and drawdone="+this.drawdone);
	if(this.genesloading != 0 || this.drawdone == false )
		return;
		
	this.log("decorating tree");
	this.visited=[];
	this.svg.appendChild(this.traverse(0,1,this.origin,this.stumpchr,this.stumpstart,this.stumpend,"",this.decorateChr,this.decorateCurve));
	
	this.hideloading();
}

org.systemsbiology.visualization.transplant.prototype.addtextbox = function(id,x,y,text)
{
	var data = document.createTextNode(text);
	var text = document.createElementNS(this.svgNS, "svg:text");
	text.setAttributeNS( null, "id", id);
	text.setAttributeNS(null, "x", x);
	text.setAttributeNS(null, "y", y);
	text.setAttributeNS(null, "fill", "black");
	text.setAttributeNS( null, "style",this.textstyle);
	text.appendChild(data);
	//this.svg.appendChild(text);
	return text;
}

org.systemsbiology.visualization.transplant.prototype.getSelection = function()
{
	return [this.selected];
}

org.systemsbiology.visualization.transplant.prototype.back = function ()
{
	if (! this.history.length > 0)
		return;
	var params= this.history.pop();
	this.doquery(params.chr,params.start,params.end);
		
}

org.systemsbiology.visualization.transplant.prototype.recenteronrow = function (row)
{
	
	this.log(this.SWFid+" recenter propted row : " + row);
	//row = typeof (row) == String ? parseInt(row) : row;
	var chr = this.data.getValue(parseInt(row),2);
	this.log("chr : " + chr);
	var center = parseInt(this.data.getValue(parseInt(row),4));
	this.log("center : " + center);
	var start = (center-this.radius);
	var end = (center+this.radius);
	
	// load new data
	//this.history.push({chr:this.options.chr,start:this.options.start,end:this.options.end})
	this.doquery(chr,start,end);
	return {chr:chr,start:start,end:end};
	
	
}

org.systemsbiology.visualization.transplant.prototype.internalrecenteronlocation = function (chr,start,end,gene)
{
	

	google.visualization.events.trigger(this, 'recenter', {chr:chr,start:start,end:end,gene:gene})
	this.recenteronlocation(chr,start,end);

}

org.systemsbiology.visualization.transplant.prototype.recenteronlocation = function (chr,start,end)
{
	
	// load new data
	// this.history.push({chr:this.options.chr,start:this.options.start,end:this.options.end})
	
	this.doquery(chr,start,end);

}



org.systemsbiology.visualization.transplant.prototype.doquery = function (chr,start,end)
{
	this.showloading();
	var querystring = this.dataservice+'&chr='+chr+'&start='+start+'&end='+end+'&depth='+this.depth+'&radius='+this.radius;
	this.log("loading: " + querystring);
	var query = new google.visualization.Query(querystring);
	
	// create a closure so the function handeler is executed in the proper context
	var vis = this;
	query.send(function (response) { vis.doredraw(response, chr, start, end); });
}



org.systemsbiology.visualization.transplant.prototype.showloading = function()
{
	org.systemsbiology.visualization.transplant.updatetext(this.loadingtext, "Updating Tree...");
}

org.systemsbiology.visualization.transplant.prototype.showloadinggenes = function()
{
	org.systemsbiology.visualization.transplant.updatetext(this.loadingtext, "Loading Genes...");
}

org.systemsbiology.visualization.transplant.prototype.showerror = function(error)
{
	org.systemsbiology.visualization.transplant.updatetext(this.loadingtext, error);
}

org.systemsbiology.visualization.transplant.prototype.hideloading = function()
{
	org.systemsbiology.visualization.transplant.updatetext(this.loadingtext, "");
}

org.systemsbiology.visualization.transplant.prototype.doredraw = function(response, chr, start, end)
{
	this.log("recenter response recieved by " + this.SWFid);
	if (response.isError()) {
    	this.log('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    	this.showerror("Error updating tree data.");
    	return;
  	}
  	var mydata = response.getDataTable();
  	
  	//brute force the whole redraw
  	
  	this.options.chr = chr;
	this.options.start = start;
	this.options.end = end;
	this.hideloading();
  	this.draw(mydata, this.options);
  	
  	//TODO: clear unneeded graphics
  	
  	//TODO: animate transition 
	
	//TODO: redraw new sections
	
	
	
	
}

//statics used for drawing visualization legends on the page and response handlers
org.systemsbiology.visualization.transplant.updatetext = function (element,newtext)
{
	element.removeChild(element.firstChild); 
	element.appendChild(document.createTextNode(newtext));
}

org.systemsbiology.visualization.transplant.colorkey = function (colors, div)
{
	svgNS = "http://www.w3.org/2000/svg";
	var svg = document.createElementNS(svgNS, "svg:svg");
	
	x = 0;
	liney = 18;
	texty = 14;
	offset = 40;
	smooth = 5;
	div.style.width=1000;
	div.style.height=20;
	for ( var chr in colors)	
	{
		
		
		var path = document.createElementNS(svgNS, "svg:path")
		
		path.setAttributeNS( null, "d", "M "+x+" "+liney+" C "+(x+smooth)+" "+liney+" "+(x+offset-smooth)+" "+liney+" "+(x+offset)+" "+liney );
		path.setAttributeNS( null, "style", "fill:none;stroke:"+colors[chr]+";stroke-width:4");	
		svg.appendChild(path);
		var data = document.createTextNode(chr);	
		var text = document.createElementNS(svgNS, "svg:text");
		text.setAttributeNS(null, "x", x+4);
		text.setAttributeNS(null, "y", texty);
		text.setAttributeNS(null, "fill", "black");
		text.setAttributeNS( null, "style", "font-size:12;font-family:'helvetica neue';");
		text.appendChild(data);
		svg.appendChild(text);
		x+=offset;
	}
	
	div.innerHTML="";
	div.appendChild(svg);
}

org.systemsbiology.visualization.transplant.chrmcolors={
	human:{
		chr1:"cornflowerblue",
		chr2:"yellowgreen",
		chr3:"blue",
		chr4:"lime",
		chr5:"blueviolet",
		chr6:"aqua",
		chr7:"green",
		chr8:"greenyellow",
		chr9:"indigo",
		chr10:"lawngreen",
		chr11:"brown",
		chr12:"cadetblue",
		chr13:"deeppink",
		chr14:"darkorange",
		chr15:"dodgerblue",
		chr16:"chocolate",
		chr17:"coral",
		chr18:"orangered",
		chr19:"crimson",
		chr20:"cyan",
		chr21:"darkblue",
		chr22:"darkgoldenrod",
		chrX:"darkgreen",
		chrY:"darkmagenta",
		chrM:"darkolivegreen"
	}
}

var geneRequestPool = {};

geneRequestPool.requestMap = {};
geneRequestPool.request = function(uri,callback) {
    if (geneRequestPool.requestMap[uri] != undefined) {
        callback(geneRequestPool.requestMap[uri]);
    }
    else{
        new Ajax.Request(uri + "/genes", {
            method: "get",
            onSuccess: function(o) {
                geneRequestPool.requestMap[uri] = o;
                callback(o);
            }

        })
    }
};
