cubism_contextPrototype.tiles = function() {
    // Closure variables
    var 
        context = this,

        title = null,
        metric = null,
        over = 7 * 24 * 60 * 60 * 1000,
        update = 1e4,
        offset = 330 * 60 * 1000,

        // Pretty formatter for the chart value
        format = d3.format("1f"),

        timestampFormat = d3.time.format("%X"),
          
        days = [
            { name: 'Monday', abbr: 'Mo' },
            { name: 'Tuesday', abbr: 'Tu' },
            { name: 'Wednesday', abbr: 'We' },
            { name: 'Thursday', abbr: 'Th' },
            { name: 'Friday', abbr: 'Fr' },
            { name: 'Saturday', abbr: 'Sa' },
            { name: 'Sunday', abbr: 'Su' }
        ],
          
        hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];

        /* We'll add interpolator here later on, need to figure it out all over again */
        /* color = */

    /*
        Our graph prototype.
        Call it like -> context.sum(selection) 
        Generally, you won't need to specify selection if used with d3(selection).call()
    */
    function tiles (selection) {
      	// Loop through the attached data
        selection.each(function(data){
            var that = this, range, step = context.step(), now = Date.now();
            range = [new Date(now - (7*24*60*60*1000) - offset), new Date(now - offset)];
            
            data.forEach(function(d, i){
                var metric_ = tiles.start(d), card;

                card = selection.append("div")
                    .attr("class", "row-fluid tile_layout")
                    .append("div")
                    .attr("class", "span12")
                    .call(createTiles.bind(null, d, i));

                metric_(range[0], range[1]).
                    then(function(response){
                        card.datum(groupResponse(response));
                    });
            });
        });
    }

    function groupResponse(response){
        var data = [], interim = {};
        response.forEach(function(d, i){
            var key = "a_" + (i%7);
            if (!interim[key]){
                interim[key] = [];
            }
            interim[key].push(d);
        });
        for (var key in interim){
            data.push(interim[key]);
        }
        return data;
    }

    function createTiles(d, index, card) {

        var html = '<table id="tiles" class="front">';
        html += '<tr><th><div>&nbsp;</div></th>';

        for (var h = 0; h < hours.length; h++) {
            html += '<th class="h' + h + '">' + hours[h] + '</th>';
        }

        html += '</tr>';

        for (var d = 0; d < days.length; d++) {
            html += '<tr class="d' + d + '">';
            html += '<th>' + days[d].abbr + '</th>';
            for (var h = 0; h < hours.length; h++) {
                html += '<td id="d' + d + 'h' + h + 'i' + index + '" class="d' + d + ' h' + h + '"><div class="tile"><div class="face front"></div><div class="face back"></div></div></td>';
            }
            html += '</tr>';
        }

        html += '</table>';
        card.html(html);

        return card;
    }


    /* ************************** */

    function reColorTiles(state, view) {
        
        var calcs = getCalcs(state, view),
            range = [];
        
        for (var i = 1; i <= buckets; i++) {
            range.push(i);
        }
        
        var bucket = d3.scale.quantize().domain([0, calcs.max > 0 ? calcs.max : 1]).range(range),
            side = d3.select('#tiles').attr('class');
        
        
        if (side === 'front') {
            side = 'back';
        } else {
            side = 'front';
        }
        
        for (var d = 0; d < data[state].views.length; d++) {
            for (var h = 0; h < data[state].views[d].length; h++) {

                var sel = '#d' + d + 'h' + h + ' .tile .' + side,
                    val = data[state].views[d][h].pc + data[state].views[d][h].mob;
                
                if (view !== 'all') {
                    val = data[state].views[d][h][view];
                }
                
                // erase all previous bucket designations on this cell
                for (var i = 1; i <= buckets; i++) {
                    var cls = 'q' + i + '-' + buckets;
                    d3.select(sel).classed(cls , false);
                }
                
                // set new bucket designation for this cell
                var cls = 'q' + (val > 0 ? bucket(val) : 0) + '-' + buckets;
                d3.select(sel).classed(cls, true);
            }
        }
        flipTiles();
        if (isOldBrowser() === false) {
            drawHourlyChart(state, 3);
        }
    }

    /* ************************** */

    function flipTiles() {

        var oldSide = d3.select('#tiles').attr('class'),
            newSide = '';
        
        if (oldSide == 'front') {
            newSide = 'back';
        } else {
            newSide = 'front';
        }
        
        var flipper = function(h, d, side) {
            return function() {
                var sel = '#d' + d + 'h' + h + ' .tile',
                    rotateY = 'rotateY(180deg)';
                
                if (side === 'back') {
                    rotateY = 'rotateY(0deg)';  
                }
                if (browser.browser === 'Safari' || browser.browser === 'Chrome') {
                    d3.select(sel).style('-webkit-transform', rotateY);
                } else {
                    d3.select(sel).select('.' + oldSide).classed('hidden', true);
                    d3.select(sel).select('.' + newSide).classed('hidden', false);
                }
                    
            };
        };
        
        for (var h = 0; h < hours.length; h++) {
            for (var d = 0; d < days.length; d++) {
                var side = d3.select('#tiles').attr('class');
                setTimeout(flipper(h, d, side), (h * 20) + (d * 20) + (Math.random() * 100));
            }
        }
        d3.select('#tiles').attr('class', newSide);
    }



    /* Getter setter methods for internal properties */

    tiles.title = function(_){
        if (!arguments.length) return title;
        title = _;
        return tiles;
    };

    tiles.update = function(_){
        if (!arguments.length) return update;
        update = _;
        return tiles;
    };

    tiles.metric = function(_){
        if (!arguments.length) return metric;
        metric = _;
        return tiles;
    };

    tiles.over = function(_){
        if (!arguments.length) return over;
        over = _;
        return tiles;
    };

    tiles.start = function(d){
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
              	return data;
            });
        };
    };


    return tiles;
};