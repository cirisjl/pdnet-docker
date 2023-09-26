// testing
//Open left menu function
function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
	document.getElementById("openDraw").style.display = "none";
}

//Close left menu function
function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
	document.getElementById("openDraw").style.display = "block";
}

// Close setting drawer
function closeSetting() {
	document.getElementById("mysetting").style.display = "none";
	document.getElementsByClassName("networksetting").style.display = "block";
}

//Capitalize first letter
window.jsUcFirst = function (string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}




//Handling left menu hight
var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
	acc[i].addEventListener("click", function () {
		this.classList.toggle("active");
		var panel = this.nextElementSibling;
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null;
		} else {
			panel.style.maxHeight = 200 + "px";
		}
	});
}

//Reset "find Node" box as well network to its previous stage
function resetText() {
	$("#gene_list").val('');


	$("#logFCID4Color").val('none')
	$("#directionID4Color").val('none')
	$("#pathwayID4Color").val('none')
	$("#traitID4Color").val('none')
	// console.log($("#logFCID4Color").val());
	$("input[name='nodeColor']")[0].checked = true; // rectified nodecolor


	if ($("input[name='nodeColor']:checked").val() == 3) {
		//$("input[name='nodeColor']:checked").trigger('change');
		$("#pathwayID4Color option:selected").trigger('change');
	} else {
		$("input[name='nodeColor']:checked").trigger('change');
		// console.log('-->', $("input[name='nodeColor']:checked").val());
		//$("#pathwayID4Color option:selected").trigger('change');

	}
	//$(".country option:selected")
}

var jsonFile;
var nodeSize;

//Get JSON file name received through get method
function processUser() {
	var parameters = location.search.substring(1).split("&");
	var temp = parameters[0].split("=");
	jsonFile = unescape(temp[1]);
	// console.log('HERE-->', jsonFile, '<--ends') // Rectify
	var heading = jsonFile.split(".");
	d3.select("body").selectAll(".heading").selectAll("h5").remove("*");
	d3.select("body").selectAll(".heading").append("h5").style("word-wrap", "break-word").text(heading[0]);

}
processUser();

//Get Quartile of array of values
function quartileBounds(_sample) {
	// find the median as you did
	var _median = math.median(_sample)

	// split the data by the median
	var _firstHalf = _sample.filter(function (f) {
		return f < _median
	})
	var _secondHalf = _sample.filter(function (f) {
		return f >= _median
	})

	// find the medians for each split
	var _25percent = math.median(_firstHalf);
	var _75percent = math.median(_secondHalf);
	var iqr = _75percent - _25percent;

	var lowerBound = _25percent - (1.5 * iqr)
	var upperBound = _75percent + (1.5 * iqr)

	// this will be the upper bounds for each quartile
	return [lowerBound, upperBound, _25percent, _75percent];
}


// returns [26,33,78.5,288]

//get window width and height
var w = window.innerWidth;
var h = window.innerHeight;

var keyc = true,
	keys = true,
	keyt = true,
	keyr = true,
	keyx = true,
	keyd = true,
	keyl = true,
	keym = true,
	keyh = true,
	key1 = true,
	key2 = true,
	key3 = true,
	key0 = true

var focus_node = null,
	highlight_node = null;

var text_center = false;
var outline = false;

var min_score = 0;
var max_score = 1;

//linear scale for coloring nodes
/*var color = d3.scale.linear()
  .domain([min_score, (min_score+max_score)/2, max_score])
  .range(["lime", "yellow", "red"]); */



var highlight_color = "blue";
var highlight_trans = 0.1;

var xScale = d3.scale.linear()
	.domain([0, w]).range([0, w]);
var yScale = d3.scale.linear()
	.domain([0, h]).range([0, h]);
	
//Node size scale
var size = d3.scale.pow().exponent(1)
	.domain([50, 200])
	.range([10, 30]);

//Define force layout
// console.log(d3.layout.force().distance())
var force = d3.layout.force()
	.linkDistance(15)
	.charge(-200)
	.size([w, h]);
// gravity .1
// distance  infinity
//  chargeDistance infinity
// linkStrength 1
// theta .8

//deferent variables used in plot generation
var nodeSize_sel = "";
var default_node_color = "rgb(23, 190, 207)"; //#17becf
//var default_node_color = "rgb(3,190,100)";
//var default_link_color = "#888";
var default_link_color = "#c5c5c5";
var nominal_base_node_size = 8;
var nominal_text_size = 8;
var nominal_text_size_hovar = 15;
var max_text_size = 10;
var max_text_size_hovar = 15;
var nominal_stroke = 1;
var max_stroke = 4.5;
var max_base_node_size = 25;
var max_base_node_size1 = 200;
var min_base_node_size = 50;
var min_zoom = 0.1;
var max_zoom = 7;
var svg = d3.select("body").selectAll(".network").attr("tabindex", 1).on("keydown.brush", keydown)
	//var svg = d3.select("body").selectAll(".network").attr("tabindex", 1)
	.on("keyup.brush", keyup).each(function () {
		this.focus();
	}).append("svg");

var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom])
var zoomer = d3.behavior.zoom().
scaleExtent([min_zoom, max_zoom]).
x(xScale).
y(yScale).
on("zoomstart", zoomstart).
on("zoom", redraw);


// zoomstart
function zoomstart() {
	node.selectAll("path").each(function (d) {
		d.selected = false;
		d.previouslySelected = false;
	});
	node.selectAll("path").classed("selected", false);
}


