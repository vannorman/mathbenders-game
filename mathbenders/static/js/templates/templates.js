import * as Templates from "./index.js";
import * as Properties from "./properties.js";

window.TemplateNameMap = {};
window.PropertiesMap = {};

Object.values(Templates).forEach((Template)=>{
 //   console.log(Template.name);
    window[Template.name]=Template;
    window.TemplateNameMap[Template.name]=Template;
});

Object.values(Properties).forEach((Property)=>{
    // console.log(Property.name);
    window[Property.name]=Property;
    window.PropertiesMap[Property.name]=Property;
});


