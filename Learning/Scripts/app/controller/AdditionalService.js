Ext.define('Learning.controller.AdditionalService', {
    extend: 'Ext.app.Controller',
    requires: [
        'Learning.aspects.GridEditWindow',
        'Learning.enums.ReadOnlyAdditionalServices'
    ],

    views: [
        'Grid',
        'Window'
    ],

    stores: [
        'AdditionalService'
    ],

    models: [
        'AdditionalService'
    ],

    mixins: {
        mask: 'Learning.mixins.MaskBody',
        context: 'Learning.mixins.Context'
    },

    refs: [
        {
            ref: 'mainView',
            selector: 'additionalservicegrid'
        },
        {
            ref: 'mainWindow',
            selector: 'additionalservicewindow'
        }
    ],

    aspects: [
        {
            xtype: 'grideditwindowaspect',
            name: 'additionalserviceGridWindowAspect',
            gridSelector: 'additionalservicegrid',
            editFormSelector: 'additionalservicewindow',
            modelName: 'AdditionalService',
            editWindowView: 'additionalservice.Window',
            getRecordBeforeSave: function (record) {
                if (!record.getId()) {
                    record.set('IsActualNative', 1);
                }
                return record;
            },
            rowDblClick: function (view, record) {
                if (Ext.Array.some(B4.enums.ReadOnlyAdditionalServices.getItems(), function (x) {
                    return x[0] == record.get('Id');
                })) {
                    return false;
                }

                this.editRecord(record, view);
            }
        }
    ],

    init: function () {
        var me = this,
            actions = {
                'additionalservicegrid': {
                    'afterrender': { fn: me.onRenderGrid, scope: me }
                    }
                };

                me.callParent(arguments);
                me.control(actions);
            },

            index: function () {
                var view = this.getMainView() || Ext.widget('additionalservicegrid');
        this.bindContext(view);
        this.application.deployView(view);
    },

    onRenderGrid: function (grid) {
        var me = this,
            store = grid.getStore();

        store.load();
    }
});