function redraw() {
	vis.attr("transform",
		"translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
	//console.log("zoom")
	var text_size = nominal_text_size;
	//var text_size_hovar = nominal_text_size_hovar;
	// console.log('TEXT CHECK ->>', nominal_text_size, zoomer.scale(), max_text_size, '<<----'); // rectify
	// console.log('nominal_text_size',nominal_text_size);
	// console.log('zoomer.scale()', zoomer.scale());
	// console.log('max_text_size', max_text_size);
	// console.log('text_size', text_size, '\n\n');


	if (nominal_text_size * zoomer.scale() > max_text_size) text_size = max_text_size / zoomer.scale();

	//if (nominal_text_size_hovar*zoom.scale()>max_text_size_hovar) text_size_hovar = max_text_size_hovar/zoom.scale();
	// text.style("font-size", text_size + "px"); // rectified , just commented out this line	

	// console.log('text_size', text_size, '\n\n');

	nominal_text_size_hovar * zoom.scale() > max_text_size_hovar ? text_size = max_text_size_hovar : nominal_text_size_hovar * zoom.scale() < nominal_text_size_hovar ? text_size = nominal_text_size_hovar : text_size = nominal_text_size_hovar * zoom.scale();
	//text.style("font-size",text_size + "px");
	//text.style("font-size","5px");
	gbTootip.style("font-size", text_size + "px"); // rectify

	vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
//var g = svg.append("g");
svg.style("cursor", "move");
var graph = {};
var expressionColor, nodeSizeScale, nodeSizeScaleFC, nodeSizeScalePval, shiftKey, ctrlKey;;
var uniNode = {};
var link;
var node;

// Node tool-tip
var gbTootip = d3.select("body") // rectify
	.append("div")
	.attr("class", "gtip")
	.style("background", "#FFFFE0")
	.style("color", "black")
	.style("padding", "3px")
	.style("border-radius", "3px")
	.style("position", "absolute")
	.style("display", "none")
	.style("font-size", "15px")
	//.style("max-width", "200px")
	.on("mouseover", function () {
		gbTootip.transition().duration(0);
	})
	.on("mouseout", function () {
		gbTootip.style("display", "none");
	});


// Tooltip control	
function getTooltipHtml(d) {
	var html = '';
	for (fname in d) {
		html += fname + ':&nbsp;' + d[fname] + '<br>';

	}
	return html.trim('<br>');
}

/*
//An ajax call to read universal node file which contain data for different filters.
$.ajax({
		url: 'data/json/GRCH38-p12-uniNode_V4.json',
		dataType: 'json',
		success: function(data) {
		console.log("uniNode loaded")
		uniNode = data;
		uniNodeHeaders = Object.keys(uniNode.headers);

		//Seperate different headers like Pathways, Directions, etc. to populate corresponding drop-down
		uniNodeLogFC = uniNodeHeaders.filter((header) => header.startsWith("logFC_"));
		uniNodePLogFC = uniNodeLogFC.filter((header) => header.startsWith("logFC_proteomics"));
		uniNodeGLogFC = uniNodeLogFC.filter((header) => !header.startsWith("logFC_proteomics"));
		uniNodeDirection = uniNodeHeaders.filter((header) => header.startsWith("direction_"));
		uniNodePathway = uniNodeHeaders.filter((header) => header.startsWith("pathway_"));
		uniNodeTrait = uniNodeHeaders.filter((header) => header.startsWith("trait_"));

		//Populate all the dropdowns (logFCID4Color, directionID4Color, etc.)  in left menu with different headers
		for (var key=0; key < uniNodeLogFC.length; key++) {
					$('<option/>').val(uniNodeLogFC[key]).text(jsUcFirst(uniNodeLogFC[key])).appendTo('#logFCID4Color')
				};

		for (var key=0; key < uniNodeDirection.length; key++) {
					$('<option/>').val(uniNodeDirection[key]).text(jsUcFirst(uniNodeDirection[key])).appendTo('#directionID4Color')
				};
		for (var key=0; key < uniNodePathway.length; key++) {
			//var val = sample[0]+"_"+pathwayList[key];
			$('<option/>').val(uniNodePathway[key]).text(jsUcFirst(uniNodePathway[key])).appendTo('#pathwayID4Color')
		};


		for (var key=0; key < uniNodePLogFC.length; key++) {
					$('<option/>').val(uniNodePLogFC[key]).text(jsUcFirst(uniNodePLogFC[key])).appendTo('#PlogFCID4Size')
				};
		for (var key=0; key < uniNodeGLogFC.length; key++) {
					$('<option/>').val(uniNodeGLogFC[key]).text(jsUcFirst(uniNodeGLogFC[key])).appendTo('#GlogFCID4Size')
				};

		for (var key=0; key < uniNodeTrait.length; key++) {
			//var val = sample[0]+"_"+pathwayList[key];
			if(uniNodeTrait[key] != "trait_Module_ID") $('<option/>').val(uniNodeTrait[key]).text(jsUcFirst(uniNodeTrait[key])).appendTo('#traitID4Size')
			//$('<option/>').val("trait_" + traitList[key]).text(jsUcFirst(traitList[key])).appendTo('#traitID4Size')
		};


		  //console.log("uniNode: ", uniNode)

	   },
	  statusCode: {
		 404: function() {
		   alert('There was a problem with the server.  Try again soon!');
		 }
	   }
   });
//End of ajax call.
*/

var brusher = d3.svg.brush()
	.x(xScale)
	.y(yScale)
	.on("brushstart", function (d) {
		node.selectAll("path").each(function (d) {
			//console.log(d)
			d.previouslySelected = shiftKey && d.selected;
		});
	})
	.on("brush", function () {
		var extent = d3.event.target.extent();

		node.selectAll("path").classed("selected", function (d) {

			return d.selected = d.previouslySelected ^
				(extent[0][0] <= d.x && d.x < extent[1][0] &&
					extent[0][1] <= d.y && d.y < extent[1][1]);
		});
	})
	.on("brushend", function () {
		d3.event.target.clear();
		d3.select(this).call(d3.event.target);
		//########################
		x = [];
		d3.selectAll('.node').each(function (d) {
			if (d.selected) {
				console.log(x.push(d.label))
			}
		});
		d3.selectAll('.node').each(function (d) {
			if (d.selected) {
				console.log(x, d)
			}
		});
		$('#sgene_list').val(x.toString())
	});

var svg_graph = svg.append('svg:g').call(zoomer);

var rect = svg_graph.append('svg:rect')
	.attr('width', w)
	.attr('height', h)
	.attr('fill', 'transparent')
	//.attr('opacity', 0.5)
	.attr('stroke', 'transparent')
	.attr('stroke-width', 1)
	//.attr("pointer-events", "all")
	.attr("id", "zrect")

var brush = svg_graph.append("g")
	.datum(function () {
		return {
			selected: false,
			previouslySelected: false
		};
	})
	.attr("class", "brush");

var vis = svg_graph.append("svg:g");

vis.attr('id', 'vis')
//.attr('fill', 'red')
//.attr('stroke', 'black')
//.attr('stroke-width', 1)
//.attr('opacity', 1)



brush.call(brusher)
	.on("mousedown.brush", null)
	.on("touchstart.brush", null)
	.on("touchmove.brush", null)
	.on("touchend.brush", null);

brush.select('.background').style('cursor', 'auto')
	.on("click", function (d) {
		$('#sgene_list').val("");
	});


function dragended(d) {
	//d3.select(self).classed("dragging", false);
	node.selectAll("path").filter(function (d) {
			return d.selected;
		})
		.each(function (d) {
			d.fixed &= ~6;
		})

}

//Read Pathway specific JSON to create a force directed graph

d3.json("data/json/" + jsonFile + ".json", function (error, data) {

	graph = data;
	graphRec = JSON.parse(JSON.stringify(graph)); //Add this line
	var nodSize = [];


	//Node size scales for genomic and proteomic logfc

	nodeSizeScaleFC = d3.scale.linear()
		.domain([1, 4])
		.range([min_base_node_size, max_base_node_size1]);

	nodeSizeScalePval = d3.scale.linear()
		.domain([1, 11])
		.range([min_base_node_size, max_base_node_size]);

	nodeSizeScale = nodeSizeScaleFC;

	/*
	expressionColor = d3.scale.linear()
				.domain([nodeSizeMin, 0, nodeSizeMax])
				.range(["green", default_node_color, "red"]);
	*/

	//Node color scale for linear color range
	expressionColor = d3.scale.linear()
		.domain([-1.5, 0, +1.5])
		.range(["green", default_node_color, "red"]);


	//Store true if two nodes have connection
	var linkedByIndex = {};
	graph.links.forEach(function (d) {
		linkedByIndex[d.source + "," + d.target] = true;
	});

	//Check if two nodes are connected or not
	function isConnected(a, b) {
		return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
	}

	//Check if a node has connection/s
	function hasConnections(a) {
		for (var property in linkedByIndex) {
			s = property.split(",");
			if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) return true;
		}
		return false;
	}

	//Start the node directed graph
	force
		.nodes(graph.nodes)
		.links(graph.links)
		.on('start', start)
		.start();

	//create edges between node
	link = vis.selectAll(".link")
		//link = g.selectAll(".link")
		.data(graph.links)
		.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", nominal_stroke)
		.style("stroke", function (d) {
			if (isNumber(d.weight) && d.weight <= 0) return "red";
			else return default_link_color;
		})

	//ADDING GRAPH CHANGE
	// setTimeout(() => {
	// 	graph.links = [];
	// 	link = vis.selectAll(".link")
	// 		//link = g.selectAll(".link")
	// 		.data(graph.links)
	// 		.exit().remove("line");

	// 	link = vis.selectAll(".link")
	// 		//link = g.selectAll(".link")
	// 		.data(graph.links)
	// 		.enter().append("line")
	// 		.attr("class", "link")
	// 		.style("stroke-width", nominal_stroke)
	// 		.style("stroke", function (d) {
	// 			if (isNumber(d.weight) && d.weight <= 0) return "red";
	// 			else return default_link_color;
	// 		})
	// }, 20000)

	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation();
		if (!d.selected && !shiftKey) {
			// if this node isn't selected, then we have to unselect every other node
			node.selectAll("path").classed("selected", function (p) {
				return p.selected = p.previouslySelected = false;
			});
		}

		d3.select(this).classed("selected", function (p) {
			d.previouslySelected = d.selected;
			return d.selected = true;
		});

		node.selectAll("path").filter(function (d) {
				return d.selected;
			})
			.each(function (d) {
				d.fixed |= 2;
			})
	}

	function dragged(d) {
		node.selectAll("path").filter(function (d) {
				return d.selected;
			})
			.each(function (d) {
				d.x += d3.event.dx;
				d.y += d3.event.dy;

				d.px += d3.event.dx;
				d.py += d3.event.dy;
			})

		force.resume();
	}

	//Gradient in nodes to give 3D effects
	grads = svg.append("defs").selectAll("radialGradient")
		.data(graph.nodes)
		.enter()
		.append("radialGradient")
		.attr("gradientUnits", "objectBoundingBox")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", "100%")
		.attr("id", function (d, i) {
			//console.log(d.id);
			genID = d.label.replace("-", "HYPHEN")
			genID = genID.replace(".", "DOT")
			genID = genID.replace("(", "LB")
			genID = genID.replace(")", "RB")
			genID = genID.replace(/[^A-Za-z0-9]/g, '')
			//genID = genID.replace(/\s/, "")
			genID = d.id + "_" + genID;
			return genID;
		});
	//.attr("id", function(d, i) { return "grad" + i; });

	//Set white & blue color for gradient 3D effects
	grads.append("stop")
		.attr("offset", "0%")
		.style("stop-color", "white");

	grads.append("stop")
		.attr("offset", "100%")
		.style("stop-color", function (d) {
			return default_node_color;
		});


	//Create node container g
	node = vis.selectAll(".node")
		.data(graph.nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("id", function (d, i) {
			//console.log(d.id);
			//genID = d.label.replace("-", "HYPHEN")
			//genID = genID .replace(".", "DOT")
			//genID = d.id+"_"+genID;
			genID = d.id;
			return genID;
		})
	//.call(force.drag)

	//double click on a node to make it on center of the page
	node.on("dblclick.zoom", function (d) {
		d3.event.stopPropagation();

		var dcx = (window.innerWidth / 2 - d.x * zoom.scale());
		var dcy = (window.innerHeight / 2 - d.y * zoom.scale());
		zoom.translate([dcx, dcy]);
		vis.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");
	});


	var tocolor = "fill";
	var towhite = "stroke";
	if (outline) {
		tocolor = "stroke"
		towhite = "fill"
	}


	//Define the node size (in this case circle)
	var circle = node.append("path")
		.attr("d", d3.svg.symbol()
			.size(function (d) {
				//if($('input[name=nodeSize]:checked').val() == 1)
				//{
				thisNodeSize = size(nodeSizeScale(Math.pow(2, Math.abs(Number(d[nodeSize])))));
				//thisNodeSize = size(nodeSizeScale(Math.abs(Number(d[nodeSize]))));
				return Math.PI * Math.pow(thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size, 2);
				/*}
				else if($('input[name=nodeSize]:checked').val() == 2)
				{
					return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2,Math.abs(Number(d.proteomics_fc))))) || nominal_base_node_size,2);
				}
				else
				{
					return Math.PI*Math.pow(nominal_base_node_size,2);
				}*/

			})
			.type(function (d) {
				return "circle"; /*d.type;*/
			}))
		.style("fill", function (d, i) {

			genID = d.label.replace("-", "HYPHEN")
			genID = genID.replace(".", "DOT")
			genID = genID.replace("(", "LB")
			genID = genID.replace(")", "RB")
			genID = genID.replace(/[^A-Za-z0-9]/g, '')
			genID = d.id + "_" + genID;
			return "url(#" + genID + ")";
		})
		//.style(tocolor, function(d) { return default_node_color; })
		//if(d.direction == "UP") return "red";
		//else if(d.direction == "DOWN") return "green";
		//else return default_node_color; })
		.style("stroke-width", nominal_stroke)
		.style(towhite, "white");

	//Create node labels
	text = vis.selectAll(".text")
		.data(graph.nodes)
		.enter().append("text")
		.attr("dy", ".35em")
		.attr("class", "text")
		.style("font-size", nominal_text_size + "px");
	//.style("font-size", "50px");

	if (text_center)
		text.text(function (d) {
			return d.label == "NA" ? d.id : d.label;
		})
		.style("text-anchor", "middle");
	else
		text.attr("dx", function (d) {
			return (size(nodeSizeScale(Math.abs(Number(d[nodeSize])))) || nominal_base_node_size);

		})
		.text(function (d) {
			return d.label == "NA" ? '\u2002' + d.id : '\u2002' + d.label;
		});

	//Highlight connection of a node and show tooltip on mouseover event
	node.on("mouseover", function (d) {
			set_highlight(d);

			// document.getElementById("mysetting").style.display ="block"
			var gene_info = document.getElementById("gene_info");
			//  gene info on hover  on side tab 
			gene_info.innerHTML = `<a class='gene_info_link' href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${d.id}"  target='_blank'>Id: ${d.id} </a>` + "<br>" +
				"<p class='gene_info'>Description :</p>" + d.Description + "<br>" +
				"<p class='gene_info'>label :</p>" + d.label + "<br>" +
				"<p class='gene_info'>weight :</p>" + d.weight

			gbTootip.transition().duration(500);
			gbTootip.style("top", d3.event.pageY - 5 + "px");
			gbTootip.style("left", d3.event.pageX + 5 + "px");
			gbTootip.html(function () {


				//var tmp1 = "Gene: " + d.id + "<br>" + "logFC: " + d.logFC.toExponential(2) + "<br>";
				var tmp1 = d.label ? "Gene: " + d.label + "<br>" : "";
				var tmp2 = d.id ? "Ensemble: " + d.id + "<br>" : "";
				var tmp3 = d.Description ? "Description: " + d.Description + "<br>" : "";
				//################### Update on 8.05.19 #################################//
				if (nodeSize_sel != "") {
					// console.log([d.id, uniNode.headers[nodeSize_sel]]);
					var tmp4 = nodeSize_sel + ": " + (uniNode.genes[d.id] ?
						(uniNode.genes[d.id][uniNode.headers[nodeSize_sel]] == "" ?
							"" : (uniNode.genes[d.id][uniNode.headers[nodeSize_sel]]).toExponential(2)) : "") + "<br>";
				}

				//################### End_Update on 8.05.19 #################################//
				//var tmp4 = "logFC: " + d.logFC.toExponential(2) + "<br>";
				//d.proteomics_fc == "NA" || typeof d.proteomics_fc == "undefined" ? tmp5 = "" : tmp5 = "Proteomic logFC: " + d.proteomics_fc.toExponential(2) + "<br>"
				//var tmp6 =  d.pvalue ? "P-value: " + d.pvalue.toExponential(2) : "";

				//console.log(d.logFC);
				//return tmp1 + tmp2 + tmp3 +tmp4 +tmp5 +tmp6;
				//console.log("Node size")
				//console.log(nodSize)
				if (nodeSize_sel != "") {
					return tmp1 + tmp2 + tmp3 + tmp4;
				} else {
					return tmp1 + tmp2 + tmp3;
				}

			})
			gbTootip.style("display", "block");
		})

		//highlight connections & remove tooltip on mousedown event and get back to previous stat on mouseup
		.on("mousedown", function (d) {
			d3.event.stopPropagation();
			gbTootip.transition()
				.delay(250)
				.style("display", "none");
			focus_node = d;
			set_focus(d)
			if (highlight_node === null) set_highlight(d)


		})
		//remove tooltip on mouseout
		.on("mouseout", function (d) {
			exit_highlight();
			gbTootip.transition()
				.delay(250)
				.style("display", "none");

		})
		/*
				.on("click", function(d) {
						//console.log("click");
						if (d3.event.defaultPrevented) return;

						if (!shiftKey) {
							//if the shift key isn't down, unselect everything
							node.selectAll("path").classed("selected", function(p) { //##############################
									//p.previouslySelected = false;
									return p.selected =  p.previouslySelected = false; })
						}

						// always select this node
						//node.selectAll("path").select(this).classed("selected", d.selected = !d.previouslySelected);
				})
			*/
		.call(d3.behavior.drag()
			.on("dragstart", dragstarted)
			.on("drag", dragged)
			.on("dragend", dragended));

	//make visible all the nodes on mouseout.
	d3.select(window).on("mouseup",
		function () {
			if (focus_node !== null) {
				focus_node = null;
				if (highlight_trans < 1) {

					circle.style("opacity", 1);
					text.style("opacity", 1);
					link.style("opacity", 1);
				}
			}

			if (highlight_node === null) exit_highlight();
			//$("#gene_list").val('');
		});

	//Function to remove highlight colors and make connection to the default condition
	function exit_highlight() {
		//$("#gene_list").val('');
		highlight_node = null;
		if (focus_node === null) {
			svg.style("cursor", "move");
			if (highlight_color != "white") {
				circle.style(towhite, "white");
				text.style("font-weight", "normal");
				link.style("stroke", function (o) {
					return (isNumber(o.score) && o.score >= 0) ? color(o.score) : default_link_color
				});
			}

		}
	}

	//Function to show the connection and hide others on mouse down.
	function set_focus(d) {
		if (highlight_trans < 1) {
			circle.style("opacity", function (o) {
				return isConnected(d, o) ? 1 : highlight_trans;
			});

			text.style("opacity", function (o) {
				return isConnected(d, o) ? 1 : highlight_trans;
			});

			link.style("opacity", function (o) {
				return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
			});
		}
	}



	//Function to highlight the connection using blue border.
	function set_highlight(d) {
		svg.style("cursor", "pointer");
		if (focus_node !== null) d = focus_node;
		highlight_node = d;
		//Edit
		//prompt(highlight_node)
		//
		if (highlight_color != "white") {
			circle.style(towhite, function (o) {
				return isConnected(d, o) ? highlight_color : "white";
			});
			text.style("font-weight", function (o) {
				return isConnected(d, o) ? "bold" : "normal";
			});
			link.style("stroke", function (o) {
				return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score >= 0) ? color(o.score) : default_link_color);

			});

		}

	}

	//Zoom-in/out by scroll button to see the specific part/connection of whole network.
	zoom.on("zoom", function () {

		var stroke = nominal_stroke;
		if (nominal_stroke * zoom.scale() > max_stroke) stroke = max_stroke / zoom.scale();
		link.style("stroke-width", stroke);
		circle.style("stroke-width", stroke);

		var base_radius = nominal_base_node_size;
		if (nominal_base_node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
		circle.attr("d", d3.svg.symbol()
			.size(function (d) {

				//thisNodeSize = size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize])))));
				thisNodeSize = uniNode.genes[d.id] ? size(nodeSizeScale(Math.pow(2, Math.abs(Number(uniNode.genes[d.id][uniNode.headers[nodeSize]]))))) : "";
				//console.log(thisNodeSize);
				return Math.PI * Math.pow(thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size, 2);
				//return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2, Math.abs(Number(d[nodeSize])))))||base_radius,2);

			})
			.type(function (d) {
				return d.type;
			}))

		//circle.attr("r", function(d) { return (size(nodeSizeScale(Math.abs(Number(d.logFC))))*base_radius/nominal_base_node_size||base_radius); })
		if (!text_center) text.attr("dx", function (d) {
			//return (size(nodeSizeScale(Math.pow(2,Math.abs(Number(nodeSize))))) || nominal_base_node_size);
			return (size(nodeSizeScale(Math.abs(Number(d[nodeSize])))) || nominal_base_node_size);

		});

		var text_size = nominal_text_size;
		//var text_size_hovar = nominal_text_size_hovar;
		if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
		//if (nominal_text_size_hovar*zoom.scale()>max_text_size_hovar) text_size_hovar = max_text_size_hovar/zoom.scale();
		text.style("font-size", text_size + "px");

		nominal_text_size_hovar * zoom.scale() > max_text_size_hovar ? text_size = max_text_size_hovar : nominal_text_size_hovar * zoom.scale() < nominal_text_size_hovar ? text_size = nominal_text_size_hovar : text_size = nominal_text_size_hovar * zoom.scale();
		//text.style("font-size",text_size + "px");
		//text.style("font-size","5px");
		gbTootip.style("font-size", text_size + "px");

		vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	});

	//svg.call(zoom);

	resize();
	//window.focus();
	// Resizing the window and hide/show nodes/connections on keydown
	d3.select(window).on("resize", resize).on("keydown", keydown);

	force.on("tick", function () {

		node.attr("transform", function (d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
		text.attr("transform", function (d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		link.attr("x1", function (d) {
				return d.source.x;
			})
			.attr("y1", function (d) {
				return d.source.y;
			})
			.attr("x2", function (d) {
				return d.target.x;
			})
			.attr("y2", function (d) {
				return d.target.y;
			});

		node.attr("cx", function (d) {
				return d.x;
			})
			.attr("cy", function (d) {
				return d.y;
			});
		// var ticksPerRender = 10;
		// requestAnimationFrame(function render() {
		//   for (var i = 0; i < ticksPerRender; i++) {
		// 	force.tick();
		// 	node.attr("transform", function (d) {
		// 		return "translate(" + d.x + "," + d.y + ")";
		// 	});
		// 	text.attr("transform", function (d) {
		// 		return "translate(" + d.x + "," + d.y + ")";
		// 	});
		//   }
		  
		//   link
		// 	.attr('x1', function(d) { return d.source.x; })
		// 	.attr('y1', function(d) { return d.source.y; })
		// 	.attr('x2', function(d) { return d.target.x; })
		// 	.attr('y2', function(d) { return d.target.y; });
		//   node
		// 	.attr('cx', function(d) { return d.x; })
		// 	.attr('cy', function(d) { return d.y; });
		  
		//   if (force.alpha() > 0) {
		// 	requestAnimationFrame(render);
		//   }
		// })
	});

	function start() {
		console.log('sdfsdfsdfsdfsdfsd');
		
		
	  }

	function resize() {
		var width = window.innerWidth,
			height = window.innerHeight;
		svg.attr("width", width).attr("height", height);

		force.size([force.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
		w = width;
		h = height;
	}

});

var linkedByIndex = {};

function keydown() {

	shiftKey = d3.event.shiftKey || d3.event.metaKey;
	ctrlKey = d3.event.ctrlKey;

	//console.log('d3.event', d3.event)
	if (shiftKey) {
		//console.log("Shift down")
		svg_graph.call(zoomer)
			.on("mousedown.zoom", null)
			.on("touchstart.zoom", null)
			.on("touchmove.zoom", null)
			.on("touchend.zoom", null);

		//svg_graph.on('zoom', null);
		vis.selectAll('g.gnode')
			.on('mousedown.drag', null);

		brush.select('.background').style('cursor', 'crosshair')
		brush.call(brusher);
	}
	if (d3.event.keyCode == 32) {
		force.stop();
	} else if (d3.event.keyCode >= 48 && d3.event.keyCode <= 90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey) {
		switch (String.fromCharCode(d3.event.keyCode)) {
			case "C":
				keyc = !keyc;
				break;
			case "S":
				keys = !keys;
				break;
			case "T":
				keyt = !keyt;
				break;
			case "R":
				keyr = !keyr;
				break;
			case "X":
				keyx = !keyx;
				break;
			case "D":
				keyd = !keyd;
				break;
			case "L":
				keyl = !keyl;
				break;
			case "M":
				keym = !keym;
				break;
			case "H":
				keyh = !keyh;
				break;
			case "1":
				key1 = !key1;
				break;
			case "2":
				key2 = !key2;
				break;
			case "3":
				key3 = !key3;
				break;
			case "0":
				key0 = !key0;
				break;
		}

		//EDITED
		link.style("display", function (d) {

			// console.log(d)
			//console.log(d)
			//var flag  = vis_by_type(d.source.type)&&vis_by_type(d.target.type)&&vis_by_node_score(d.source.score)&&vis_by_node_score(d.target.score)&&vis_by_link_score(d.weight);
			var flag = vis_by_node_score(d.source.score) && vis_by_node_score(d.target.score) && vis_by_link_score(d.weight);
			linkedByIndex[d.source.index + "," + d.target.index] = flag;
			// console.log(flag, "flag")
			return flag ? "inline" : "inline";
		});
		node.style("display", function (d) {
			return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? "inline" : "none";
		});
		text.style("display", function (d) {
			return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? "inline" : "none";
		});

		if (highlight_node !== null) {
			if ((key0 || hasConnections(highlight_node)) && vis_by_type(highlight_node.type) && vis_by_node_score(highlight_node.score)) {
				if (focus_node !== null) set_focus(focus_node);
				set_highlight(highlight_node);
				//Edit
				//prompt(highlight_node)
			} else {
				exit_highlight();
			}
		}
		//
		//console.log(highlight_node);
		//

	}
}


function keyup() {
	//console.log("key up")
	shiftKey = d3.event.shiftKey || d3.event.metaKey;
	ctrlKey = d3.event.ctrlKey;

	brush.call(brusher)
		.on("mousedown.brush", null)
		.on("touchstart.brush", null)
		.on("touchmove.brush", null)
		.on("touchend.brush", null);

	brush.select('.background').style('cursor', 'auto')
	svg_graph.call(zoomer);
}

//Show hide nodes/links based on weight/score/type (only show/hide link is working)
function vis_by_type(type) {
	switch (type) {
		case "circle":
			return keyc;
		case "square":
			return keys;
		case "triangle-up":
			return keyt;
		case "diamond":
			return keyr;
		case "cross":
			return keyx;
		case "triangle-down":
			return keyd;
		default:
			return true;
	}
}

function vis_by_node_score(score) {
	if (isNumber(score)) {
		if (score >= 0.666) return keyh;
		else if (score >= 0.333) return keym;
		else if (score >= 0) return keyl;
	}
	return true;
}

function vis_by_link_score(score) {
	if (isNumber(score)) {
		if (score >= 0.666) return key3;
		else if (score >= 0.333) return key2;
		else if (score >= 0) return key1;
	}
	return true;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}


/*EDITED

function findLargest() {
  var largest = null,
  weight = 0;
  node.each(function(d) {
   var connections = link.filter(function(l) {
	  return l.source.index == d.index || l.target.index == d.index
	});
	d.weight = connections.size();
	if (d.weight > weight) {
	  largest = {
		node: this,
		links: connections
	  };
	  weight = d.weight;

	}
  });
  /*if (largest) {
	d3.select(largest.node).select("circle")
	  .style("fill", "red")
	  .style("stroke-width", 3);
	largest.links.each(function() {
	  d3.select(this).style("stroke", "red").style("stroke-width", 3);;
	})
  }
}
/* END EDITED */


//---Insert-------
//adjust threshold and recreate graph with connections having weight >= threshold


/* forec network setting script   */

let linkdistance = document.getElementById("linkdistance");
let linkcharge = document.getElementById("linkcharge");
let linkdistanceinput = document.getElementById("linkdistanceinput");
let linkchargeinput = document.getElementById("linkchargeinput");
let linkStrength = document.getElementById("linkStrength");
let linkStrengthinput = document.getElementById("linkStrengthinput");


linkdistance.addEventListener("change", linkdistanceFunc)
linkcharge.addEventListener("change", linkchargeFunc)
linkStrength.addEventListener("change", linkstrengthFunc)

function linkdistanceFunc() {

	linkdistanceinput.innerHTML = this.value
	force.linkDistance(this.value)
	force.start()
}

function linkchargeFunc() {
	linkchargeinput.innerHTML = this.value;
	force.charge(this.value)
	force.start()
}

function linkstrengthFunc() {
	// console.log(this.value)
	linkStrengthinput.innerHTML = this.value;
	force.distance(this.value)

	force.start()
	// setTimeout(function(){
	// 	force.alpha(0);
	// },1000);
}


/* EDITED for Threshold for weight */



var slider = document.getElementById("myRange");
var output = document.getElementById("thresh");
var degree = document.getElementById("myDegree");
var degreeOutput = document.getElementById("thresh1");
var myConnection = document.getElementById("myConnection");
var ConnectionOutput = document.getElementById("thresh2");
degreeOutput.innerHTML = 0;
ConnectionOutput.innerHTML = 0;
myConnection.addEventListener("change", ConnectionFun)
degree.addEventListener("change", DegreeFun);
slider.addEventListener("change", weightFunc)

function weightFunc() {
	//var textval=10
	output.innerHTML = this.value;
	graph.links.splice(0, graph.links.length);
	for (var i = 0; i < graphRec.links.length; i++) {
		if (graphRec.links[i].weight >= this.value) {
			graph.links.push(graphRec.links[i]);
		}
	}

	degreeOutput.innerHTML = 0;
	document.getElementById("myDegree").value = 0;
	DegreeFun()

	restart();
}


function ConnectionFun() {
	ConnectionOutput.innerHTML = this.value;
	var myval1 = this.value;
	d3.selectAll(".node").each(function (d) {
		if (d.weight >= myval1 && myval1 >= 1) {
			console.log('coloured-->', d);
			d3.selectAll("*[id^=" + d.id
					.replace(/\./g, 'DOT') + "_]," + "*[id$=_" + d.label
					.replace(/\./g, 'DOT') + "]")
				.select("stop[offset='100%']")
				.style("stop-color", "blue");
		} else {
			d3.selectAll("*[id^=" + d.id
					.replace(/\./g, 'DOT') + "_]," + "*[id$=_" + d.label
					.replace(/\./g, 'DOT') + "]")
				.select("stop[offset='100%']")
				.style("stop-color", default_node_color);
		}
	})

}


function DegreeFun() {
	// console.log(this.value,"event value")
	degreeOutput.innerHTML = this.value || 0;
	// console.log(this.value)
	if (typeof this.value == "undefined") {
		// console.log("jjd")
		this.value = 0;
	}
	var degreeVal = this.value || 0;
	// console.log(graph)
	d3.selectAll(".node")
		.filter(d => {
			// console.log(d.weight)
			// console.log(d.weight >= degreeVal)
			return d.weight >= degreeVal;
		})
		.style("display", "inline");

	d3.selectAll(".node")
		.filter(d => {
			return d.weight < degreeVal;
		})
		.style("display", "none");
	d3.selectAll(".link")
		.filter(d => {

			return d.target.weight > degreeVal
		})
		.style("display", "inline");
	d3.selectAll(".link")
		.filter(d => {

			return d.source.weight >= degreeVal
		})
		.style("display", "inline");
	d3.selectAll(".link")
		.filter(d => {

			return d.target.weight < degreeVal
		})
		.style("display", "none");
	d3.selectAll(".link")
		.filter(d => {
			//console.log(d.source.weight,d.target.weight,"newtork");
			return d.source.weight < degreeVal
		})
		.style("display", "none");
	d3.selectAll(".text")
		.filter(d => {
			// console.log(d.weight)
			return d.weight >= degreeVal;
		})
		.style("display", "inline");
	d3.selectAll(".text")
		.filter(d => {
			// console.log(d.weight)
			return d.weight < degreeVal;
		}).style("display", "none");
}

// slider.oninput =  function() {
//   //var textval=10
//   output.innerHTML = this.value;
//   var myinout = this.value;
//   graph.links.splice(0, graph.links.length);

//   graphRec.links.forEach(function(val){
// 		if(val.weight > myinout){
// 			graph.links.push(val);
// 		}
// 	});

// 	console.log(graph.links,"kkkk",graph.nodes)
// 	restart();
// }

// function filternodes(){
// 	graph.nodes.splice(0, graph.nodes.length);
// 	console.log(graph.links,"kkkk",graph.nodes)
// 	console.log()

// }


/* EDITED END*/

//---Insert-------
//adjust threshold and recreate graph with connections having weight >= threshold
/* EDITED for Threshold for Degree

var slider1 = document.getElementById("myDegree");
var output1 = document.getElementById("thresh1");
slider1.oninput = function() {
  //var textval=10
  output1.innerHTML = this.value;

  graph.links.splice(0, graph.links.length);

	for (var i = 0; i < graphRec.links.length; i++) {
		if (graphRec.links[i].weight > this.value) {graph.links.push(graphRec.links[i]);}
	}
	restart();
}
/* EDITED END*/


//Restart the visualisation after any node and link changes
function restart() {

	link = link.data(graph.links);
	link.exit().remove();
	link.enter().insert("line", ".node").attr("class", "link");
	// node = node.data(graph.nodes);
	// node.exit().remove();
	// node.enter().insert("circle", ".cursor").attr("class", "node");
	force.start();
}
//---End Insert---

function getNodeSizeScale(nss) {
	a = [];
	$.each(uniNode.genes, function (d) {
		if (typeof uniNode.genes[d][uniNode.headers[nss]] == "number") {
			a.push(Math.abs(uniNode.genes[d][uniNode.headers[nss]]));
		} else {
			a.push(0);
		}
	});
	//d3.min((uniNode.genes, function(d){console.log(uniNode.genes[d][uniNode.headers[nodeSize]]);}))
	return d3.scale.linear()
		.domain([d3.min(a), d3.max(a)])
		.range([min_base_node_size, max_base_node_size1]);
}

//find node
$("#geneinput").submit(function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();

	//console.log(e)
	//console.log("INSISE FIND NODE")
	function highlight_genes(y) {
		//Edited
		yed = [];
		/*y.forEach(function(d){
			yed.push(d.replace(/'DOT'/g, '\.'));
			//First change the color of all dots to blue (to reset previous serach)
			//d = d.replace(/\./g, '');
			})*/
		//d3.selectAll(".node").each(function(d){ if (y.indexOf(d.label)>-1 || y.indexOf(d.id)>-1) {d3.selectAll("*[id^="+d.id+"_],"+"*[id$=_"+d.label+"]").select("stop[offset='100%']").style("stop-color",  "blue");} })
		d3.selectAll(".node").each(function (d) {
			if (y.indexOf(d.label) > -1 || y.indexOf(d.id) > -1) {
				d3.selectAll("*[id^=" + d.id.replace(/\./g, 'DOT') + "_]," + "*[id$=_" + d.label.replace(/\./g, 'DOT') + "]").select("stop[offset='100%']").style("stop-color", "blue");
			}
		})


		/*y.forEach(function(d){
			var modgene = d.replace(/\./g, 'DOT');
			modgene = modgene.replace(/-/g, 'HYPHEN');
			modgene = modgene.replace("(", "LB")
			modgene = modgene.replace(")", "RB")
			modgene = modgene.replace(/,/, "")
			modgene = modgene.replace(/\s/, "")


			d3.selectAll("*[id^="+modgene+"_],"+"*[id$=_"+modgene+"]").select("stop[offset='100%']").style("stop-color",  "blue");
			console.log("*[id^="+modgene+"_],"+"*[id$=_"+str+"]")
			//d3.selectAll("*[id^="+d+"_],"+"*[id$=_"+d+"]").select("stop[offset='100%']").style("stop-color",  "blue");

		})*/
	}

	if (document.getElementById("gene_list").value != "") {
		var y = [];
		var str = document.getElementById("gene_list").value.toUpperCase().trim().replace(/(^,+)|(,+$)/g, "")
		//edited
		//str = str.replace(/\./g, 'DOT');

		//str = str.replace(/-/g, 'HYPHEN');
		//str = str.replace("(", "LB")
		//str = str.replace(")", "RB")
		//str = str.replace(/,/, "")
		//str = str.replace(/\s/, "")
		y = str.split(/\s*[,\n]+\s*[,\n]*\s*/);
		// console.log(y)
		highlight_genes(y)

	}


});


//Change the data for coloring the node and apply it on network

$("input[name='nodeColor']").change(function () {
	//Reset to default color
	if ($(this).val() === '0') {

		d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
			return default_node_color;
		});
		d3.select("#pathwayInput").style("display", "none");
		//d3.select("#traitInput4Size").style("display", "none");
		d3.select(".legendExpression").attr("opacity", 0);
		d3.select(".legendPathway").attr("opacity", 0);
		d3.select(".legendDirection").attr("opacity", 0);
		d3.select("#logFCInput").style("display", "none");
		d3.select("#directionInput").style("display", "none");
		d3.select("#traitInput").style("display", "none");

	} else if ($(this).val() === '1') { //color based on differential expression (Directions: up/down/none)
		// $('#Direction').
		d3.select("#directionInput").style("display", "block");
		d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
			return default_node_color;
		});
		/* d3.selectAll("stop[offset='100%']").style("stop-color",  function(d) {
			   if(d.direction == "UP") {  return "red";}
			   else if(d.direction == "DOWN") return "green";
			   else return default_node_color;
		   }); */
		d3.select("#pathwayInput").style("display", "none");
		d3.select(".legendExpression").attr("opacity", 0);
		d3.select(".legendPathway").attr("opacity", 0);
		d3.select(".legendDirection").attr("opacity", 1);
		d3.select("#logFCInput").style("display", "none");
		d3.select("#traitInput").style("display", "none");


	} else if ($(this).val() === '2') { //color based on differential expression (linear scale)

		//d3.selectAll(".node").select("path")
		//.style("fill", function(d) {
		d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
			return default_node_color;
		});
		/*d3.selectAll("stop[offset='100%']").style("stop-color",  function(d) {
		return expressionColor(Number(d.logFC));
		});*/
		d3.select("#logFCInput").style("display", "block");
		d3.select("#pathwayInput").style("display", "none");
		//d3.select("#traitInput4Size").style("display", "none");
		d3.select(".legendExpression").attr("opacity", 1);
		d3.select(".legendDirection").attr("opacity", 0);
		d3.select(".legendPathway").attr("opacity", 0);
		d3.select("#directionInput").style("display", "none");
		d3.select("#traitInput").style("display", "none");


	} else if ($(this).val() === '3') { //color based on presence in pathway/s

		//d3.selectAll(".node").select("path")
		//.style("fill", function(d) {
		d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
			return default_node_color;
		});
		d3.select("#pathwayInput").style("display", "block");
		//d3.select("#traitInput4Size").style("display", "none");
		d3.select(".legendExpression").attr("opacity", 0);
		d3.select(".legendDirection").attr("opacity", 0);
		d3.select(".legendPathway").attr("opacity", 1);
		d3.select("#logFCInput").style("display", "none");
		d3.select("#directionInput").style("display", "none");
		d3.select("#traitInput").style("display", "none");

	} else if ($(this).val() === '4') { //color based on presence in trait list (p-values from articles)

		//d3.selectAll(".node").select("path")
		//.style("fill", function(d) {
		d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
			//if(d["trait_Module ID"] && d["trait_Module ID"] != "NA") {return "red";}
			// if (uniNode.genes[d.id] && uniNode.genes[d.id][uniNode.headers["trait_Module_ID"]] != "NA") { return "red"; }
			return default_node_color;
		});
		d3.select("#traitInput").style("display", "block");
		d3.select("#pathwayInput").style("display", "none");
		d3.select(".legendExpression").attr("opacity", 0);
		d3.select(".legendDirection").attr("opacity", 0);
		d3.select(".legendPathway").attr("opacity", 1);
		d3.select("#logFCInput").style("display", "none");
		d3.select("#directionInput").style("display", "none");

	}

});



