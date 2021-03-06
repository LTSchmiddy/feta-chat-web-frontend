/**
 * @module converse-dragresize
 * @copyright 2020, the Converse.js contributors
 * @license Mozilla Public License (MPLv2)
 */
import 'plugins/chatview/index.js';
import 'plugins/controlbox/index.js';
import { applyDragResistance, onMouseUp, onMouseMove, renderDragResizeHandles } from './utils.js';
import DragResizableMixin from './mixin.js';
import { _converse, api, converse } from '@converse/headless/core';

converse.plugins.add('converse-dragresize', {
    /* Plugin dependencies are other plugins which might be
     * overridden or relied upon, and therefore need to be loaded before
     * this plugin.
     *
     * If the setting "strict_plugin_dependencies" is set to true,
     * an error will be raised if the plugin is not found. By default it's
     * false, which means these plugins are only loaded opportunistically.
     *
     * NB: These plugins need to have already been loaded via require.js.
     */
    dependencies: ['converse-chatview', 'converse-headlines-view', 'converse-muc-views'],

    enabled (_converse) {
        return _converse.api.settings.get('view_mode') == 'overlayed';
    },

    overrides: {
        // Overrides mentioned here will be picked up by converse.js's
        // plugin architecture they will replace existing methods on the
        // relevant objects or classes.
        ChatBox: {
            initialize () {
                const result = this.__super__.initialize.apply(this, arguments);
                const height = this.get('height'),
                    width = this.get('width');
                const save = this.get('id') === 'controlbox' ? a => this.set(a) : a => this.save(a);
                save({
                    'height': applyDragResistance(height, this.get('default_height')),
                    'width': applyDragResistance(width, this.get('default_width'))
                });
                return result;
            }
        },

        ChatBoxView: {
            events: {
                'mousedown .dragresize-top': 'onStartVerticalResize',
                'mousedown .dragresize-left': 'onStartHorizontalResize',
                'mousedown .dragresize-topleft': 'onStartDiagonalResize'
            },

            render () {
                const result = this.__super__.render.apply(this, arguments);
                renderDragResizeHandles(this.__super__._converse, this);
                this.setWidth();
                return result;
            }
        },

        HeadlinesBoxView: {
            events: {
                'mousedown .dragresize-top': 'onStartVerticalResize',
                'mousedown .dragresize-left': 'onStartHorizontalResize',
                'mousedown .dragresize-topleft': 'onStartDiagonalResize'
            },

            render () {
                const result = this.__super__.render.apply(this, arguments);
                renderDragResizeHandles(this.__super__._converse, this);
                this.setWidth();
                return result;
            }
        },

        ControlBoxView: {
            events: {
                'mousedown .dragresize-top': 'onStartVerticalResize',
                'mousedown .dragresize-left': 'onStartHorizontalResize',
                'mousedown .dragresize-topleft': 'onStartDiagonalResize'
            },

            render () {
                const result = this.__super__.render.apply(this, arguments);
                renderDragResizeHandles(this.__super__._converse, this);
                this.setWidth();
                return result;
            },

            renderLoginPanel () {
                const result = this.__super__.renderLoginPanel.apply(this, arguments);
                this.initDragResize().setDimensions();
                return result;
            },

            renderControlBoxPane () {
                const result = this.__super__.renderControlBoxPane.apply(this, arguments);
                this.initDragResize().setDimensions();
                return result;
            }
        },

        ChatRoomView: {
            events: {
                'mousedown .dragresize-top': 'onStartVerticalResize',
                'mousedown .dragresize-left': 'onStartHorizontalResize',
                'mousedown .dragresize-topleft': 'onStartDiagonalResize'
            },

            render () {
                const result = this.__super__.render.apply(this, arguments);
                renderDragResizeHandles(this.__super__._converse, this);
                this.setWidth();
                return result;
            }
        }
    },

    initialize () {
        /* The initialize function gets called as soon as the plugin is
         * loaded by converse.js's plugin machinery.
         */
        api.settings.extend({
            'allow_dragresize': true
        });

        Object.assign(_converse.ChatBoxView.prototype, DragResizableMixin);

        /************************ BEGIN Event Handlers ************************/
        function registerGlobalEventHandlers () {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function unregisterGlobalEventHandlers () {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        api.listen.on('registeredGlobalEventHandlers', registerGlobalEventHandlers);
        api.listen.on('unregisteredGlobalEventHandlers', unregisterGlobalEventHandlers);
        api.listen.on('beforeShowingChatView', view => view.initDragResize().setDimensions());
    }
});
