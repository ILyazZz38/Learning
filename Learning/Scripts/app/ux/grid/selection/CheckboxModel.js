/**
 * Модель для выборки записей в гриде, отличается от экстогого тем, что
 * умеет кешировать записи при пейджинации.
 *
 * @example
 *  {
 *      xtype: 'b4grid,
 *      selType: 'b4checkboxmodel',
 *      multiSelect: true
 *  }
 */
Ext.define('B4.ux.grid.selection.CheckboxModel', {
    alias: 'selection.b4checkboxmodel',
    extend: 'Ext.selection.CheckboxModel',

    idProperty: 'Id',

    injectCheckbox: 0,

    mode: 'MULTI',

    checkOnly: false,

    isSelectedAll: false,

    allowDeselect: true,

    constructor: function (config) {
        config = Ext.apply(this, config);

        if (this.mode.toUpperCase() !== 'MULTI'.toUpperCase()) {
            this.showHeaderCheckbox = false;
        }

        this.callParent(config);
    },

    selectAll: function (suppressEvent) {
        var me = this,
            selections = me.store.getRange(),
            start = me.getSelection().length;

        me.bulkChange = true;

        me.doSelect(selections, true, suppressEvent);

        delete me.bulkChange;

        me.maybeFireSelectionChange(me.getSelection().length !== start);

        this.isSelectedAll = true;
    },
    
    /**
    * deselectAll отключен, потому что в эксте происходит deselect перед
    * загрузкой новых записей.
    * Поэтому вместо deselectAll используется b4deselectAll
    */
    deselectAll: Ext.emptyFn,

    b4deselectAll: function () {
        this.superclass.deselectAll.call(this);

        this.isSelectedAll = false;
        this.fireEvent('deselectall', this);
    },

    doDeselect: function (records, suppressEvent) {
        var me = this,
            isSelectedAll = me.isSelectedAll;

        me.isSelectedAll = false;

        if (isSelectedAll) {
            me.b4deselectAll();
        }

        return me.callParent(arguments);
    },

    doMultiSelect: function (record, keepExisting, suppressEvent) {
        var me = this,
            selected = me.selected,
            change = false,
            i = 0,
            len, records;

        if (me.locked) {
            return;
        }

        if (me.isSelected(record) && selected.getCount() > 0) {
            me.doDeselect([record], suppressEvent);
            return;
        }

        records = Ext.isArray(record) ? record : [record];
        len = records.length;


        function commit() {
            selected.add(record);
            change = true;
        }

        for (; i < len; i++) {
            record = records[i];
            if (keepExisting && me.isSelected(record)) {
                continue;
            }
            me.lastSelected = record;

            me.onSelectChange(record, true, suppressEvent, commit);
        }
        if (!me.preventFocus) {
            me.setLastFocused(record, suppressEvent);
        }

        me.maybeFireSelectionChange(change && !suppressEvent);
    },

    getSelection: function () {
        return this.selected.getRange();
    },

    onHeaderClick: function (headerCt, header, e) {
        if (header.isCheckerHd) {
            e.stopEvent();
            var me = this,
                isChecked = header.el.hasCls(this.checkerOnCls);

            me.preventFocus = true;
            if (isChecked) {
                me.b4deselectAll();
            } else {
                me.selectAll();
            }
            delete me.preventFocus;
        }
    },

    refresh: function () {
        var me = this,
            store = me.store,
            toBeSelected = [],
            oldSelections = me.getSelection(),
            selection,
            change,
            i = 0,
            lastFocused = me.getLastFocused();

        if (!store) {
            return;
        }

        for (var length = oldSelections.length; i < length; i++) {
            selection = store.data.getByKey(oldSelections[i].get(me.idProperty));

            if (!me.pruneRemoved || selection) {
                toBeSelected.push(selection);
            }
        }

        if (me.selected.getCount() !== toBeSelected.length) {
            change = true;
        }

        if (store.indexOf(lastFocused) !== -1) {
            me.setLastFocused(lastFocused, true);
        }

        if (toBeSelected.length) {
            me.doSelect(toBeSelected, true, true);
        }

        me.maybeFireSelectionChange(change);

        me.updateHeaderState();
    },

    // немного криво работает, но не заметно))
    updateHeaderState: function () {
        var me = this,
            selectedItems = me.selected,
            selectedItemsCount = selectedItems.getCount(),
            storeItems = me.store,
            storeItemsCount = storeItems.getCount(),
            hdSelectStatus = false;

        // добавляем проверку: если количество выбранных элементов и элементов стора совпадает, то необходимо проверить, что выбранные элементы внутри - это и есть 
        // элементы из стора.
        if (selectedItemsCount == storeItemsCount && selectedItemsCount != 0) {
            hdSelectStatus = true;
            for (var i = 0; i < storeItemsCount; i++) {
                if (!this.isSelected(storeItems.getAt(i))) {
                    hdSelectStatus = false;
                    break;
                }
            }
        }
        
        this.toggleUiHeader(hdSelectStatus);
    },

    getSelectionStart: function() {
        return this.selectionStart;
    },

    selectWithEvent: function (record, e) {
        var me = this,
            isSelected = me.isSelected(record),
            shift = e.shiftKey,
            ctrl = e.ctrlKey,
            start = shift && me.getSelectionStart(),
            selected = me.getSelection(),
            len = selected.length,
            allowDeselect = me.allowDeselect;

        switch (me.mode) {
            case 'MULTI':
                if (shift && start) {
                    me.selectRange(start, record, ctrl);
                } else if (ctrl && isSelected) {
                    me.doDeselect(record, false);
                } else if (ctrl) {
                    me.doSelect(record, true, false);
                } else if (isSelected && !shift && !ctrl && len > 0) {
                    me.doDeselect(record, false);
                } else if (!isSelected) {
                    me.doSelect(record, false);
                }
                break;
            case 'SIMPLE':
                if (isSelected) {
                    me.doDeselect(record);
                } else {
                    me.b4deselectAll();
                    me.doSelect(record, true);
                }
                break;
            case 'SINGLE':
                if (allowDeselect && !ctrl) {
                    allowDeselect = me.toggleOnClick;
                }
                if (allowDeselect && isSelected) {
                    me.doDeselect(record);
                } else {
                    me.b4deselectAll();
                    me.doSelect(record, false);
                }
                break;
        }

        if (!shift) {
            if (me.isSelected(record)) {
                me.selectionStart = record;
            } else {
                me.selectionStart = null;
            }
        }
    },
});