//on selecting Direction type, color the nodes

document.getElementById("directionID4Color").onchange = function () {

	d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {

		var dirc = uniNode.genes[d.id] ? uniNode.genes[d.id][uniNode.headers[document.getElementById("directionID4Color").value]] : "undefined"
		uniNode.genes[d.id] ? "" : console.log(d.id);
		if (uniNode.genes[d.id]) {

			if (dirc == "UP") {
				return "red";
			} else if (dirc == "DOWN") return "green";
			else if (dirc == "undefined") return "black";
			else return default_node_color;
		}
		//return uniNode.genes[d.id] ? uniNode.genes[d.id][uniNode.headers[document.getElementById("directionID4Color").value]] == "red" ?  : "black";


	});



}

//on selecting logFC type, color the nodes

document.getElementById("logFCID4Color").onchange = function () {

	d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {

		uniNode.genes[d.id] ? "" : console.log(d.id);
		//return uniNode.genes[d.id] ? expressionColor(Number(uniNode.genes[d.id][uniNode.headers[document.getElementById("logFCID4Color").value]])) : default_node_color;
		return uniNode.genes[d.id] ? expressionColor(Number(uniNode.genes[d.id][uniNode.headers[document.getElementById("logFCID4Color").value]])) : "black";


	});



}

//on selecting pathway name, color the nodes

