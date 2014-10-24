"use strict";

var should = require("should"),
    $, _;

before(function(done) {

    var jsdom = require("jsdom");
    jsdom.env("<head></head><body></body>", function(errors, window) {
        global.window = window;
        $ = require("jquery");
        _ = require("underscore");
        require("../index");
        done();
    });

});

describe("$.prototype.filetable", function() {

    it("exists", function() {
        $.prototype.filetable.should.be.ok;
    });

    it("creates table element", function() {
        var $el = $("<div></div>");
        $el.filetable({});
        $el.find("table").length.should.be.ok;
    });

});
