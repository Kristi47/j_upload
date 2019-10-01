(function ($, window, document) {

    $.fn.j_upload = function (options) {
        return this.each(function () {

            var Helper = (function () {

                var _id = "#{input_name}_preview";
                var tag_builder = "<{tag}></{tag}>";
                var tag_remove = "<a href='' target='{input_name}' file_id='{file_id}' class='{custom_class} {default_class}'>{rm_label}</a>";

                var createPreviewElement = function (input_obj, options) {
                    var dom_element = $(tag_builder.pyFormat({tag: options.preview_element}));
                    dom_element.attr("id", input_obj.attr("id") + "_preview");
                    dom_element.attr("class", "j_preview_container");
                    input_obj.after(dom_element);
                };

                var handleSingleFileUpload = function (input_obj, options) {
                    var input_name = input_obj.attr("name");
                    var file_preview = $("#" + input_obj.attr("id") + "_preview");
                    single_files[input_name] = null;
                    input_obj.change(function (e) {
                        file_preview.html("");
                        var file = e.target.files[0];
                        if (file) file_preview.html(createPreviewSingleItem(file, input_name, options));
                        single_files[input_name] = {
                            file: file
                        };
                        clearFileInput(e, input_name);
                    });
                };

                var handleMultipleFileUpload = function (input_obj, options) {
                    var input_name = input_obj.attr("name").substring(0, input_obj.attr("name").length - 2);
                    var file_preview = $("#" + input_obj.attr("id") + "_preview");
                    var file_counter = 0;
                    multiple_files[input_name] = [];
                    input_obj.change(function (e) {
                        for (var i = 0; i < e.target.files.length; i++) {
                            file_counter++;
                            var file = e.target.files[i];
                            var file_id = input_name + "_" + file_counter;
                            if (file) file_preview.append(createPreviewMultipleItem(file, input_name, file_id, options));
                            multiple_files[input_name].push({
                                id: file_id,
                                file: file
                            });
                        }
                        clearFileInput(e, input_name);
                    });
                };

                var createPreviewSingleItem = function (file, input_name, options) {
                    var file_info = getFileInfo(file);
                    file_info['tag'] = options.preview_element_item;
                    file_info['href'] = tag_remove.pyFormat({
                        file_id: "",
                        default_class: "j_remove",
                        input_name: input_name,
                        custom_class: options.remove_link_style,
                        rm_label: options.remove_link_label
                    });
                    return '<{tag} class="j_preview_container_item" title="{file_name}">{file_short_name} ({file_extension}) ({file_size} MB) {href}</{tag}}>'.pyFormat(file_info);
                };

                var createPreviewMultipleItem = function (file, input_name, file_id, options) {
                    var file_info = getFileInfo(file);
                    var exists = checkFileExist(file_info, input_name);
                    file_info['exist_class'] = exists ? "j_file_exist" : "";
                    console.log(file_info['exist_class']);
                    file_info['tag'] = options.preview_element_item;
                    file_info['file_id'] = file_id;
                    file_info['href'] = tag_remove.pyFormat({
                        default_class: "j_remove_multiple",
                        input_name: input_name,
                        file_id: file_id,
                        custom_class: options.remove_link_style,
                        rm_label: options.remove_link_label
                    });
                    return '<{tag} class="j_preview_container_item {exist_class}" title="{file_name}" id="{file_id}">{file_short_name} ({file_extension}) ({file_size} MB) {href}</{tag}>'.pyFormat(file_info);
                };

                var getFileInfo = function (file) {
                    var dot = file.name.lastIndexOf('.');
                    var file_size = roundTwoDecimal((file.size / 1000) / 1000);
                    var file_name = file.name.substring(0, dot);
                    var file_extension = file.name.substring(dot);
                    var file_short_name = shortFilename(file_name);
                    return {
                        file_name: file_name,
                        file_size: file_size,
                        file_extension: file_extension,
                        file_short_name: file_short_name,
                        file_last_modified: file.lastModified
                    }
                };

                var roundTwoDecimal = function (number) {
                    return Math.round(number * 100) / 100;
                };

                var shortFilename = function (file_name) {
                    return file_name.length > 10 ? file_name.substring(0, 10) + '...' : file_name;
                };

                var checkFileExist = function (new_file_info, input_name) {
                    for (var i = 0; i < multiple_files[input_name].length; i++) {
                        var old_file_info = getFileInfo(multiple_files[input_name][i].file);
                        if (new_file_info.file_name === old_file_info.file_name &&
                            new_file_info.file_size === old_file_info.file_size &&
                            new_file_info.file_last_modified === old_file_info.file_last_modified) {
                            return true;
                        }
                    }
                    return false;
                };

                var clearFileInput = function (e, input_name) {
                    e.target.value = null;
                    e.target.files = null;
                    $("#" + input_name).val("");
                };

                var removeSingleFile = function () {
                    $(document).on("click", ".j_remove", function (event) {
                        event.preventDefault();
                        var input_name = $(this).attr("target");
                        $(_id.pyFormat({input_name: input_name})).html("");
                        single_files[input_name] = null;
                    });
                };

                var removeMultipleFile = function () {
                    $(document).on("click", ".j_remove_multiple", function (event) {
                        event.preventDefault();
                        var input_name = $(this).attr("target");
                        var file_id = $(this).attr("file_id");
                        $(_id.pyFormat({input_name: input_name})).children("#" + file_id).remove();
                        for (var key in multiple_files) {
                            for (var i = 0; i < multiple_files[key].length; i++) {
                                if (multiple_files[key][i].id === file_id) {
                                    multiple_files[key].splice(i, 1);
                                }
                            }
                        }
                    });
                };

                var pyFormat = function (options) {
                    var string = this;
                    $.each(options, function (key, value) {
                        var regex = new RegExp("\{" + key + "\}", "gm");
                        string = string.replace(regex, value);
                    });
                    return string;
                };

                return {
                    handleSingleFileUpload: handleSingleFileUpload,
                    handleMultipleFileUpload: handleMultipleFileUpload,
                    createPreviewElement: createPreviewElement,
                    removeSingleFile: removeSingleFile,
                    removeMultipleFile: removeMultipleFile,
                    pyFormat: pyFormat
                }
            })();

            var Uploader = (function (_this, Helper) {

                var init = function (options) {
                    String.prototype.pyFormat = Helper.pyFormat;
                    options = $.extend(defaults, options);
                    window.multiple_files = [];
                    window.single_files = [];
                    var files_obj = _this.find("input:file");
                    var single_file_obj = [];
                    var multiple_file_obj = [];
                    populateObjectArrays(files_obj, single_file_obj, multiple_file_obj);
                    singleFileUpload(single_file_obj, options);
                    multipleFileUpload(multiple_file_obj, options);
                    Helper.removeSingleFile();
                    Helper.removeMultipleFile();
                };

                var populateObjectArrays = function (files_obj, single_file_obj, multiple_file_obj) {
                    files_obj.each(function (key, obj) {
                        if (typeof ($(this).attr("multiple")) != "undefined")
                            multiple_file_obj.push($(this));
                        else
                            single_file_obj.push($(this));
                    });
                };

                var singleFileUpload = function (single_file_obj, options) {
                    $.each(single_file_obj, function (key, value) {
                        Helper.createPreviewElement($(this), options);
                        Helper.handleSingleFileUpload($(this), options);
                    });
                };

                var multipleFileUpload = function (multiple_file_obj, options) {
                    $.each(multiple_file_obj, function (key, value) {
                        Helper.createPreviewElement($(this), options);
                        Helper.handleMultipleFileUpload($(this), options);
                    });
                };

                window.form_bind = function (_this) {
                    var formData = new FormData(_this);
                    console.log(single_files);
                    for (var index in single_files) {
                        formData.append(index, single_files[index] == null ? null : single_files[index].file);
                    }
                    for (var index in multiple_files) {
                        for (var i = 0; i < multiple_files[index].length; i++) {
                            formData.append(index + "[]", multiple_files[index][i].file);
                        }
                    }
                    return formData;
                };

                return {
                    init: init
                };

            })($(this), Helper);

            var defaults = {
                preview_element: "div",
                preview_element_item: "span",
                remove_link_style: "j_remove_link",
                remove_link_label: "X"
            };
            Uploader.init(options);
        });
    };
})(jQuery, window, document);