document.getElementById("pathwayID4Color").onchange = function () {

	d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {

		var pat = uniNode.genes[d.id] ? uniNode.genes[d.id][uniNode.headers[document.getElementById("pathwayID4Color").value]] : "undefined";
		if (uniNode.genes[d.id]) {
			if (pat == 1) {
				return "red";
			} else if (pat == "undefined") {
				return "black"
			}
			//if(d[document.getElementById("pathwayID4Color").value] == 1) {return "red";}
			//if(uniNode[d.id] && uniNode[d.id][document.getElementById("pathwayID4Color").value] == 1) {return "red";}
			else return default_node_color;
		}
	});

}

// on selecting trait for color change
document.getElementById("traitID4Color").onchange = function () {

	d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {

		uniNode.genes[d.id] ? "" : console.log(d.id);
		//return uniNode.genes[d.id] ? expressionColor(Number(uniNode.genes[d.id][uniNode.headers[document.getElementById("logFCID4Color").value]])) : default_node_color;
		return uniNode.genes[d.id] ? expressionColor(Number(uniNode.genes[d.id][uniNode.headers[document.getElementById("traitID4Color").value]])) : "black";


	});



}

//Change the data for sizing the node and apply it on network

$("input[name='nodeSize']").change(function () {
	nodeSize = '';
	nodeSize_sel = nodeSize;
	//console.log(d3.selectAll(".text"));
	//nodeSizeScaleFC = d3.scale.linear()
	//	.domain([1, 4])
	//	.range([50, 200]);

	//Default node size
	if ($(this).val() === '0') {
		nodeSizeScale = nodeSizeScaleFC;
		d3.select("#traitInput4Size").style("display", "none");
		d3.select("#PlogFCInput").style("display", "none");
		d3.select("#GlogFCInput4Size").style("display", "none");
		d3.select("#gwasInput4Size").style("display", "none");
		d3.selectAll(".node").select("path")
			.attr("d", d3.svg.symbol()
				.size(function (d) {
					return Math.PI * Math.pow(nominal_base_node_size, 2);
				})
				.type(function (d) {
					return "circle"; /*d.type;*/
				}));



	} else if ($(this).val() === '1') { //Node size based on genomic logFC

		nodeSize_sel = nodeSize;
		//nodeSizeScale = nodeSizeScaleFC;
		nodeSizeScale = d3.scale.linear()
			.domain([1, 4])
			.range([min_base_node_size, max_base_node_size1]);
		d3.select("#GlogFCInput4Size").style("display", "block");
		d3.select("#PlogFCInput").style("display", "none");
		d3.select("#traitInput4Size").style("display", "none");
		d3.select("#gwasInput4Size").style("display", "none");
		$("#GlogFCID4Size").val('none');
		d3.selectAll(".node").select("path")
			.attr("d", d3.svg.symbol()
				.size(function (d) {
					return Math.PI * Math.pow(nominal_base_node_size, 2);
				})
				.type(function (d) {
					return "circle"; /*d.type;*/
				}));
		//console.log("1");
		/*d3.selectAll(".node").select("path")
		.attr("d", d3.svg.symbol()
		.size(function(d) {
			thisNodeSize = size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize])))));
			return Math.PI*Math.pow( thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size,2);
			//return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize]))))) || nominal_base_node_size,2);
		})
		.type(function(d) { return "circle"; }))
		;*/


	} else if ($(this).val() === '2') { //Node size based on proteomic logFC

		nodeSize = 'proteomics_fc';
		nodeSize_sel = nodeSize;
		nodeSizeScale = nodeSizeScaleFC;
		d3.select("#GlogFCInput4Size").style("display", "none");
		d3.select("#PlogFCInput").style("display", "block");
		d3.select("#traitInput4Size").style("display", "none");
		d3.select("#gwasInput4Size").style("display", "none");
		$("#PlogFCID4Size").val('none');
		d3.selectAll(".node").select("path")
			.attr("d", d3.svg.symbol()
				.size(function (d) {
					return Math.PI * Math.pow(nominal_base_node_size, 2);
				})
				.type(function (d) {
					return "circle"; /*d.type;*/
				}));
		/* d3.selectAll(".node").select("path")
		  .attr("d", d3.svg.symbol()
		   //.size(function(d) { return 600 })
		   //.size(function(d) { return Math.PI*Math.pow(nominal_base_node_size,2); })
		   .size(function(d) {
			   thisNodeSize = size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize])))));
			   return Math.PI*Math.pow( thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size,2);
			   //return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize]))))) || nominal_base_node_size,2);
		   })
		   .type(function(d) { return "circle"; }))
		   ; */

	} else if ($(this).val() === '3') { //Node size based on p-values from trait

		nodeSizeScale = nodeSizeScalePval;
		d3.select("#GlogFCInput4Size").style("display", "none");
		d3.select("#PlogFCInput").style("display", "none");
		d3.select("#gwasInput4Size").style("display", "none");
		d3.select("#traitInput4Size").style("display", "block");
		$("#traitID4Size").val('none');
		d3.selectAll(".node").select("path")
			.attr("d", d3.svg.symbol()
				.size(function (d) {
					return Math.PI * Math.pow(nominal_base_node_size, 2);
				})
				.type(function (d) {
					return "circle"; /*d.type;*/
				}));


	} else if ($(this).val() === '4') { //Node size based on p-values from trait

		nodeSizeScale = nodeSizeScalePval;
		d3.select("#GlogFCInput4Size").style("display", "none");
		d3.select("#gwasInput4Size").style("display", "block");
		d3.select("#PlogFCInput").style("display", "none");
		d3.select("#traitInput4Size").style("display", "none");
		$("#traitID4Size").val('none');
		d3.selectAll(".node").select("path")
			.attr("d", d3.svg.symbol()
				.size(function (d) {
					return Math.PI * Math.pow(nominal_base_node_size, 2);
				})
				.type(function (d) {
					return "circle"; /*d.type;*/
				}));


	}
	d3.selectAll("text.text").attr("dx", function (d) { //Change the position of label according to node size
		// console.log("nodeSize", d[nodeSize]);
		return (size(nodeSizeScale(Math.abs(Number(d[nodeSize])))) || nominal_base_node_size);

	})

});




