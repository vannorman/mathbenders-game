import {NumberWall} from "./template.js";

const savedTemplates = [
    {
        name: 'numberwall',
        position: [],
        rotation: [],
        scale: [],
        attributes: [
            { name: 'fraction', value: [/* Numerator */ 1, /* Denominator */ 4] },
        ]
    }
];

const toGameTemplate = (savedTemplateData) => {
    const templateMap = new Map([
        ['numberwall', new NumberWall({...savedTemplateData})]
        // other entries
    ]);
    return templateMap.get(savedTemplateData.name);
}

// Map saved template data to a game template
const templates = savedTemplates.map(toGameTemplate);
const numberwall = templates[0];

const fractionAttribute = numberwall.attributes[0];
console.log('initial', fractionAttribute.name , 'attribute value with data from database JSON:', fractionAttribute.value);
const [numeratorProperty, denominatorProperty] = fractionAttribute.properties;
numeratorProperty.value = 5;    // Invoked by code on the popup tray
denominatorProperty.value = 7;  // Invoked by code on the popup tray
console.log('final', fractionAttribute.name , 'attribute after editing the template:', fractionAttribute.value);

const serializedNumberWall = JSON.stringify(numberwall.serialize());
console.log('\nnumberwall serialized post editing:', serializedNumberWall);
