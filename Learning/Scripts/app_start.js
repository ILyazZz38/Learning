Ext.application({
	requires: ['Ext.container.Viewport'],
	name: 'MvcExtTest',
	appFolder: 'Scripts/app',
	/*controllers: ['Users'],*/

	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: {
				/*xtype: 'tableUser',*/
				title: 'Приложение на Ext JS 4',
				html: '<h3>Добро пожаловать в мир Ext JS 4!</h3>'
			}
		});
	}
});