//radial analysis

$("input[name='radialAnylisis']").change(function () {
	radialAnylisis = '';

	if ($(this).val() === '0') {
		$('.slidecontainer').hide();
	} else if ($(this).val() === '1') {
		$('.slidecontainer').hide();
		$('#EdgeWeightCutOffRange').show();
	} else if ($(this).val() === '2') {
		$('.slidecontainer').hide();
		$('#nodeDegreeInput4Size').show();
	} else if ($(this).val() === '3') {
		$('.slidecontainer').hide();
		$('#HubGenesRange').show();
	}

});


// force setting
$("input[name='force_setting']").change(function () {
	force_setting = '';

	if ($(this).val() === '0') {
		$('.forcecontainer').hide();
	} else if ($(this).val() === '1') {
		$('.forcecontainer').hide();
		$('#linkdistanceRange').show();
	} else if ($(this).val() === '2') {
		$('.forcecontainer').hide();
		$('#linkchargeRange').show();
	} else if ($(this).val() === '3') {
		$('.forcecontainer').hide();
		$('#linkStrengthRange').show();
	}

})


// network parameters
$("input[name='network_parameters']").change(function () {

	if ($(this).val() === '0') {
		$('.networkcontainer').hide();
	} else if ($(this).val() === '1') {
		$('.networkcontainer').hide();
		$('#color_range').show();
	} else if ($(this).val() === '2') {
		$('.networkcontainer').hide();
		$('#opacity_range').show();
	} else if ($(this).val() === '3') {
		$('.networkcontainer').hide();
		$('#node_size').show();
	} else if ($(this).val() === '4') {
		$('.networkcontainer').hide();
		$('#text_size').show();
	} else if ($(this).val() === '5') {
		$('.networkcontainer').hide();
		$('#zoom_network').show();
	}


})


