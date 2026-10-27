import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class todayTrainingRecord extends NavigationMixin(
    LightningElement
) {
    //TODO1 https://developer.salesforce.com/docs/platform/lwc/guide/use-navigate.html
    //TODO1 change this to navigation tab so I will be able to navigate to the object pages like : readiness questionare, diet, todayTrainingRecord
    @api invoke() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'home'
            }
        });
    }
}