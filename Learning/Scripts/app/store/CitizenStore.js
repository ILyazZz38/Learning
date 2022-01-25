Ext.define('Learning.store.CitizenStore', {
    extend: 'Ext.data.Store',
    model: 'Learning.model.Citizen',
    autoLoad: true,
    storeId: 'CitizenStore',
    proxy: {
        type: 'ajax',
        url: 'Json/GetData',
        reader: {
            type: 'json',
            method: 'POST',
            root: 'newCitizens',
            //totalProperty: 'total',
        }
    }
});