// color scheme values and output
function colorFinc() {
	var red = document.getElementById("redRange");
	var blue = document.getElementById("greenRange");
	var green = document.getElementById("blueRange");
	var color_ouput = document.getElementById("color_ouput");
	var rRange = document.getElementById("rRange");
	var gRange = document.getElementById("gRange");
	var bRange = document.getElementById("bRange");

	rRange.innerHTML = red.value
	gRange.innerHTML = blue.value
	bRange.innerHTML = green.value

	color_ouput.style.background = `rgb(${red.value},${blue.value},${green.value})`
	default_node_color = `rgb(${red.value},${blue.value},${green.value})`

	d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
		return default_node_color;
	});

}

// link opacity
function opacityFunc() {
	var opacityRange = document.getElementById("opacityRange");

	var oRange = document.getElementById("oRange");
	oRange.innerHTML = opacityRange.value
	link.style("opacity", opacityRange.value)
}

// node size change
function nodeSizeFunc() {
	var nodeRange = document.getElementById("nodeRange");

	var nRange = document.getElementById("nRange");
	nRange.innerHTML = nodeRange.value
	nominal_base_node_size = nodeRange.value
	// link.style("opacity", nodeRange.value)
	d3.selectAll(".node").select("path")
		.attr("d", d3.svg.symbol()
			.size(function (d) {
				return Math.PI * Math.pow(nominal_base_node_size, 2);
			})
			.type(function (d) {
				return "circle"; /*d.type;*/
			}));
}

