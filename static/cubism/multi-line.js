cubism_contextPrototype.mlCard = function() {
	var context = this, margin = {top: 20, right: 20, bottom: 30, left: 50}, offset = 330 * 60 * 1000,
		paths = [], metric_generators = [], times, values, color = d3.scale.category10();

	function mlCard (selection) {
        selection.append("h2")
            .attr("class", "value");

        selection.append("span")
            .attr("class", "title")
            .text(function(d){ return d.title; });

        // SyncMe -> get it? hahaha
		var that = selection.node(), $that = $(that), syncMe, legends,
			width = $that.width() - margin.left - margin.right, clipPath,
		    height = Math.max($that.height(), 300) - margin.top - margin.bottom;

		var timer  = null, range, step = context.step(), now = Date.now(),
			x = d3.time.scale().range([0, width]),
			y = d3.scale.linear().range([height, 0]), 
			line, svg, xaxis, yaxis;
		
		line = d3.svg.line()
		    .x(function(d) { 
		    	return x(d.time); 
		    })
		    .y(function(d) { 
		    	return y(d.value); 
		    });

		svg = selection.append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		legends = svg.append("g")
			.attr("class", "legend")
			.attr("transform", "translate(" + (width-margin.right) + "," + 0 + ")");

        xaxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

        yaxis = svg.append("g")
            .attr("class", "y axis")
            .call(y.axis = d3.svg.axis().scale(y).orient("left"));
            
        yaxis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(function(d){ return d.title; });

		clipPath = svg.append("g")
            .attr("clip-path", "url(#clip)")

        range = [new Date(now - step * context.size()), new Date(now)];

		function change(){
            now = Date.now();
            range = [new Date(now - step * context.size()), new Date(now)];

			x.domain(d3.extent(times));
			y.domain(d3.extent(values));

            xaxis.call(x.axis);
            yaxis.call(y.axis);

            paths.forEach(function(thisone){
            	thisone
	                .attr("d", line)
	                .attr("transform", null);
            });

            timer && clearTimeout(timer);
            timer = setTimeout(function(){
            	sync(range[0], range[1], step, metric_generators, change);
            }, 1e4);

		}

		selection.each(function(nodeData){
			nodeData.forEach(function(ddata, i){
				var metric_ = mlCard.start.bind(null, ddata, i), path;
				
				path = clipPath
		            .append("path")
		            .data([[]])
		            .attr("fill", "none")
		            .attr("stroke-width", 1.5)
		            .attr("stroke", color(i));
				legends.append("rect")
					.attr("y", i * 20)
					.attr("width", 18)
					.attr("height", 18)
					.style("fill", color(i));
				legends.append("text")
					.attr("y", i * 20)
					.attr("dy", "1.35em")
					.attr("dx", "-.45em")
					.style("text-anchor", "end")
					.text(ddata.title);
				
				metric_generators.push(metric_);
		        // Keep in mind, this is also the order of the generators
		        paths.push(path);
			});
		});

		/*metric_(range[0], range[1], step, change);*/
		/*sync(metric_generators, change);*/
		sync(range[0], range[1], step, metric_generators, change);
	}

	/*
		Get all the ajax requests we need to plot the multi line 
		One tick = once when all concurrent ajax requests complete.
	*/
	function sync (start, stop, step, generators, callback) {
		times = [];
		values = [];
		$.when.apply(null, generators.map(function(g){ 
			return g()(start, stop, step); 
		}))
		.then(function(){
			callback && callback();
		});	
	}

    /* Getter setter methods for internal properties */

    mlCard.title = function(_){
        if (!arguments.length) return title;
        title = _;
        return mlCard;
    };

    mlCard.update = function(_){
        if (!arguments.length) return update;
        update = _;
        return mlCard;
    };

    mlCard.metric = function(_){
        if (!arguments.length) return metric;
        metric = _;
        return mlCard;
    };


    mlCard.start = function(d, i){
        var that = this;
        return function(start, stop, step) {
        	return $.ajax({
        		type: "GET",
        		url: "/1.0/metric",
        		data: {
        			expression: d.metric,
        			start: cubism_cubeFormatDate(start),
        			stop: cubism_cubeFormatDate(stop),
        			step: context.step()
        		}
        	}).
        	then(function(data){
        		if (!data) return new Error("unable to load data for " + d.metric);
                data = data.map(function(dd, ii){
                    // Convert the date time back to the one specified by out IST timezone
                    return {time: cubism_cubeFormatDate.parse(dd.time), value: dd.value};
                });
                paths[i].data([data]);
                times = times.concat(data.map(function(dd){ return dd.time }));
                values = values.concat(data.map(function(dd){ return dd.value }));
        	});
        };
    };


	return mlCard;
};