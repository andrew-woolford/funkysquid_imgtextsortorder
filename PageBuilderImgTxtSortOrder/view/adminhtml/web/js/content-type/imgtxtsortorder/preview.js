define([
    'jquery',
    'underscore',
    'knockout',
    'mage/translate',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/content-type/preview',
    'Magento_PageBuilder/js/uploader',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/wysiwyg/factory'
], function ($, _, ko, $t, events, PreviewBase, uploader, config, wysiwygFactory) {
    'use strict';

    function Preview(parent, config, stageId) {
        PreviewBase.call(this, parent, config, stageId);
    }

    Preview.prototype = Object.create(PreviewBase.prototype);
    Preview.prototype.constructor = Preview;

    Preview.prototype.uploader = null;

    Preview.prototype.isWysiwygSupported = function () {
        return config.getConfig("can_use_inline_editing_on_stage");
    };

    Preview.prototype.initWysiwyg = function (element) {
        var self = this;
        this.element = element;
        element.id = this.contentType.id + "-editor";

        wysiwygFactory(
            this.contentType.id,
            element.id,
            this.config.name,
            this.config.additional_data.wysiwygConfig.wysiwygConfigData,
            this.contentType.dataStore,
            "description"
        ).then(function (wysiwyg) {
            self.wysiwyg = wysiwyg;
        });
    };

    Preview.prototype.initTextarea = function (element) {
        var self = this;

        this.textarea = element;
        this.textarea.value = this.contentType.dataStore.get("description");
        this.adjustTextareaHeightBasedOnScrollHeight();

        events.on("form:" + this.contentType.id + ":saveAfter", function () {
            self.textarea.value = self.contentType.dataStore.get("description");
            self.adjustTextareaHeightBasedOnScrollHeight();
        });
    };

    Preview.prototype.onTextareaKeyUp = function () {
        this.adjustTextareaHeightBasedOnScrollHeight();
        this.contentType.dataStore.update(this.textarea.value, "description");
    };

    Preview.prototype.onTextareaFocus = function () {
        $(this.textarea).closest(".pagebuilder-content-type").addClass("pagebuilder-toolbar-active");
        events.trigger("stage:interactionStart");
    };

    Preview.prototype.onTextareaBlur = function () {
        $(this.textarea).closest(".pagebuilder-content-type").removeClass("pagebuilder-toolbar-active");
        events.trigger("stage:interactionStop");
    };

    Preview.prototype.adjustTextareaHeightBasedOnScrollHeight = function () {
        this.textarea.style.height = "";
        var scrollHeight = this.textarea.scrollHeight;
        var minHeight = parseInt($(this.textarea).css("min-height").toString(), 10);

        if (scrollHeight === minHeight) {
            return;
        }

        $(this.textarea).height(scrollHeight);
    };

    Preview.prototype.isContainer = function () {
        return false;
    };

    /**
     * Return order class based on order selected
     *
     * @param element
     */
    Preview.prototype.getOrderClass = function () {
        var value = this.contentType.dataStore.get('order');
        return value ? 'sort-order-' + value : '';
    };
    /**
     * Return image type class if available
     *
     * @param element
     */
    Preview.prototype.getImageType = function () {
        var value = this.contentType.dataStore.get('image_type');
        return value ? 'image-type-' + value : '';
    };

    return Preview;
});
