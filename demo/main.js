define([

], function() {
    require.config({
        paths: {
            filetable: "../index",
            jquery: "../node_modules/jquery/dist/cdn/jquery-2.1.1",
            underscore: "../node_modules/underscore/underscore"
        },
        shim: {
            filetable: { deps: ["jquery", "underscore"] }
        }
    });

    require(["jquery", "filetable"], function() {
        
        $("#container").filetable({
            header: {
                item: {html: "Item"},
                status: {html: "Status"}
            },
            rows: [
                {item: "Clean room", status: "Pending" },
                {item: "Laundry", status: "Pending" }
            ]
        });
        
    });

});
