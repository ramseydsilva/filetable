
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
        this.append("<table></table>");
        return this;
    };

    return Filetable;

}));
