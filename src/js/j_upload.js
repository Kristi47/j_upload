/*
    jQUery File Handler , j_upload v1.0.0
    @author Kristi Mita
    @email kristimita33@gmail.com

    Handling files on frontend, add or remove files before uploading it.
    File validation is also supported
 */

(function ($, window, document) {

    $.fn.j_upload = function (options) {
        return this.each(function () {
            var Helper = (function () {

                var _id = "#{id}_preview";
                var tag_builder = "<{tag}></{tag}>";
                var tag_remove = "<a href='' target='{input_name}' file_id='{file_id}' class='{custom_class} {default_class}'>{rm_label}</a>";
                var single_preview = '<{tag} class="j_preview_container_item" title="{file_name}">{file_short_name} ({file_extension}) ({file_size} MB) {href}</{tag}}>';
                var multiple_preview = '<{tag} class="j_preview_container_item {exist_class}" title="{file_name}" id="{file_id}">{file_short_name} ({file_extension}) ({file_size} MB) {href}</{tag}>';
                var isValid = true;

                var createPreviewElement = function (input_obj, options) {
                    var dom_element = $(tag_builder.pyFormat({tag: options.preview_element}));
                    dom_element.attr("id", input_obj.attr("id") + "_preview");
                    dom_element.attr("class", "j_preview_container");
                    input_obj.after(dom_element);
                    if(options.enable_validation)
                        createMessageElement(dom_element, options);
                };

                var createMessageElement = function (dom_element, options) {
                    var msg_element = $(tag_builder.pyFormat({tag: options.message_element}));
                    msg_element.attr("id", dom_element.attr("id") + "_message");
                    msg_element.attr("class", "j_message_container");
                    dom_element.after(msg_element);
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
                        if(options.enable_validation)
                            singleFileValidation(input_name, options);
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
                        if(options.enable_validation)
                            multipleFileValidation(input_name, options);
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
                    return single_preview.pyFormat(file_info);
                };

                var createPreviewMultipleItem = function (file, input_name, file_id, options) {
                    var file_info = getFileInfo(file);
                    var exists = checkFileExist(file_info, input_name);
                    file_info['exist_class'] = exists ? "j_file_exist" : "";
                    file_info['tag'] = options.preview_element_item;
                    file_info['file_id'] = file_id;
                    file_info['href'] = tag_remove.pyFormat({
                        default_class: "j_remove_multiple",
                        input_name: input_name,
                        file_id: file_id,
                        custom_class: options.remove_link_style,
                        rm_label: options.remove_link_label
                    });
                    return multiple_preview.pyFormat(file_info);
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

                var singleFileValidation = function (input_name, options) {
                    var message_preview = $("#"+input_name+"_preview_message");
                    var file_info = getFileInfo(single_files[input_name].file);
                    var validation_obj = validationRules(input_name, options, file_info);
                    if(!validation_obj.valid) message_preview.html(validation_obj.error_msg);
                    else message_preview.html("");
                    isValid = validation_obj.valid;
                };

                var multipleFileValidation = function (input_name, options) {
                    var message_preview = $("#"+input_name+"_preview_message");
                    var validation_obj = {
                        valid:true,
                        error_msg:""
                    };
                    for (var i = 0; i < multiple_files[input_name].length; i++) {
                        var file_info = getFileInfo(multiple_files[input_name][i].file);
                        var obj =  validationRules(input_name, options, file_info);
                        validation_obj.valid = obj.valid;
                        validation_obj.error_msg = obj.error_msg;
                    }
                    if(multiple_files[input_name].length > options.validation[input_name].file_count) {
                        validation_obj.valid = false;
                        validation_obj.error_msg += "<{tag}>{msg}</{tag}>".pyFormat({
                            tag:options.message_element_item,
                            msg:options.validation_message.file_count.pyFormat({
                                file_count:options.validation[input_name].file_count
                            })
                        });
                    }
                    if(!validation_obj.valid) message_preview.html(validation_obj.error_msg);
                    else message_preview.html("");
                    isValid = validation_obj.valid;
                };

                var validationRules = function (input_name, options, file_info) {
                    var error_msg = "";
                    var valid = true;
                    if(file_info.file_size > options.validation[input_name].file_size) {
                        valid = false;
                        error_msg += "<{tag}>{msg}</{tag}>".pyFormat({
                            tag:options.message_element_item,
                            msg:options.validation_message.file_size.pyFormat({
                                file_size:options.validation[input_name].file_size
                            })
                        });
                    }
                    if(options.validation[input_name].file_type.length !== 0){
                        if($.inArray(file_info.file_extension, (options.validation[input_name].file_type)) < 0) {
                            valid = false;
                            error_msg += "<{tag}>{msg}</{tag}>".pyFormat({
                                tag:options.message_element_item,
                                msg:options.validation_message.file_type.pyFormat({
                                    file_type:JSON.stringify(options.validation[input_name].file_type)
                                })
                            });
                        }
                    }
                    return {
                        valid:valid,
                        error_msg:error_msg
                    }
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
                        $("#"+input_name+"_preview_message").html("");
                        single_files[input_name] = null;
                    });
                };

                var removeMultipleFile = function (options) {
                    $(document).on("click", ".j_remove_multiple", function (event) {
                        event.preventDefault();
                        var input_name = $(this).attr("target");
                        var file_id = $(this).attr("file_id");
                        $(_id.pyFormat({id: input_name})).children("#" + file_id).remove();
                        for (var key in multiple_files) {
                            for (var i = 0; i < multiple_files[key].length; i++) {
                                if (multiple_files[key][i].id === file_id) {
                                    multiple_files[key].splice(i, 1);
                                }
                            }
                        }
                        multipleFileValidation(input_name, options);
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

                var j_isValid = function(){
                    return isValid;
                };

                return {
                    handleSingleFileUpload:handleSingleFileUpload,
                    handleMultipleFileUpload:handleMultipleFileUpload,
                    createPreviewElement:createPreviewElement,
                    removeSingleFile:removeSingleFile,
                    removeMultipleFile:removeMultipleFile,
                    pyFormat:pyFormat,
                    j_isValid:j_isValid
                }
            })();

            var Uploader = (function (_this, Helper) {
                var init = function (options) {
                    String.prototype.pyFormat = Helper.pyFormat;
                    window.multiple_files = [];
                    window.single_files = [];
                    var files_obj = _this.find("input:file");
                    var single_file_obj = [];
                    var multiple_file_obj = [];
                    setDefaultValidation(files_obj);
                    setClientOptions(options);
                    options = $.extend(true, defaults, options);
                    populateObjectArrays(files_obj, single_file_obj, multiple_file_obj);
                    singleFileUpload(single_file_obj, options);
                    multipleFileUpload(multiple_file_obj, options);
                    Helper.removeSingleFile();
                    Helper.removeMultipleFile(options);
                };

                var setDefaultValidation = function (files_obj) {
                    files_obj.each(function () {
                        var input_name =$(this).attr("name").replace(/\[|]/gm, "");
                        defaults.validation[input_name] = $.extend(true, {}, rules);
                    });
                };

                var setClientOptions = function (options) {
                    if(typeof(options) != "undefined" && typeof(options.validation) != "undefined"){
                        $.each(defaults.validation, function (key, value) {
                            defaults.validation[key] = $.extend(defaults.validation[key], options.validation[key]);
                        });
                    }
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


                window.j_prepareFormData = function (_this) {
                    var formData = new FormData(_this);
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

                window.j_isValid = function () {
                    return Helper.j_isValid();
                };

                return {
                    init: init
                };

            })($(this), Helper);


            var rules = {
                file_size:2,
                file_type:[],
                file_count: 5
            };

            var defaults = {
                message_element:"div",
                message_element_item:"span",
                preview_element:"div",
                preview_element_item:"span",
                remove_link_style:"j_remove_link",
                remove_link_label:"X",
                enable_validation:false,
                validation:{},
                validation_message:{
                    file_size:"File size must be lower than {file_size} MB",
                    file_type:"File type must be {file_type}",
                    file_count:"Number of files must not exceed {file_count} files"
                }
            };

            var version = jQuery().jquery;
            if(version < "3.4.1"){
                throw Error("Wrong jQuery version, update to version 3.4.1");
            }
            if(typeof(options) !== "undefined" && typeof(options) !== "object"){
                throw Error("Wrong parameter, to initialize pass an Object");
            }
            Uploader.init(options);
        });
    };
})(jQuery, window, document);
