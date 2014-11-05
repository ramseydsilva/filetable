
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

        options = _.defaults(options || {}, {
            loading: {
                class: "loading",
                html: "Loading ..."
            },
            class: "filetable",
            rows: []
        });

        var defaultIcons = {
            folderOpen: '<i class="fa fa-folder-o"></i>',
            folder: '<i class="fa fa-folder"></i>',
            file: '<i class="fa fa-file-o"></i>',
            expand: '<i class="fa fa-angle-right"></i>',
            collapse: '<i class="fa fa-angle-down"></i>',
            toggle: "<span class='toggle'></span>",
            indent: '<i class="indent">&nbsp;</i>'
        };

        var defaultClasses = {
            invisible: "invisible",
            hidden: "hidden"
        };

        options.icons = _.defaults(options.icon || {}, defaultIcons);
        options.classes = _.defaults(options.classes || {}, defaultClasses);

        var that = this,
            table = $("<table class='"+options.class+"'><thead></thead><tbody></tbody></table>"),
            thead = table.find("thead"),
            tbody = table.find("tbody"),
            rows,
            colspan = 1,
            loadingHtml,
            col_keys;

        var hideRecursive = function($row) {
            $row.$children.forEach(function($child) {
                $child.hide() && hideRecursive($child);
            });
        };

        var showRecursive = function($row) {
            var expanded = $row.expanded;
            expanded && $row.$children.forEach(function($child) {
                $child.show() && showRecursive($child);
            });
        };

        var getRowElement = function($parent, cols) {
            var $row = $("<tr></tr>");
            var firstRow = true;
            var notExpandedYet = true;
            $row.row = cols.row;
            $row.$children = [];
            if (!$parent.$children) $parent.$children = [];
            $row.expanded = false;
            $row.refresh = function() {}
            $row.delete = function() {}
            $parent.$children.push($row);
            $row.$parent = $parent;
            if (!$parent.numParents && $parent.numParents !== 0) {
                $row.numParents = 0;
            } else {
                $row.numParents = $parent.numParents + 1;
            }

            cols.forEach(function(colHtml) {
                var td = "<td>", $expand, $collapse;
                if (firstRow) {

                    // put indent
                    for (var i=1; i <= $row.numParents; i++) {
                        td += options.icons.indent;
                    }

                    if (options.icons.expand && options.icons.collapse) {
                        $row.$expand = $(options.icons.expand);
                        $row.$collapse = $(options.icons.collapse);

                        $row.expand = function() {
                            $row.$expand.detach();
                            $row.$toggle.html($row.$collapse);
                            attachRows($row, $row.row.rows);
                            $row.expanded = true;
                            showRecursive($row);
                        }

                        $row.collapse = function() {
                            $row.$collapse.detach();
                            $row.$toggle.html($row.$expand);
                            hideRecursive($row);
                            $row.expanded = false;
                        }
                        // toggle
                        td += options.icons.toggle;
                    }

                    if (cols.row.rows) {
                        if (options.icons.folder) td += options.icons.folder;
                    } else {
                        if (options.icons.file) td += options.icons.file;
                    }

                }

                td += colHtml + "</td>";
                $row.append(td);

                if (firstRow) {
                    $row.$toggle = $($row.find(".toggle"));
                    if (!$row.row.rows) $row.$toggle.addClass(options.classes.invisible);
                    $row.$toggle.prepend($row.$expand);
                    $row.$expand.on("click", $row.expand);
                    $row.$collapse.on("click", $row.collapse);
                    firstRow = false;
                }

            });

            return $row;

        };

        var getRowData = function(data) {
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
                    row.row = rowData;
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
                    var $rowEl = getRowElement($parent, row);
                    if ($parent.numParents >= 0) {
                        $parent.after($rowEl); // rows are reversed
                    } else {
                        $parent.prepend($rowEl); // rows are reversed
                    }
                    options.onRenderRow && options.onRenderRow($rowEl);
                });
            } else {
                // TODO: No data message
            }
        }

        var attachRows = function($parent, data) {
            if (typeof data == "object" && data.length > 0) {
                attachRowsCallback($parent, getRowData(data));
            } else if (typeof data == "function") {
                var returnData = data(function(data) {
                    attachRowsCallback($parent, getRowData(data));
                });
                returnData && attachRowsCallback($parent, getRowData(returnData));
            }
            attachRowsCallback($parent, []);
        };

        options.data && showLoading();

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
                attachRows(tbody, options.rows);
            }
        } else {
            // Without header
            attachRows(tbody, options.rows);
        }

        this.fileTableOptions = options;
        this.fileTable = table;
        this.html(table);

        return this;

    };

    return Filetable;

}));
