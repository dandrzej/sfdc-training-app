import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FORM_FACTOR from "@salesforce/client/formFactor";
import EXERCISE_OBJECT from '@salesforce/schema/Exercise__c';
import LIFT_ID from '@salesforce/schema/Exercise__c.Lift__c';
import TRAINING_ID from '@salesforce/schema/Exercise__c.Training__c';
import WEIGHT_FIELD from '@salesforce/schema/Exercise__c.Weight__c';
import NUMBER_OF_SETS from '@salesforce/schema/Exercise__c.Number_of_sets__c';
import NUMBER_OF_REPS from '@salesforce/schema/Exercise__c.Number_of_reps__c';
import TRAINING_DATE from '@salesforce/schema/Exercise__c.Training_date__c';
import PREVIOUS_NUMBER_OF_REPS from '@salesforce/schema/Exercise__c.previous_training_reps__c';
import PREVIOUS_COMMENT from '@salesforce/schema/Exercise__c.previous_comment__c';
import COMMENT from '@salesforce/schema/Exercise__c.comment__c';
import PROGRESS from '@salesforce/schema/Exercise__c.Progress__c';
import { RefreshEvent } from 'lightning/refresh';



export default class ExerciseForm extends LightningElement {
    @api exercise;
    @api trainingId;

    //TODO is it necessary ?
    objectApiName = EXERCISE_OBJECT;
    liftId = LIFT_ID;
    formFieldTrainingId = TRAINING_ID;
    liftWeight = WEIGHT_FIELD;
    liftSets = NUMBER_OF_SETS;
    liftReps = NUMBER_OF_REPS;
    previousliftReps = PREVIOUS_NUMBER_OF_REPS;
    previousComment = PREVIOUS_COMMENT;
    comment = COMMENT;
    progress = PROGRESS;
    trainingDate = TRAINING_DATE;
    deviceUsed = FORM_FACTOR;



    get formStyle() {
        if (this.exercise.alreadyUsed) {
            return 'slds-box slds-p-around_medium ALREADY_USED'
        }
        //slds-form slds-form_stacked slds-form_horizontal-medium slds-p-horizontal_medium slds-box slds-p-around_medium
        return 'slds-box slds-p-around_medium ' + this.exercise.Progress__c;
    }


    get deviceSizing() {
        return this.deviceUsed === 'Small'
            ? 'slds-form slds-form_stacked slds-p-around_medium'
            : 'slds-grid slds-gutters slds-p-horizontal_medium';
    }


    handleSuccess(success) {
        const toastEvent = new ShowToastEvent({
            title: "Exercise added to traning",
            message: 'Click {0} to view the record.',
            messageData: [
                {
                    url: '/' + success.detail.id,
                    label: 'here'
                }
            ], variant: "success"
        });
        //REFACTOR ? change data from parent on child
        this.exercise = {
            ...this.exercise,
            alreadyUsed: true
        };
        this.dispatchEvent(toastEvent);
        this.dispatchEvent(new RefreshEvent());
    }
}