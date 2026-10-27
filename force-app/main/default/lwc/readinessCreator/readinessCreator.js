import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import READINESS_OBJECT from '@salesforce/schema/Readiness__c';
import READINESS_LEVEL_FIELD from '@salesforce/schema/Readiness__c.Readiness_level__c';
import MOTIVATION_FIELD from '@salesforce/schema/Readiness__c.Motivation__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Readiness__c.description__c';
import INJURY_FIELD from '@salesforce/schema/Readiness__c.Injury__c';
import PAIN_DESCIPTION_FIELD from '@salesforce/schema/Readiness__c.Pain_description__c';
import STRESS_LEVEL_FIELD from '@salesforce/schema/Readiness__c.Stress_level__c';
import SLEEP_FIELD from '@salesforce/schema/Readiness__c.Sleep__c';
import SLEEP_DURATION_FIELD from '@salesforce/schema/Readiness__c.Sleep_duration__c';
import CENTRAL_FATIGUE_FIELD from '@salesforce/schema/Readiness__c.Central_fatigue__c';
import SORNESS_LEVEL_FIELD from '@salesforce/schema/Readiness__c.Soreness_level__c';
import SORNESS_AREAS_FIELD from '@salesforce/schema/Readiness__c.Soreness_areas__c';
import MOOD_FIELD from '@salesforce/schema/Readiness__c.Mood__c';
import WEIGHT_FIELD from '@salesforce/schema/Readiness__c.Weight__c';
import NECK_CIRCUMFERENCE_FIELD from '@salesforce/schema/Readiness__c.Neck_circumference__c';
import WAIST_CIRCUMFERENCE_FIELD from '@salesforce/schema/Readiness__c.Waist_circumference__c';

export default class ReadinessCreator extends LightningElement {
    objectApiName = READINESS_OBJECT;
    fields = [WEIGHT_FIELD, NECK_CIRCUMFERENCE_FIELD, WAIST_CIRCUMFERENCE_FIELD, CENTRAL_FATIGUE_FIELD, SORNESS_LEVEL_FIELD, SORNESS_AREAS_FIELD, MOOD_FIELD, SLEEP_FIELD, SLEEP_DURATION_FIELD, STRESS_LEVEL_FIELD,
        MOTIVATION_FIELD, DESCRIPTION_FIELD, INJURY_FIELD, PAIN_DESCIPTION_FIELD, READINESS_LEVEL_FIELD];
    handleSuccess(success) {
        const toastEvent = new ShowToastEvent({
            title: "kakalaka",
            message: "Record ID: " + success.detail.id,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
    }
}