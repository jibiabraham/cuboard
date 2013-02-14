cubism_contextPrototype.line = function() {
    var context = this,
        margin = {top: 6, right: 0, bottom: 20, left: 40},
        width = 960 - margin.right,
        height = 500 - margin.top - margin.bottom,
        metric = cubism_identity,
        title = cubism_identity,
        extent = null,
        duration = 750,
        format = d3.format("1f");

    function line (selection){

        selection.each(function(d, i){
            var that = this,
                id = ++cubism_id,
                metric_ = typeof metric === "function" ? metric.call(that, d, i) : metric,
                extent_ = typeof extent === "function" ? extent.call(that, d, i) : extent,
                start = -Infinity, step = context.step(), max_,
                now = new Date(), size = context.size() || 960,
                x = d3.time.scale().range([0, width]),
                y = d3.scale.linear().interpolate(d3.interpolateRound).range([height, 0]);
                

            var svgLine = d3.svg.line()
                .interpolate("basis")
                .x(function(d, i) { 
                    return x(now - (metric_.valuesLength() - 1 - i) * duration); 
                })
                .y(function(d, i) { return y(d); });


            var svg = d3.select("body").append("p").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("margin-left", -margin.left + "px")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            var axis = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));

            var path = svg.append("g")
                .attr("clip-path", "url(#clip)")
                .append("path")
                .attr("class", "line");


            function change(start1, stop) {
                var extent = metric_.extent();
                if (extent_ != null) extent = extent_;

                // update the domains
                now = new Date();
                x.domain([now - 100000, now]);
                console.log(x.domain());
                y.domain([0, max_ = Math.max(-extent[0], extent[1])]);

                // redraw the line
                path
                    .attr("d", svgLine(metric_.values()))
                    .attr("transform", null);

                // slide the x-axis left
                axis.transition()
                    .duration(duration)
                    .ease("linear")
                    .call(x.axis);

                // slide the line left
                path.transition()
                    .duration(duration)
                    .ease("linear")
                    .attr("transform", "translate(" + x(now - 100000) + ")");

            }

            metric_.on("change.line-" + id, change);
        })
    }

    /* Getter setter methods for internal properties */

    line.metric = function(_) {
        if (!arguments.length) return metric;
        metric = _;
        return line;
    };

    line.title = function(_) {
        if (!arguments.length) return title;
        title = _;
        return line;
    };

    line.scale = function(_) {
        if (!arguments.length) return scale;
        scale = _;
        return line;
    };

    line.extent = function(_) {
        if (!arguments.length) return scale;
        scale = _;
        return line;
    };

    line.format = function(_) {
        if (!arguments.length) return format;
        format = _;
        return line;
    };

    return line;

};