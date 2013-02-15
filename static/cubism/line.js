cubism_contextPrototype.line = function() {
    var context = this, title, metric, start, stop, tFormat = d3.time.format("%Y-%m-%d %X"), timer,
        width = 960, height = 400, margin = {top: 6, right: 0, bottom: 20, left: 40};

    function line (data){
        var updateCounter = 0;

        // Setup the initial data
        line.title(data.title);
        line.metric(data.metric);
        line.start(data.start);
        line.stop(tFormat(new Date("2013-02-16")));
        line.update(data.update);

        // Setup the chart base
        var id = ++cubism_id,
            x = d3.time.scale().range([0, width]), pathData = [],
            y = d3.scale.linear().interpolate(d3.interpolateRound).range([height, 0]),
            now = new Date(), step = context.step(), resolution = line.resolution(), max = 0;

        x.domain([now - (step * resolution), now]);
        var svgLine = d3.svg.line()
            .interpolate("basis")
            .x(function(d, i) { 
                return x(d.time) ;
            })
            .y(function(d, i) { 
                return y(d.value); 
            });


        var svg = d3.select("body").append("p").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var xaxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

        var yaxis = svg.append("g")
            .attr("class", "y axis")
            .call(y.axis = d3.svg.axis().scale(y).orient("left"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(data.title);

        var path = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .data([pathData])
            .attr("class", "line");

        function update(data, i){
            // Verify that we're dealing with the latest set of data
            if (updateCounter !== i){ return }

            now = new Date();
            max = Math.max(max, d3.max(data, function(d){ return d.value }));
            x.domain([now - (step * resolution), now]);
            y.domain([0, max]);
            pathData = data;

            path
                .data([data])
                .attr("d", function(d, i){
                    return svgLine(d);
                })
                .attr("transform", null);

            // slide the x-axis left
            xaxis.call(x.axis);
            yaxis.call(y.axis);


            // slide the line left
            /*path.transition()
                .duration(750)
                .ease("linear")
                .attr("transform", "translate(" + width - x(now - step- line.update()) + ")");*/

            // Setup a timer to update the data
            timer && clearTimeout(timer);
            timer = setTimeout(function() {
                ++updateCounter;
                line.source(update, updateCounter);
            }, line.update());
        }

        // Get the first set of data immediately
        ++updateCounter;
        line.source(update, updateCounter);
        xx = line;
    }

    // Getter setter methods for each line

    line.context = function(_){
        if (!arguments.length) return context;
        context = _;
        return line;
    };

    line.title = function(_){
        if (!arguments.length) return title;
        title = _;
        return line;
    };

    line.metric = function(_){
        if (!arguments.length) return metric;
        metric = _;
        return line;
    };

    line.start = function(_){
        if (!arguments.length) return start;
        start = tFormat.parse(_);
        return line;
    };

    line.stop = function(_){
        if (!arguments.length) return stop;
        stop = tFormat.parse(_);
        return line;
    };

    // Update frequency
    line.update = function(_){
        if (!arguments.length) return update;
        update = _;
        return line;
    };

    // Number of data points to be plotted
    line.resolution = function(_){
        if (!arguments.length) return context.size();
        return line;
    };

    line.offset = function(_){
        if (!arguments.length) return offset;
        if (_ === "start"){
            return new Date(this.start().getTime() + this.offset());
        }
        if (_ === "stop"){
            return new Date(this.stop(tFormat(new Date())).stop().getTime() + this.offset());
        }
        offset = _;
        return line;  
    },

    line.source = function(callback, i){
      d3.json("" + "/1.0/metric"
          + "?expression=" + encodeURIComponent(this.metric())
          + "&start=" + cubism_cubeFormatDate(this.start())
          + "&stop=" + cubism_cubeFormatDate(this.stop())
          + "&step=" + context.step(), function(data) {
        if (!data) return callback(new Error("unable to load data"));
        data = data.map(function(d, i){
            // Convert the date time back to the one specified by the offset
            return {time: new Date(cubism_cubeFormatDate.parse(d.time) + line.offset()), value: d.value}
        });
        callback(data, i);
      });
    }

    return line;

};