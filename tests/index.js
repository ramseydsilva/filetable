"use strict";

var should = require("should"),
    sinon = require("sinon"),
    $, _, $el;

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

    before(function() {
        $el = $("<div></div>");
        $el.filetable();
    });

    it("exists", function() {
        $.prototype.filetable.should.be.ok;
    });

    it("creates table element", function() {
        $el.find("table").length.should.be.ok;
    });

    describe("takes options", function() {

        var options, col_keys;

        before(function() {
            options = {
                header: {
                    "name": {html: "Name"},
                    "alias": {html: "Alias"},
                    "operator": {html: "Operator"}
                },
                class: "table table-bordered"
            };
            $el.filetable(options);
        });

        it("class", function() {
            options.class.split(" ").forEach(function(className) {
                $el.hasClass(className).should.be.true;
            });
        });

        describe("header", function() {
            it("with html", function() {
                col_keys = _.keys(options.header);
                col_keys.forEach(function(key) {
                    $el.find("table thead th:contains('"+options.header[key].html+"')").length.should.be.ok;
                });
            });

            it("with class", function() {
                var opts = _.clone(options);
                opts.header = {
                    "name": {html: "Name", class: "name"},
                    "alias": {html: "Alias", class: "alias"},
                    "operator": {html: "Operator", class: "operator"}
                };
                col_keys = _.keys(opts.header);
                $el.filetable(opts);
                col_keys.forEach(function(key) {
                    $el.find("table thead th."+opts.header[key].class).length.should.be.ok;
                });
            });
        });

        describe("data", function() {

            before(function() {
                options.data = [
                    {name: "Ramsey", alias: "Superman", operator: "Kryptonite"}
                ];
                $el.filetable(options);
            });

            var confirmDataOptionObject = function() {
                $el.find("tbody tr").length.should.be.eql(options.data.length);
                options.data.forEach(function(data, index) {
                    var $row = $($el.find("table tbody tr")[index]);
                    $row.find("td").length.should.be.eql(col_keys.length);
                    _.keys(data).forEach(function(key) {
                        $row.find("td:contains('"+data[key]+"')").length.should.be.ok;
                    });
                });
            };

            it("with header option and of type array of objects", function() {
                confirmDataOptionObject();
            });

            it("with no header option and of type array of arrays", function() {
                var opts = _.clone(options);
                delete opts.header;
                opts.data = [["Ramsey", "Superman", "Kryptonite"]];
                $el.filetable(opts);
                $el.find("tbody tr").length.should.be.eql(opts.data.length);
                opts.data.forEach(function(data, index) {
                    var $row = $($el.find("table tbody tr")[index]);
                    $row.find("td").length.should.be.eql(data.length);
                    data.forEach(function(col) {
                        $row.find("td:contains('"+col+"')").length.should.be.ok;
                    });
                });
            });

            it("of type function", function() {
                var opts = _.clone(options);
                opts.data = function() {
                    return options.data;
                }
                $el.filetable(opts);
                confirmDataOptionObject();
            });

        });

        describe("render", function() {

            var opts, lastRow;
            before(function() {
                opts = _.clone(options);
                opts.data.push({
                    name: "Bla", alias: "", operator: ""
                });
                opts.render = sinon.stub();
                $el.filetable(opts);
                opts.render.withArgs($el.find("tbody tr"));
            });

            it ("called when rendering each row, with row element as first argument", function() {
                opts.render.callCount.should.be.eql(opts.data.length);
            });

        });

    });

});
