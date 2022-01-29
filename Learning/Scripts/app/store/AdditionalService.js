Ext.define('Learning.store.AdditionalService', {
    extend: 'Ext.data.TreeStore',
    requires: ['Learning.model.AdditionalService'],
    autoLoad: false,
    model: 'Learning.model.AdditionalService'
});