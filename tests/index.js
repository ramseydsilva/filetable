"use strict";

var should = require("should"),
    $ = require("jquery");

before(function(done) {

    global = require("jsdom");

    require("../index");
    global._ = require("underscore");

    done();

});

describe("$.prototype.filetable", function() {

    it("exists", function() {
        $.prototype.filetable.should.be.ok;
    });

});
