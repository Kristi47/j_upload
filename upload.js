(function($) {

     $.fn.uploader = function (options) {
         return this.each(function(){

             var _this = $(this); // reference to this, which is the form itself
             var formSelector = _this.attr("id").length > 0 ? "form#"+_this.attr("id") : "form."+_this.attr("class"); // prepare form select form#id or form.class
             var fileObj = _this.find("input:file"); // get all input object from form of type file
             var multipleFileObj = [];
             var singleFileObj = [];
             var singleFiles = [];
             console.log(fileObj);

             fileObj.each(function(key, obj){
                 if(typeof($(this).attr("multiple")) != "undefined")
                     multipleFileObj.push($(this));
                 else
                     singleFileObj.push($(this));
             });

             console.log(multipleFileObj);
             console.log(singleFileObj);

             var Module = (function () {

                 var createPreviewContainer = function(_this){
                     var div_id = _this.attr("id")+"_preview";
                     var div = $("<div></div>");
                     div.attr("id", div_id);
                     _this.after(div);
                 };

                 var handleSingleUpload = function (inputObj){
                     var inputName = inputObj.attr("name");  // get input file name
                     var filePreview = $("#"+inputObj.attr("id")+"_preview"); // get file preview div
                     inputObj.change(function(e){ // change event listener
                         console.log(inputName);
                         console.log(filePreview);

                         filePreview.html("");
                         var file = e.target.files[0];

                         console.log(file);
                         if(file){
                             filePreview.html(createPreviewItem(file, inputName) );
                         }
                         singleFiles[inputName] = {
                             file: file
                         };
                         e.target.value = null;
                         e.target.files = null;
                         $("#"+inputName).val("");
                     });
                 };

                 var createPreviewItem = function (file, inputName){
                     var dot = file.name.lastIndexOf('.');
                     var file_size = roundTwoDecimal((file.size / 1000) / 1000);
                     var file_name = file.name.substring(0, dot);
                     var file_extension = file.name.substring(dot);
                     var file_short_name = shortFilename(file_name);
                     return '<span title="'+file_name+'">'+file_short_name+' /('+file_extension+') ('+file_size+' MB) <a href="" targetInput="'+inputName+'" class="remove">Remove</a></span>';
                 };

                 var roundTwoDecimal = function(number){
                     return Math.round(number * 100) / 100;
                 };

                 var shortFilename = function (name){
                     return name.length > 10 ? name.substring(0, 10)+'...' : name;
                 };

                 var removeFile = function (){
                     $(document).on("click",".remove",function(event){
                         event.preventDefault();
                         var targetInput = $(this).attr("targetInput");
                         console.log(targetInput);
                         $("#"+targetInput+"_preview").html("");
                         singleFiles[targetInput] = null;
                         console.log(singleFiles);
                     });
                 };

                 return {
                     handleSingleUpload:handleSingleUpload,
                     createPreviewContainer:createPreviewContainer,
                     removeFile:removeFile
                 }
             })();

             $.each(singleFileObj, function(key, value){
                 Module.createPreviewContainer($(this));
                 Module.handleSingleUpload($(this));
             });

             Module.removeFile(); // expose removeFile function as global function
             console.log(singleFiles);

         });
    };
})(jQuery);