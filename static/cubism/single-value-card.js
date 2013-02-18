cubism_contextPrototype.svCard = function() {
    // Closure variables
    var 
        context = this,

        title = null,
        metric = null,
        update = 1e4,
        offset = 330 * 60 * 1000,

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
    function svCard (selection) {
        selection.append("h2")
            .attr("class", "value");

        selection.append("span")
            .attr("class", "title")
            .text(function(d){ return d.title; });

        /*selection.append("span")
            .attr("class", "timestamp")
            .text(function(d){ return ", " + timestampFormat(new Date()); });*/

        selection.each(function(d, i){
            var that = this, timer  = null, range, step = context.step(), now = Date.now(), metric_ = svCard.start(d);

            range = [new Date(now - step - offset), new Date(now - offset)];

            // On next data point
            function change (data) {
                now = Date.now();
                range = [new Date(now - step - offset), new Date(now - offset)];

                d3.select(that).select(".value")
                .text(function(){ 
                    var value = +data.pop().value;
                    return (d.format || format)(value);
                });
                /*d3.select(that).select(".timestamp")
                .text(function(){ return ", " + timestampFormat(new Date()); });*/

                timer && clearTimeout(timer);
                timer = setTimeout(function() {
                    metric_(range[0], range[1], step, change);
                }, update(d));
            }

            metric_(range[0], range[1], step, change);
        });
    }

    /* Getter setter methods for internal properties */

    svCard.title = function(_){
        if (!arguments.length) return title;
        title = _;
        return svCard;
    };

    svCard.update = function(_){
        if (!arguments.length) return update;
        update = _;
        return svCard;
    };

    svCard.metric = function(_){
        if (!arguments.length) return metric;
        metric = _;
        return svCard;
    };

    svCard.start = function(d){
        var that = this;
        return function(start, stop, step, callback) {
            d3.json("/1.0/metric"
                + "?expression=" + encodeURIComponent(metric.call(that, d))
                + "&start=" + start
                + "&stop=" + stop
                + "&step=" + step, function(data) {
                    if (!data) return callback(new Error("unable to load data"));
                    data = data.map(function(d, i){
                        // Convert the date time back to the one specified by out IST timezone
                        return {time: cubism_cubeFormatDate.parse(d.time), value: d.value};
                    });
                    callback(data);
                });
        };
    };


    return svCard;
};