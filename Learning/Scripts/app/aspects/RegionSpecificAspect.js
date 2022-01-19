Ext.define('B4.aspects.RegionSpecificAspect', {
    extend: 'B4.base.Aspect',

    alias: 'widget.regionspecificaspect',

    requires: [
    ],

    region: undefined,

    selector: undefined,

    process: function(cmp, allowed) {
        cmp.setVisible(allowed);
    },
    
    initialize: function (view) {
        var me = this,
            allowed = B4.CurrentRegion == me.region;

        Ext.each(view.query(me.selector), function(cmp) {
            me.process(cmp, allowed);
        });
    }
});