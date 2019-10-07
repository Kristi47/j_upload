## j_upload

jUpload is a jQuery package for managing files. Dynamically add and remove files before upload. Custom file validation.

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install j_upload.

```bash
npm install j_upload
```
Include the script from the node_modules to your html file.<br/>
Or download the j_upload.js file directly from git and include it.

## Basic Usage

Call j_upload() on the form selector to initialize it.
```
$("#form-id").j_upload()
```

Chain it with submit() function of jQuery to handle form submission

```
$("#form-id").j_upload().submit(function(event){
    ...
});
```

## Custom Usage

j_upload function takes an Object as argument. Full Object example below:

```
 $("#form-id").j_upload({
            message_element: "ul",
            message_element_item: "li",
            preview_element: "ul",
            preview_element_item: "li",
            remove_link_label: "Remove",
            remove_link_style: "j_remove_link",
            enable_validation:true,
            validation:{
                photos:{
                    file_size:5,
                    file_type:['.pdf', '.txt'],
                    file_count: 3
                },
                videos:{
                    file_size:25,
                    file_type:[]
                },
                image:{
                    file_size:3,
                    file_count:50
                },
                product:{
                    file_size:2,
                    file_type:[],
                    file_count:15
                }
            }
        }).submit(function(event){
            ...
        })
```
- **message_element** - define html tag that will contain file validation error messages
```
 message_element: "ul"
 message_element: "div"
```
- **message_element_item** - define html tag that will contain a single file validation error message
```
 message_element: "li"
 message_element: "span"
```
- **preview_element** - define html tag that will contain multiple files preview, (name, extension, size)
```
 preview_element: "ul"
```
- **preview_element_item** - define html tag for a single file preview
```
 preview_element_item: "li"
```
- **remove_link_label** - define label for removing file (ex: X or 'Remove', <img> tag)
```
 remove_link_label: "X"
 remove_link_label: "Remove"
 remove_link_label: "<img src='remove_icon.png'/>"
```
- **remove_link_style** - define the css class for removing link
- **enable_validation** - enables default file validation (default: false)
  - file_size: 2MB (default) - max size for single file
  - file_type: [] (default) - empty array allows all type of file, define types ['.txt', '.pdf']
  - file_count: 5 (default) - max number of files for multiple file input
```
 enable_validation: true
```
- **validation** - nested object to define custom validation for different input files, use input name to define custom validation rules for specific element</br>
```
photos:{
    file_size:5,
    file_type:['.pdf', '.txt'],
    file_count: 3
},
videos:{
    file_size:25,
    file_type:[]
}
```
- photos - is the name of html input element
- videos - is the name of html input element

## Functions
- **j_prepareFormData()** - return a FormData Object which will be used in HTTP Request, See example below.
- **j_isValid()** - returns a boolean to indicate if the form has passed the validation rules.

```
$("#form-id").j_upload({
     enable_validation:true
}).submit(function(event){
    event.preventDefault();
    
    var formData = j_prepareFormData(this);
    
    if(!j_isValid()){
        console.log("Form is not valid");
        return;
    }
    
    $.ajax({
       ...
    });
});
```

## Contributing
Pull requests are welcome. Please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
