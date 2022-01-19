Ext.define('Learning.store.CitizenStore', {
    extend: 'Ext.data.Store',
    model: 'Learning.model.Citizen',
/*    autoLoad: true,*/
    storeId: 'CitizenStore',
    proxy: {
        type: 'ajax',
        url: 'Search/Search',
        reader: {
            type: 'json',
            root: 'citizens',
/*            successProperty: 'success'*/
        }
    }
});