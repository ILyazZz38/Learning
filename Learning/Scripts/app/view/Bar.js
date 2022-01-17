Ext.define('Learning.view.Bar', {
    alias: 'widget.Bar',

    initComponent: (function () {
        var fakeHTML = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

        Ext.QuickTips.init();
        Ext.panel.AbstractPanel.prototype.defaultDockWeights = { top: 1, bottom: 3, left: 5, right: 7 };

        var SamplePanel = Ext.extend(Ext.Panel, {
            width: 500,
            height: 250,
            style: 'margin-top:15px',
            bodyStyle: 'padding:10px',
            renderTo: Ext.getBody(),
            html: fakeHTML,
            autoScroll: true
        });

        new SamplePanel({
            title: 'Standard (lbar)',
            lbar: [{
                iconCls: 'add16',
                tooltip: 'Button 1'
            },
                '-',
            {
                iconCls: 'add16',
                tooltip: {
                    text: 'Button 2',
                    anchor: 'left'
                }
            }, {
                iconCls: 'add16'
            }, {
                iconCls: 'add16'
            },
                '-',
            {
                iconCls: 'add16'
            }
            ]
        });
    })
})