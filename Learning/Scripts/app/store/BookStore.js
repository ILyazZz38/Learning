Ext.define('BookApp.store.BookStore', {
    extend: 'Ext.data.Store',
    model: 'BookApp.model.Book',
    autoLoad: true,
    storeId: 'BookStore',
    proxy: {
        type: 'ajax',
        url: 'app/data/books.json',
        reader: {
            type: 'json',
            root: 'books',
            successProperty: 'success'
        }
    }
});