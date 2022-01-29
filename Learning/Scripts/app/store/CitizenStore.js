Ext.define('Learning.store.CitizenStore', {
    extend: 'Ext.data.Store',
    model: 'Learning.model.Citizen',
    autoLoad: false,
    storeId: 'CitizenStore',
    proxy: {
        type: 'ajax',
        url: 'Search/GetData',
        reader: {
            type: 'json',
            method: 'POST',
            root: 'citizens',
        }
    }
});