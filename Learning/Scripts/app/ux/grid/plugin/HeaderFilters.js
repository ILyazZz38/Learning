Ext.define('B4.ux.grid.plugin.HeaderFilters', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.b4gridheaderfilters',
    ptype: 'b4gridheaderfilters',

    requires: ['Ext.container.Container'],

    grid: null,

    fields: null,

    containers: null,

    storeLoaded: false,

    filterFieldCls: 'x-gridheaderfilters-filter-field',

    filterContainerCls: 'x-gridheaderfilters-filter-container',

    lastApplyFilters: null,

    operand: CondExpr.operands.and,

    bundle: {
        activeFilters: 'Active filters',
        noFilter: 'No filter'
    },

    /**
    * @cfg {Boolean} stateful
    * Specifies if headerFilters values are saved into grid status when filters changes.
    * This configuration can be overridden from grid configuration parameter <code>statefulHeaderFilters</code> (if defined).
    * Used only if grid <b>is stateful</b>. Default = true.
    * 
    */
    stateful: true,

    /**
    * @cfg {Boolean} reloadOnChange
    * Specifies if the grid store will be auto-reloaded when filters change. The store
    * will be reloaded only if is was already loaded. If the store is local or it doesn't has remote filters
    * the store will be always updated on filters change.
    * 
    */
    reloadOnChange: true,

    /**
    * @cfg {Boolean} ensureFilteredVisible
    * If the column on wich the filter is set is hidden and can be made visible, the
    * plugin makes the column visible.
    */
    ensureFilteredVisible: true,

    statusProperty: 'headerFilters',

    rendered: false,

    setStateful: function (saveState) {
        this.stateful = !!saveState;
    },

    init: function (grid) {
        var me = this;
        me.grid = grid;

        /*var storeProxy = this.grid.getStore().getProxy();
        if(storeProxy && storeProxy.getReader())
        {
        var reader = storeProxy.getReader();
        this.filterRoot = reader.root ? reader.root : undefined;
        }*/
        /**
        * @cfg {Object} headerFilters
        * <b>Configuration attribute for grid</b>
        * Allows to initialize header filters values from grid configuration.
        * This object must have filter names as keys and filter values as values.
        * If this plugin has {@link #stateful} enabled, the saved filters have priority and override these filters.
        * Use {@link #ignoreSavedHeaderFilters} to ignore current status and apply these filters directly.
        */
        if (!grid.headerFilters)
            grid.headerFilters = {};


        if (Ext.isBoolean(grid.statefulHeaderFilters)) {
            me.setStateful(grid.statefulHeaderFilters);
        }

        me.grid.addEvents(
        /**
        * @event headerfilterchange
        * <b>Event enabled on the Grid</b>: fired when at least one filter is updated after apply.
        * @param {Ext.grid.Panel} grid The grid
        * @param {Ext.util.MixedCollection} filters The applied filters (after apply). Ext.util.Filter objects.
        * @param {Ext.util.MixedCollection} prevFilters The old applied filters (before apply). Ext.util.Filter objects.
        * @param {Number} active Number of active filters (not empty)
        * @param {Ext.data.Store} store Current grid store
        */
        'headerfilterchange',
        /**
        * @event headerfiltersrender
        * <b>Event enabled on the Grid</b>: fired when filters are rendered
        * @param {Ext.grid.Panel} grid The grid
        * @param {Object} fields The filter fields rendered. The object has for keys the filters names and for value Ext.form.field.Field objects.
        * @param {Object} filters Current header filters. The object has for keys the filters names and for value the filters values.
        */
        'headerfiltersrender',
        /**
        * @event beforeheaderfiltersapply
        * <b>Event enabled on the Grid</b>: fired before filters are confirmed. If the handler returns false no filter apply occurs.
        * @param {Ext.grid.Panel} grid The grid
        * @param {Object} filters Current header filters. The object has for keys the filters names and for value the filters values.
        * @param {Ext.data.Store} store Current grid store
        */
        'beforeheaderfiltersapply',
        /**
        * @event headerfiltersapply
        *<b>Event enabled on the Grid</b>: fired when filters are confirmed.
        * @param {Ext.grid.Panel} grid The grid
        * @param {Object} filters Current header filters. The object has for keys the filters names and for value the filters values.
        * @param {Number} active Number of active filters (not empty)
        * @param {Ext.data.Store} store Current grid store
        */
        'headerfiltersapply'
        );
        me.grid.on({
            scope: me,
            columnresize: me.resizeFilterContainer,
            beforedestroy: me.onDestroy,
            beforestatesave: me.saveFilters,
            afterlayout: me.adjustFilterWidth,
            columnshow: me.onColumnShow,
            afterrender: me.afterGridRender
        });

        me.grid.headerCt.on({
            scope: me,
            afterrender: me.renderFilters
        });

        me.grid.getStore().on({
            scope: me,
            load: me.onStoreLoad,
            beforeload: me.onBeforeStoreLoad
        });

        if (me.reloadOnChange) {
            me.grid.on('headerfilterchange', me.reloadStore, me);
        }

        if (me.stateful) {
            me.grid.addStateEvents('headerfilterchange');
        }

        //Enable new grid methods
        Ext.apply(me.grid, {
            headerFilterPlugin: me,
            setHeaderFilter: function (sName, sValue) {
                if (!this.headerFilterPlugin)
                    return;
                var fd = {};
                fd[sName] = sValue;
                this.headerFilterPlugin.setFilters(fd);
            },
            /**
            * Returns a collection of filters corresponding to enabled header filters.
            * If a filter field is disabled, the filter is not included.
            * <b>This method is enabled on Grid</b>.
            * @method
            * @return {Array[Ext.util.Filter]} An array of Ext.util.Filter
            */
            getHeaderFilters: function () {
                if (!this.headerFilterPlugin)
                    return null;
                return this.headerFilterPlugin.getFilters();
            },
            /**
            * Set header filter values
            * <b>Method enabled on Grid</b>
            * @method
            * @param {Object or Array[Object]} filters An object with key/value pairs or an array of Ext.util.Filter objects (or corresponding configuration).
            * Only filters that matches with header filters names will be set
            */
            setHeaderFilters: function (obj) {
                if (!this.headerFilterPlugin)
                    return;
                this.headerFilterPlugin.setFilters(obj);
            },
            getHeaderFilterField: function (fn) {
                if (!this.headerFilterPlugin)
                    return null;
                if (this.headerFilterPlugin.fields[fn])
                    return this.headerFilterPlugin.fields[fn];
                else
                    return null;
            },
            resetHeaderFilters: function () {
                if (!this.headerFilterPlugin)
                    return;
                this.headerFilterPlugin.resetFilters();
            },
            clearHeaderFilters: function () {
                if (!this.headerFilterPlugin)
                    return;
                this.headerFilterPlugin.clearFilters();
            },
            applyHeaderFilters: function () {
                if (!this.headerFilterPlugin)
                    return;
                this.headerFilterPlugin.applyFilters();
            }
        });
    },

    saveFilters: function (grid, status) {
        var me = this;
        status[me.statusProperty] = (me.stateful && me.rendered) ? me.parseFilters() : grid[me.statusProperty];
    },

    setFieldValue: function (field, value) {
        var column = field.column;
        if (!Ext.isEmpty(value)) {
            field.setValue(value);
            if (!Ext.isEmpty(value) && column.hideable && !column.isVisible() && !field.isDisabled() && this.ensureFilteredVisible) {
                column.setVisible(true);
            }
        } else {
            field.setValue('');
        }
    },

    renderFilters: function () {
        var me = this,
            filters, storeFilters,
            columns;
        me.destroyFilters();

        me.fields = {};
        me.containers = {};

        filters = me.grid.headerFilters;

        /**
        * @cfg {Boolean} ignoreSavedHeaderFilters
        * <b>Configuration parameter for grid</b>
        * Allows to ignore saved filter status when {@link #stateful} is enabled.
        * This can be useful to use {@link #headerFilters} configuration directly and ignore status.
        * The state will still be saved if {@link #stateful} is enabled.
        */
        if (me.stateful && me.grid[me.statusProperty] && !me.grid.ignoreSavedHeaderFilters) {
            Ext.apply(filters, me.grid[me.statusProperty]);
        }

        storeFilters = me.parseStoreFilter();
        filters = Ext.apply(storeFilters, filters);

        columns = this.grid.headerCt.getGridColumns(true);
        for (var c = 0; c < columns.length; c++) {
            var column = columns[c];
            if (column.filter) {
                var filterContainerConfig = {
                    itemId: column.id + '-filtersContainer',
                    cls: this.filterContainerCls,
                    layout: 'anchor',
                    bodyStyle: { 'background-color': 'transparent' },
                    border: false,
                    width: column.getWidth(),
                    listeners: {
                        scope: this,
                        element: 'el',
                        mousedown: function (e) {
                            e.stopPropagation();
                        },
                        click: function (e) {
                            e.stopPropagation();
                        },
                        keydown: function (e) {
                            if (e.getKey() == Ext.EventObject.ENTER) {
                                this.onFilterContainerEnter();
                            }
                            e.stopPropagation();
                        },
                        keypress: function (e) {
                            e.stopPropagation();
                        },
                        keyup: function (e) {
                            e.stopPropagation();
                        }
                    },
                    items: []
                };

                var fca = [].concat(column.filter);
                var applyHandler = Ext.bind(this.applyFilters, this);

                for (var ci = 0; ci < fca.length; ci++) {
                    var fc = fca[ci];
                    Ext.applyIf(fc, {
                        filterName: column.dataIndex,
                        fieldLabel: column.text || column.header,
                        hideLabel: fca.length == 1
                    });
                    var initValue = Ext.isEmpty(filters[fc.filterName]) ? null : filters[fc.filterName];

                    if (initValue && initValue.value) {
                        initValue = initValue.value;
                    }

                    Ext.apply(fc, {
                        cls: this.filterFieldCls,
                        itemId: fc.filterName,
                        anchor: '-1'
                    });

                    var filterField = Ext.ComponentManager.create(fc);
                    // отдельная обработка на изменение всех наследников combobox
                    if (Ext.isFunction(filterField.is) && filterField.is('combo')) {
                        filterField.on('change', applyHandler);
                    }

                    filterField.column = column;
                    this.setFieldValue(filterField, initValue);
                    this.fields[filterField.filterName] = filterField;
                    filterContainerConfig.items.push(filterField);
                }

                var filterContainer = Ext.create('Ext.container.Container', filterContainerConfig);
                filterContainer.render(column.el);
                this.containers[column.id] = filterContainer;
                column.setPadding = Ext.Function.createInterceptor(column.setPadding, function () { return false; });
            }
        }

        if (this.enableTooltip) {
            this.tooltipTpl = new Ext.XTemplate(this.tooltipTpl, { text: this.bundle });
            this.tooltip = Ext.create('Ext.tip.ToolTip', {
                target: this.grid.headerCt.el,
                //delegate: '.'+this.filterContainerCls,
                renderTo: Ext.getBody(),
                html: this.tooltipTpl.apply({ filters: [] })
            });
            this.grid.on('headerfilterchange', function (grid, filters) {
                var sf = filters.filterBy(function (filt) {
                    return !Ext.isEmpty(filt.value);
                });
                this.tooltip.update(this.tooltipTpl.apply({ filters: sf.getRange() }));
            }, this);
        }

        this.applyFilters();
        this.rendered = true;
        this.grid.fireEvent('headerfiltersrender', this.grid, this.fields, this.parseFilters());
    },

    afterGridRender: function () {
        var me = this;
        var menu = me.grid.headerCt.getMenu();
        menu.add([
            {
                icon: 'content/img/icons/reload.png',
                text: 'Очистить фильтры',
                handler: function () {
                    me.grid.resetHeaderFilters();
                }
            }
        ]);
    },

    filterApplied: false,

    onBeforeStoreLoad: function (store, operation) {
        var me = this,
            curFilters;
        if (!me.isPluginLoading || me.filterContainerEnter === true) {
            curFilters = me.getFilters();
            store.complexFilter = curFilters;
            Ext.apply(operation.params, { complexFilter: Ext.encode(store.complexFilter) });
            if (me.filterContainerEnter === true)
                me.isPluginLoading = false;
        } else {
            me.isPluginLoading = false;
        }
    },

    onStoreLoad: function () {
        this.storeLoaded = true;
    },

    onFilterContainerEnter: function () {
        this.filterContainerEnter = true;
        this.applyFilters();
        this.filterContainerEnter = false;
    },

    resizeFilterContainer: function (headerCt, column, w, opts) {
        var me = this,
            cnt;
        if (!me.containers) return;
        cnt = me.containers[column.id];
        if (cnt) {
            cnt.setWidth(w);
            cnt.doLayout();
        }
    },

    destroyFilters: function () {
        var me = this;
        me.rendered = false;
        if (me.fields) {
            for (var f in me.fields)
                Ext.destroy(me.fields[f]);
            delete me.fields;
        }

        if (me.containers) {
            for (var c in me.containers)
                Ext.destroy(me.containers[c]);
            delete me.containers;
        }
    },

    onDestroy: function () {
        var me = this,
            store = me.grid.getStore();
        me.destroyFilters();
        if (store) {
            store.un('load', me.onStoreLoad, me);
            store.un('beforeload', me.onBeforeStoreLoad, me);
        }
        Ext.destroy(me.tooltip, me.tooltipTpl);
    },

    adjustFilterWidth: function () {
        var me = this,
            columns, column, c;
        if (!me.containers) return;
        columns = me.grid.headerCt.getGridColumns(true);
        for (c = 0; c < columns.length; c++) {
            column = columns[c];
            if (column.filter && column.flex && me.containers[column.id]) {
                me.containers[column.id].setWidth(column.getWidth() - 1);
            }
        }
    },

    resetFilters: function () {
        var me = this,
            fn, f;
        if (!me.fields)
            return;
        for (fn in me.fields) {
            f = me.fields[fn];
            if (!f.isDisabled() && !f.readOnly && Ext.isFunction(f.reset))
                f.reset();
        }
        me.applyFilters();
    },

    clearFilters: function () {
        if (!this.fields)
            return;
        for (var fn in this.fields) {
            var f = this.fields[fn];
            if (!f.isDisabled() && !f.readOnly)
                f.setValue('');
        }
        this.applyFilters();
    },

    setFilters: function (filters) {
        if (!filters)
            return;

        if (Ext.isArray(filters)) {
            var conv = {};
            Ext.each(filters, function (filter) {
                if (filter.property) {
                    conv[filter.property] = filter.value;
                }
            });
            filters = conv;
        }
        else if (!Ext.isObject(filters)) {
            return;
        }

        this.initFilterFields(filters);
        this.applyFilters();
    },

    getFilters: function () {
        var terms = [],
            filter = this.parseFilters();

        Ext.iterate(filter, function (key, value) {
            terms.push(new CondExpr(key, value.operand, value.value));
        });

        return CondExpr.createForTerms(terms, this.operand);
    },

    parseFilters: function () {
        var filters = {};
        if (!this.fields)
            return filters;
        for (var fn in this.fields) {
            var field = this.fields[fn];
            if (!field.isDisabled() && field.isValid()) {
                var value = field.getSubmitValue();
                if (!Ext.isEmpty(value)) {
                    filters[field.filterName] = {
                        value: field.getValue(),
                        operand: field.operand || CondExpr.operands.contains
                    };
                }
            }
        }
        return filters;
    },

    initFilterFields: function (filters) {
        if (!this.fields)
            return;

        for (var fn in filters) {
            var value = filters[fn];
            var field = this.fields[fn];
            if (field) {
                this.setFieldValue(filterField, initValue);
            }
        }
    },

    countActiveFilters: function () {
        var fv = this.parseFilters();
        var af = 0;
        for (var fn in fv) {
            if (!Ext.isEmpty(fv[fn]))
                af++;
        }
        return af;
    },

    //Разбираем фильтр до объкта типа свойство-значение
    decomposeFilter: function (filter, result) {
        if (filter) {
            if (Ext.isString(filter.left)) {
                result[filter.left] = filter.right;
            } else {
                result = this.decomposeFilter(filter.left, result);
                result = this.decomposeFilter(filter.right, result);
            }
        }

        return result;
    },

    parseStoreFilter: function () {
        var res = {};
        return this.decomposeFilter(this.grid.getStore().complexFilter, res);
    },

    applyFilters: function () {
        var me = this,
            filter = me.parseFilters(),
            curFilters;
        if (me.grid.fireEvent('beforeheaderfiltersapply', me.grid, filter, me.grid.getStore()) !== false) {

            me.grid.fireEvent('headerfiltersapply', me.grid, filter, me.grid.getStore());
            curFilters = me.getFilters();
            me.grid.getStore().complexFilter = curFilters;

            me.grid.fireEvent('headerfilterchange', me.grid, curFilters, me.lastApplyFilters, me.grid.getStore());
            me.lastApplyFilters = curFilters;
        }
    },

    reloadStore: function () {
        var me = this,
            gs = me.grid.getStore(),
            doLocalSort;
        if (gs.remoteFilter) {
            if (me.storeLoaded) {
                gs.currentPage = 1;
                me.isPluginLoading = true;
                gs.load();
            }
        } else {
            if (gs.filters.getCount()) {
                if (!gs.snapshot) {
                    gs.snapshot = gs.data.clone();
                } else {
                    gs.currentPage = 1;
                }
                gs.data = gs.snapshot.filter(gs.filters.getRange());
                doLocalSort = gs.sortOnFilter && !gs.remoteSort;
                if (doLocalSort) {
                    gs.sort();
                }
                // fire datachanged event if it hasn't already been fired by doSort
                if (!doLocalSort || gs.sorters.length < 1) {
                    gs.fireEvent('datachanged', gs);
                }
            } else {
                if (gs.snapshot) {
                    gs.currentPage = 1;
                    gs.data = gs.snapshot.clone();
                    delete gs.snapshot;
                    gs.fireEvent('datachanged', gs);
                }
            }
        }
    },

    onColumnShow: function (headerCt, column) {
        var me = this, cnt;
        if (!me.containers) return;
        cnt = me.containers[column.id];
        if (cnt) {
            cnt.setWidth(column.width);
            cnt.doLayout();
        }
    }
});