// zoom range

function zoomClick() {
	var width = window.innerWidth,
		height = window.innerHeight;
	// console.log('TARGET:', d3.event.target)
	// var clicked = d3.event.target;
	// console.log(d3.event)
	d3.attr("zoom", function () {
		// console.log("kdmf")
	})

}
d3.selectAll('.zoom_btn').on('click', zoomClick);

// Getting the text value anyTime
function getTextRangeVal() {
	var textRange = document.getElementById("textRange");
	console.log('tZ->', textRange.value)
}

// text size chnage
function textSizeFunc() {
	var textRange = document.getElementById("textRange");

	var tRange = document.getElementById("tRange");
	tRange.innerHTML = textRange.value
	max_text_size = textRange.value
	// link.style("opacity", opacityRange.value)
	nominal_text_size = textRange.value
	text.style("font-size", nominal_text_size + "px");
}
// reset layoyt
function resetLayout() {
	linkdistanceinput.innerHTML = 15
	linkchargeinput.innerHTML = -200
	linkStrengthinput.innerHTML = 20

	force.linkDistance(15)
		.charge(-200)
		.distance(20)

	force.start()
}

// reset parameters
function reset_param() {
	var red = document.getElementById("redRange");
	var blue = document.getElementById("greenRange");
	var green = document.getElementById("blueRange");
	var color_ouput = document.getElementById("color_ouput");
	var rRange = document.getElementById("rRange");
	var gRange = document.getElementById("gRange");
	var bRange = document.getElementById("bRange");

	red.value = 23
	blue.value = 190
	green.value = 207
	rRange.innerHTML = 23
	gRange.innerHTML = 190
	bRange.innerHTML = 207
	color_ouput.style.background = "rgb(23, 190, 207)"
	default_node_color = "rgb(23, 190, 207)"

	d3.selectAll("stop[offset='100%']").style("stop-color", function (d) {
		return default_node_color;
	});
	var textRange = document.getElementById("textRange");
	textRange.value = 8;
	var tRange = document.getElementById("tRange");
	tRange.innerHTML = 8;

	// link.style("opacity", opacityRange.value)
	nominal_text_size = 8;
	text.style("font-size", nominal_text_size + "px");

	var nodeRange = document.getElementById("nodeRange");
	var nRange = document.getElementById("nRange");
	nodeRange.value = 8;
	nRange.innerHTML = 8;
	nominal_base_node_size = 8;
	max_text_size = 10
	// link.style("opacity", nodeRange.value)
	d3.selectAll(".node").select("path")
		.attr("d", d3.svg.symbol()
			.size(function (d) {
				return Math.PI * Math.pow(nominal_base_node_size, 2);
			})
			.type(function (d) {
				return "circle"; /*d.type;*/
			}));


	var opacityRange = document.getElementById("opacityRange");
	opacityRange.value = 1
	var oRange = document.getElementById("oRange");
	oRange.innerHTML = 1
	link.style("opacity", 1)
}


