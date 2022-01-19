Ext.define('Learning.model.AdditionalService', {
    extend: 'Ext.data.Model',
    idProperty: 'Id',
    proxy: {
        type: 'b4proxy',
        controllerName: 'AdditionalService'
    },
    fields: [
        { name: 'Id' },
        { name: 'Name' },
        { name: 'ContragentName' },
        { name: 'Contragent' },
        { name: 'IsActual' },
        { name: 'IsActualNative' },
        { name: 'DisplayName' }
    ]
});
