import { LightningElement, api, wire } from 'lwc';
import Toast from 'lightning/toast';
import { publish, MessageContext } from 'lightning/messageService';
import DIET_ENTRY_SAVED_CHANNEL from '@salesforce/messageChannel/DietEntrySaved__c';

import DIET_ENTRY_OBJECT from '@salesforce/schema/Diet_entry__c';
import GREENS_FIELD from '@salesforce/schema/Diet_entry__c.Greens__c';
import PROTEIN_FIELD from '@salesforce/schema/Diet_entry__c.Protein__c';
import FATS_FIELD from '@salesforce/schema/Diet_entry__c.Fats__c';
import CARBS_FIELD from '@salesforce/schema/Diet_entry__c.Carbs__c';
import IN_PLUS_FIELD from '@salesforce/schema/Diet_entry__c.inPlus__c';
import IN_MINUS_FIELD from '@salesforce/schema/Diet_entry__c.inMinus__c';
import NEXT_STEPS_FIELD from '@salesforce/schema/Diet_entry__c.next_steps__c';
import DESCRIBTION_FIELD from '@salesforce/schema/Diet_entry__c.Description__c';
import getLeatesDietEntryDebrief from '@salesforce/apex/DietEntryController.getLeatesDietEntryDebrief';




export default class DietRecordCreator extends LightningElement {
    object = DIET_ENTRY_OBJECT;
    fields = [CARBS_FIELD, FATS_FIELD, GREENS_FIELD, PROTEIN_FIELD, DESCRIBTION_FIELD, IN_PLUS_FIELD, IN_MINUS_FIELD, NEXT_STEPS_FIELD];
    next = NEXT_STEPS_FIELD;
    debrifeRecordId;

    //TODO1 przemień to obiekty podobnie jak lift-exercise
    portionSizes = [
        { label: 'Ser żółty plaster', size: "palm/śródręcze", grams: "20", protien: '10', fat: '10', carbs: '0', value: 'Small' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Large', value: 'Large' },
    ];

    @wire(getLeatesDietEntryDebrief)
    wiredTargetMuscles({ data, error }) {
        if (data) {
            console.log(`debrifeRecordId : ` + JSON.stringify(data));
            //this.debrifeRecordId = data[0].Id;
            this.debrifeRecordId = data;
            console.log(JSON.stringify(Object.values(data)));
            console.log(this.debrifeRecordId);
        } else if (error) {
            console.log(JSON.stringify(error));
        }
    }

    @wire(MessageContext)
    messageContext

    handleSuccess(success) {
        const recordId = success.detail.id;
        // If you know the object API name, build a deep link like:
        // const url = `/lightning/r/YourObject__c/${recordId}/view`;
        // If you don't, this relative URL still opens the record page:
        const payload = { recordId: success.detail.id, action: 'create' }
        publish(this.messageContext, DIET_ENTRY_SAVED_CHANNEL, payload);


        const url = `/lightning/r/${recordId}/view`;
        //console.log(url);
        Toast.show({
            label: 'Record created',
            // messageTemplate lets you inject clickable links via messageData
            message: "{0}",
            messageLinks: [
                {
                    url: url,
                    label: 'Open Record'
                }
            ],
            variant: 'success',
            mode: 'dismissible'
        });

        // clear all fields
        this.template.querySelectorAll('lightning-input-field')
            .forEach(field => field.reset());
    }



}