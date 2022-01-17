Ext.application({
	requires: ['Ext.container.Viewport'],
	name: 'Learning',
	appFolder: 'Scripts/app',
	controllers: ['Citizens'],

	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: {
				xtype: 'citizenlist'
			}
		});
	}
});