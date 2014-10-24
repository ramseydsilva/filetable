
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
            root.Filetable = factory(root, exports, _, $);
        });

    } else if (typeof exports !== 'undefined') {
        var _ = require('underscore'), $;
        try { $ = require('jquery'); } catch(e) {}
        factory(root, exports, _, $);

    } else {
        root.Filetable = factory(root, {}, root._, (root.jQuery || root.$));
    }
}(this, function(root, Filetable, _, $) {

    var that;

    var getRow = function(cols) {
        var row = $("<tr></tr>");
        cols.forEach(function(col) {
            row.append("<td>"+col+"</td>");
        });
        return row;
    };

    var getRowData = function(data, col_keys) {
        var rows = [];
        data.forEach(function(rowData) {
            if (typeof rowData == "object") {
                var row = [];
                if (typeof col_keys == "object" && col_keys.length > 0) {
                    col_keys.forEach(function(key) {
                        row.push(rowData[key]);
                    });
                } else {
                    row = _.values(rowData);
                }
                rows.push(row);
            } else {
                throw new Error("data should contain object or array");
            }
        });
        return rows;
    };

    var getRows = function(data, col_keys) {
        if (typeof data == "object" && data.length > 0) {
            return getRowData(data, col_keys);
        } else if (typeof data == "function") {
            return getRowData(data(), col_keys);
        } else if (data && data.length !== 0) {
            throw new Error("data should be array or function")
        }
        return [];
    };

    var attachRows = function($root, rows, renderCallback) {
        rows.forEach(function(row) {
            var $row = getRow(row);
            $root.append($row);
            if (typeof renderCallback == "function") {
                renderCallback.apply(that, $row);
            }
        });
    };

    $.prototype.filetable = function(options) {
        that = this;
        this.html("<table><thead></thead><tbody></tbody></table>");
        var thead = this.find("thead"),
            tbody = this.find("tbody"),
            rows;

        if (options) {
            var rows;

            // Creates header
            if (typeof options.header == "object") {
                var header = options.header;
                    col_keys = _.keys(header);

                if (header && col_keys.length > 0) {
                    col_keys.forEach(function(key) {
                        var _class = header[key].class || "";
                        if (_class) {
                            _class = "class='"+header[key].class+"'";
                        }
                        thead.append("<tr><th "+_class+">"+header[key].html+"</th></tr>");
                    });
                    rows = getRows(options.rows, col_keys);
                }
            } else {
                // Without header
                rows = getRows(options.rows);
            }

            if (rows && rows.length > 0) {
                attachRows(tbody, rows, options.onRenderRow);
            }

            // Attach class
            if (typeof options.class == "string") {
                this.attr("class", options.class);
            } else if (!!options.class)  {
                throw new Error("class should be a string");
            }

        }

        return this;

    };

    return Filetable;

}));
