Ext.application({
	requires: ['Ext.container.Viewport'],
	name: 'Learning',
	appFolder: 'Scripts/app',
	controllers: ['Citizens'],

	launch: function () {
		var globalSurname;
		var globalFirstname;
		var globalFathername;
		var globalFirstdate;
		var globalLastdate;
		var getFilter;

		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: {
				xtype: 'citizenlist'
			}
		});
	}
});