cubism_contextPrototype.lineCard = function() {
	var context = this, margin = {top: 20, right: 20, bottom: 30, left: 50}, offset = 330 * 60 * 1000;

	function lineCard (selection) {
        selection.append("h2")
            .attr("class", "value");

        selection.append("span")
            .attr("class", "title")
            .text(function(d){ return d.title; });

		selection.each(function(nodeData, i){
			var that = this, $that = $(this), metric_ = lineCard.start(nodeData);

			var timer  = null, range, step = context.step(), now = Date.now(),
				width = $that.width() - margin.left - margin.right,
			    height = Math.max($that.height(), 300) - margin.top - margin.bottom;

            range = [new Date(now - step * context.size() - offset), new Date(now - offset)];

			var parseDate = d3.time.format("%d-%b-%y").parse;

			var x = d3.time.scale()
			    .range([0, width]);

			var y = d3.scale.linear()
			    .range([height, 0]);

			var line = d3.svg.line()
			    .x(function(d) { 
			    	return x(d.time); 
			    })
			    .y(function(d) { 
			    	return y(d.value); 
			    });

			var svg = d3.select(that).append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	        var xaxis = svg.append("g")
	            .attr("class", "x axis")
	            .attr("transform", "translate(0," + height + ")")
	            .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

	        var yaxis = svg.append("g")
	            .attr("class", "y axis")
	            .call(y.axis = d3.svg.axis().scale(y).orient("left"));
	            
	        yaxis.append("text")
	            .attr("transform", "rotate(-90)")
	            .attr("y", 6)
	            .attr("dy", ".71em")
	            .style("text-anchor", "end")
	            .text(nodeData.title);

			var path = svg.append("g")
	            .attr("clip-path", "url(#clip)")
	            .append("path")
	            .data([[]])
	            .attr("class", "line");

	        var pointers = svg.append("g")
	        	.selectAll("circle.pointer")
	        	.data([1,2,3]);

            pointers
            	.enter().append("circle")
            	.attr("r", 2);

			function change(data){
                now = Date.now();
                range = [new Date(now - step * context.size() - offset), new Date(now - offset)];

				x.domain(d3.extent(data, function(d) { return d.time; }));
				y.domain(d3.extent(data, function(d) { return d.value; }));

	            xaxis.call(x.axis);
	            yaxis.call(y.axis);

	            path
	                .data([data])
	                .attr("d", line)
	                .attr("transform", null);

	            pointers.data([3,4,5,6,7,7,8,9]);

                timer && clearTimeout(timer);
                timer = setTimeout(function() {
                    metric_(range[0], range[1], step, change);
                }, nodeData.update);

			}

			metric_(range[0], range[1], step, change);
		});

	}

    /* Getter setter methods for internal properties */

    lineCard.title = function(_){
        if (!arguments.length) return title;
        title = _;
        return lineCard;
    };

    lineCard.update = function(_){
        if (!arguments.length) return update;
        update = _;
        return lineCard;
    };

    lineCard.metric = function(_){
        if (!arguments.length) return metric;
        metric = _;
        return lineCard;
    };


    lineCard.start = function(d){
        var that = this;
        return function(start, stop, step, callback) {
            d3.json("/1.0/metric"
                + "?expression=" + encodeURIComponent(metric.call(that, d))
                + "&start=" + start
                + "&stop=" + stop
                + "&step=" + context.step(), function(data) {
                    if (!data) return callback(new Error("unable to load data"));
                    data = data.map(function(d, i){
                        // Convert the date time back to the one specified by out IST timezone
                        return {time: cubism_cubeFormatDate.parse(d.time), value: d.value};
                    });
                    callback(data);
                });
        };
    };


	return lineCard;
};