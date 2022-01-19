Ext.define('B4.aspects.permission.Kp60PermissionAspect', {
    extend: 'B4.aspects.Permission',
    alias: 'widget.kp60permissionaspect',

    event: 'afterrender',

    permissions: [],

    applyBy: function (component, allowed) {
        if (component) {
            component.setDisabled(!allowed);
        }
    },

    setDisabled: function (component, allowed) {
        if (component) {
            component.setDisabled(!allowed);
        }
    },

    setVisible: function (component, allowed) {
        if (component) {
            component.setVisible(allowed);
        }
    },

    setAllowBlank: function (component, allowed) {
        if (component) {
            component.allowBlank = !allowed;
            //component.validate();
        }
    },

    permissionGrant: null,

    /*переопределяем метод. 
    1.Грид с формой редактирования. Работает как и в стандартном аспекте
    2.Грид с навигационной панелью. При первом открытии срабатывает данные метод.
    Подписываемся на события и так как есть селектор панели применяем сразу пермишины.
    При повторном открытие пермишины берутся из подписок.
    */
    init: function (controller) {
        this.onInit();
        this.controller = controller;
        this.loadPermissions()
            .next(function (response) {
                var me = this,
                    grants = Ext.decode(response.responseText);

                for (var n = me.permissions.length, i = 0; i < n; ++i) {
                    var permission = me.permissions[i],
                        action = {},
                        ev = {},
                        applyOn = { event: me.event, selector: permission.selector },
                        applyBy = Ext.isEmpty(permission.applyBy) ? me.applyBy : permission.applyBy,
                        applyTo = permission.selector + ' ' + permission.applyTo,
                        event = Ext.isEmpty(permission.event) ? me.event : permission.event;

                    if (me.permissionGrant)
                        me.permissionGrant[applyTo] = Boolean(grants[i]);

                    //вешаемся на события
                    ev[event] = Ext.Function.pass(me.applyPermission, [Boolean(grants[i]), null, applyBy, applyTo], me);
                    action[applyOn.selector] = ev;
                    if (typeof me.controller.control === 'function')
                        me.controller.control(action);

                    // Если компонент, к которому необходимо применить ограничение, уже создан, то сразу применяем
                    var cmp = Ext.ComponentQuery.query(applyTo);
                    if (cmp && cmp[0]) {
                        me.applyPermission(Boolean(grants[i]), null, applyBy, applyTo);
                    }
                }
            }, this);
    },

    onInit: function () {

    }
});