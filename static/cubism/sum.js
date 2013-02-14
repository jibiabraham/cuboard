cubism_contextPrototype.sum = function() {
    // Closure variables
    var 
        // Kind of like our data provider (i think)
        context = this,

        // The width && height of our stage - fixed for now
        width = 100,
        height = 100,

        // The metric we're plotting (attempting)
        metric = cubism_identity,
        title = cubism_identity,
        extent = null,

        // Pretty formatter for the chart value
        format = d3.format("1f"),

        timestampFormat = d3.time.format("%X");

        /* We'll add interpolator here later on, need to figure it out all over again */
        /* color = */

    /*
        Our graph prototype.
        Call it like -> context.sum(selection) 
        Generally, you won't need to specify selection if used with d3(selection).call()
    */
    function sum (selection) {
        selection.append("h2")
            .attr("class", "value");

        selection.append("span")
            .attr("class", "title")
            .text(function(d){ return d.title; });

        selection.append("span")
            .attr("class", "timestamp")
            .text(function(d){ return ", " + timestampFormat(new Date()); });

        selection.each(function(d, i){
          var that = this,
              id = ++cubism_id,
              metric_ = typeof metric === "function" ? metric.call(that, d, i) : metric;

          /* React to next set of data */
          function change (start, stop) {
              d3.select(that).select(".value")
                .text(function(){ return format(metric_.valueAt(metric_.valuesLength() - 1)) });
              d3.select(that).select(".timestamp")
                .text(function(){ return ", " + timestampFormat(new Date()); });
          }

          /*context.on("change.sum-" + id, change);*/
          metric_.on("change.sum-" + id, change);
        });
    }

    /* Getter setter methods for internal properties */

    sum.metric = function(_) {
        if (!arguments.length) return metric;
        metric = _;
        return sum;
    };

    sum.title = function(_) {
        if (!arguments.length) return title;
        title = _;
        return sum;
    };

    sum.scale = function(_) {
        if (!arguments.length) return scale;
        scale = _;
        return sum;
    };

    sum.extent = function(_) {
        if (!arguments.length) return scale;
        scale = _;
        return sum;
    };

    sum.format = function(_) {
        if (!arguments.length) return format;
        format = _;
        return sum;
    };

    return sum;
};