// on seleting node cutoff , change in node degree and relevence

document.getElementById("nodeDegreeID4Size").onchange = function () {
	var cutoff_type = document.getElementById("nodeDegreeID4Size").value;

	if (cutoff_type == "node_degree") {
		$("#NodeDegreeRange").show()
	} else {
		$("#NodeDegreeRange").hide()
	}
}

//on selecting Genomic LogFC, change the size of nodes

document.getElementById("GlogFCID4Size").onchange = function () {

	// uniNode.genes[d.id][uniNode.headers[nodeSize]]
	nodeSize = document.getElementById("GlogFCID4Size").value;
	nodeSize_sel = nodeSize;

	nodeSizeScale = getNodeSizeScale(nodeSize_sel);

	d3.selectAll(".node").select("path")
		.attr("d", d3.svg.symbol()
			//.size(function(d) { return 600 })
			//.size(function(d) { return Math.PI*Math.pow(nominal_base_node_size,2); })
			.size(function (d) {

				//thisNodeSize = size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize])))));
				//console.log(uniNode.genes[d.id])
				//thisNodeSize = uniNode.genes[d.id] ? size(nodeSizeScale(Math.pow(2,Math.abs(Number(uniNode.genes[d.id][uniNode.headers[nodeSize]]))))) : "";
				thisNodeSize = uniNode.genes[d.id] ?
					size(nodeSizeScale(typeof uniNode.genes[d.id][uniNode.headers[nodeSize_sel]] == "number" ? Math.abs(uniNode.genes[d.id][uniNode.headers[nodeSize_sel]]) : 0)) :
					"";
				return Math.PI * Math.pow(thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size, 2);
				//return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize]))))) || nominal_base_node_size,2);
			})
			.type(function (d) {
				return "circle"; /*d.type;*/
			}));



}

//on selecting Proteomic LogFC, change the size of nodes

document.getElementById("PlogFCID4Size").onchange = function () {


	nodeSize = document.getElementById("PlogFCID4Size").value;
	nodeSize_sel = nodeSize;

	nodeSizeScale = getNodeSizeScale(nodeSize_sel);

	d3.selectAll(".node").select("path")
		.attr("d", d3.svg.symbol()
			//.size(function(d) { return 600 })
			//.size(function(d) { return Math.PI*Math.pow(nominal_base_node_size,2); })
			.size(function (d) {

				//thisNodeSize = size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize])))));
				//console.log(uniNode.genes[d.id])
				thisNodeSize = uniNode.genes[d.id] ?
					size(nodeSizeScale(typeof uniNode.genes[d.id][uniNode.headers[nodeSize_sel]] == "number" ? Math.abs(uniNode.genes[d.id][uniNode.headers[nodeSize_sel]]) : 0)) :
					"";
				return Math.PI * Math.pow(thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size, 2);
				//return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize]))))) || nominal_base_node_size,2);
			})
			//.logFC(function(d) {
			//CKECK FROM
			//	return  uniNode.genes[d.id] ? size(nodeSizeScale(Math.pow(2,Math.abs(Number(uniNode.genes[d.id][uniNode.headers[nodeSize]]))))) : "";
			//})
			.type(function (d) {
				return "circle"; /*d.type;*/
			}));



}

//on selecting trait name, change the size of nodes

document.getElementById("traitID4Size").onchange = function () {


	nodeSize = document.getElementById("traitID4Size").value;
	nodeSize_sel = nodeSize;

	nodeSizeScale = getNodeSizeScale(nodeSize_sel);

	d3.selectAll(".node").select("path")
		.attr("d", d3.svg.symbol()
			//.size(function(d) { return 600 })
			//.size(function(d) { return Math.PI*Math.pow(nominal_base_node_size,2); })
			.size(function (d) {

				//thisNodeSize = size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize])))));
				//console.log(uniNode.genes[d.id])
				thisNodeSize = uniNode.genes[d.id] ?
					size(nodeSizeScale(typeof uniNode.genes[d.id][uniNode.headers[nodeSize_sel]] == "number" ? Math.abs(uniNode.genes[d.id][uniNode.headers[nodeSize_sel]]) : 0)) :
					"";
				return Math.PI * Math.pow(thisNodeSize > max_base_node_size ? max_base_node_size : thisNodeSize || nominal_base_node_size, 2);
				//return Math.PI*Math.pow(size(nodeSizeScale(Math.pow(2,Math.abs(Number(d[nodeSize]))))) || nominal_base_node_size,2);
			})
			.type(function (d) {
				return "circle"; /*d.type;*/
			}));



}

//Gradient Legend for the network

var svg2 = d3.select("div#legendPanel").append("svg").attr("width", 150).attr("height", 100).attr("class", "legendSVG");

var legendExpression = svg2.append("g").attr("class", "legendExpression")
	.attr("transform", "translate(50,0)")
	.style("font-size", "18px");

var color = d3.scale.category10();
var linear = d3.scale.linear()
	.domain([0, 5, 10])
	.range(["red", default_node_color, "green"]);
//.range(["red", "rgb(105,105,105)", "green"]);


var legendExpression = d3.legend.color()
	.shapeWidth(10)
	.shapeHeight(10)
	.cells([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
	.shapePadding(0)
	.labelOffset(10)
	.scale(linear)
	//.orient("horizontal")
	.labels(["Up", "", "", "", "Baseline", "", "", "", "", "Down"])
	.labelAlign("start");

svg2.select(".legendExpression")
	.call(legendExpression);

d3.select(".legendExpression").attr("opacity", 0);


//Circle legend

var nodeColorScale = d3.scale.ordinal().domain(["UP", "NONE", "DOWN"]).range(["red", default_node_color, "green"]);


var legendDirection = svg2.append("g").attr("class", "legendDirection")
	.attr("transform", "translate(40,10)")
	.style("font-size", "18px");

// Node color legend
//footer.append("g")
//.attr("class", "legendColor")
//.attr("transform", "translate(20,20)");

var legendDirection = d3.legend.color()
	.shape("circle")
	.shapeRadius(10)
	.shapePadding(15)
	.orient('vertical')
	.scale(nodeColorScale);

svg2.select(".legendDirection").call(legendDirection);


var nodeColorScalePathway = d3.scale.ordinal().domain(["Present", "Not-present"]).range(["red", default_node_color]);
svg2.append("g").attr("class", " legendPathway")
	.attr("transform", "translate(20,10)")
	.style("font-size", "18px");

var legendPathway = d3.legend.color()
	.shape("circle")
	.shapeRadius(10)
	.shapePadding(15)
	.orient('vertical')
	.scale(nodeColorScalePathway);

svg2.select(".legendPathway").call(legendPathway);
d3.select(".legendPathway").attr("opacity", 0);

function settingFunc() {
	var x = document.getElementById("mysetting");
	// console.log(x.style.display)
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
}
// d3.selectAll('circle')
// .on('click', function(d, i) {
// 	d3.select('.status')
// 	.text('You clicked on circle ' + i, d);
// });