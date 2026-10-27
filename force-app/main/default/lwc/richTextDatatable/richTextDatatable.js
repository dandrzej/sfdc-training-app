import LightningDatatable from 'lightning/datatable';
import richTextTemplate from './richTextCell.html';

export default class RichTextDatatable extends LightningDatatable {
    static customTypes = {
        // Use as: type: 'richText'
        richText: {
            template: richTextTemplate,
            standardCellLayout: true,
            typeAttributes: ['value'] // we’ll pass 'value' from columns.typeAttributes
        }
    };
}