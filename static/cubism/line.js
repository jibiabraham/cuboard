cubism_contextPrototype.line = function() {
    var title;


    function line (data){
        console.log(data);
    }

    // Getter setter methods for each line

    line.title = function(_){
        if (!arguments.length) return title;
        title = _;
        return line;
    };

    return line;

};