
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

    $.prototype.filetable = function(options) {

        var defaultIcons = {
            folderOpen: "<i class='fa fa-folder-o'></i>",
            folder: "<i class='fa fa-folder'></i>",
            file: "<i class='fa fa-file-o'></i>"
        };

        options = _.defaults(options || {}, {
            loading: {
                class: "loading",
                html: "Loading ..."
            },
            icons: defaultIcons,
            class: "filetable",
            rows: []
        });

        var that = this,
            table = $("<table class='"+options.class+"'><thead></thead><tbody></tbody></table>"),
            thead = table.find("thead"),
            tbody = table.find("tbody"),
            rows,
            colspan = 1,
            loadingHtml,
            col_keys;

        var appendRow = function(cols, hasChildren) {
            var row = $("<tr></tr>");
            var firstRow = true;
            cols.forEach(function(col) {
                var td = "<td>";
                if (firstRow) {
                    td += hasChildren ? options.icons.folder : options.icons.file;
                    firstRow = false;
                }
                td += col+"</td>";
                row.append(td);
            });
            return row;
        };

        var getRowData = function(data, col_keys) {
            var rows = [];
            data && data.length > 0 && data.forEach(function(rowData) {
                if (typeof rowData == "object") {
                    var row = [];
                    if (typeof col_keys == "object" && colspan > 0) {
                        colspan = col_keys.length;
                        col_keys.forEach(function(key) {
                            row.push(rowData[key]);
                        });
                    } else {
                        row = _.values(rowData);
                        colspan = row.length;
                    }
                    row.rows = rowData.rows; // attach child rows
                    rows.push(row);
                } else {
                    throw new Error("data should contain object or array");
                }
            });
            return rows;
        };

        var showLoading = function() {
            if (options.loading) {
                loadingHtml = $("<tr class='"+(options.loading.class && options.loading.class)+"'><td colspan='"
                    + colspan +"'>"+options.loading.html+"</td></tr>");
                tbody.html(loadingHtml);
            }
        };

        var hideLoading = function() {
            loadingHtml = loadingHtml && loadingHtml.remove() && false;
        };

        var attachRowsCallback = function($parent, rows) {
            if (rows && rows.length > 0) {
                rows.forEach(function(row) {
                    hideLoading();
                    var $row = appendRow(row, !!row.rows);
                    $parent.append($row);
                    if (typeof options.onRenderRow == "function") {
                        options.onRenderRow.apply(this, $row);
                    }
                });
            } else {
                // TODO: No data message
            }
        }

        var attachRows = function(data, col_keys, $parent) {
            if (typeof data == "object" && data.length > 0) {
                attachRowsCallback($parent, getRowData(data, col_keys));
            } else if (typeof data == "function") {
                var data = data(function(data) {
                    // our callback function
                    attachRowsCallback($parent, getRowData(data, col_keys));
                });
                if (typeof data != "undefined") {
                    attachRowsCallback($parent, getRowData(data, col_keys));
                }
            } else if (data && data.length !== 0) {
                throw new Error("data should be array or function")
            }
            attachRowsCallback($parent, []);
        };

        showLoading();

        // Creates header
        if (typeof options.header == "object") {
            var header = options.header;
                col_keys = _.keys(header);

            if (header && col_keys.length > 0) {
                var theadTr = $("<tr></tr>");
                col_keys.forEach(function(key) {
                    var _class = header[key].class || "";
                    if (_class) {
                        _class = "class='"+header[key].class+"'";
                    }
                    theadTr.append("<th "+_class+">"+header[key].html+"</th>");
                });
                thead.html(theadTr);
                attachRows(options.rows, col_keys, tbody);
            }
        } else {
            // Without header
            attachRows(options.rows, col_keys, tbody);
        }

        this.fileTableOptions = options;
        this.fileTable = table;
        this.html(table);

        return this;

    };

    return Filetable;

}));
