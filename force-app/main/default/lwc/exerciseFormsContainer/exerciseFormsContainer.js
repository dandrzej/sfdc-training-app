import { LightningElement, api, wire, track } from 'lwc';
import getLiftsByName from '@salesforce/apex/programController.getLiftsByName';
import getLifts from '@salesforce/apex/programController.getLifts';
import getTargetedMuscles from '@salesforce/apex/programController.getTargetedMuscles';
import getEquipmentTypes from '@salesforce/apex/programController.getEquipmentTypes';
import getCompoundMovementPaterns from '@salesforce/apex/programController.getCompoundMovementPaterns';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';


const RADIO_OPTIONS = [
    { label: 'All', value: 'All' },
    { label: 'Compound', value: 'Compound' },
    { label: 'Isolation', value: 'Isolation' },
    { label: 'Search', value: 'Search' },
];
const QUERY_OPTIONS = {
    All: (label) => ({ targetedMuscle: label }),
    Compound: (label) => ({ pattern: label }),
    Isolation: (label) => ({ targetedMuscle: label, isolationOnly: true })
};

export default class ExerciseFormsContainer extends LightningElement {

    @api recordId;
    @track exercises;
    @track searchExercisesName;
    //TODO1 check if below reduntand
    @track searchExercises;
    @track targetedMuscles = [];
    @track equipmentTypes = [];
    @track compoundMovementPaterns = [];
    @track isLoading = false;
    radioValue = '';
    showExerciseForm = false;
    tabs = [];
    usedLifts = [];


    get radioOptions() {
        return RADIO_OPTIONS;
    }


    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Exercise__r',
        fields: ['Exercise__c.Lift__c']
    })
    wiredUsedLifts({ data, error }) {
        if (data) {
            this.usedLifts = data.records.map(record => record.fields.Lift__c.value);
        } else if (error) {
            this.showErrorToast(error);
        }
    }

    @wire(getTargetedMuscles)
    wiredTargetMuscles({ data, error }) {
        if (data) {
            this.targetedMuscles = data;
        } else if (error) {
            this.showErrorToast(error);
        }
    }

    @wire(getCompoundMovementPaterns)
    wiredCompoundMovementPaterns({ data, error }) {
        if (data) {
            this.compoundMovementPaterns = data;
        } else if (error) {
            this.showErrorToast(error);
        }
    }

    @wire(getEquipmentTypes)
    wiredEquipmentTypes({ data, error }) {
        if (data) {
            this.equipmentTypes = data;
        } else if (error) {
            this.showErrorToast(error);
        }
    }

    @wire(getLiftsByName, { liftName: '$searchExercisesName' })
    wiredLiftsByName({ data, error }) {
        if (data) {
            this.exercises = Object.values(data);
            console.log('wiredLiftsByName ' + JSON.stringify(this.exercises));
        } else if (error) {
            this.showErrorToast(error);
        }
    }


    //TODO1 add search
    //TODO2 enums instead 
    async handleRadioChange(event) {
        this.radioValue = event.detail.value;
        this.showExerciseForm = true;
        if (this.radioValue === 'Compound') {
            this.tabs = this.compoundMovementPaterns;
        }
        else {
            this.tabs = this.targetedMuscles;
            await this.loadExercises(this.tabs[0]);

        }
    }


    async handleSelectTab(event) {
        await this.loadExercises(event.target.label);
    }


    handleSearch() {
        const inputElement = this.template.querySelector('lightning-input');
        const inputValue = inputElement ? inputElement.value : '';
        if (inputValue) {
            this.searchExercisesName = inputValue;
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    //TODO1 add search
    buildQuery(label) {
        return QUERY_OPTIONS[this.radioValue]?.(label) || {};
    }

    async loadExercises(label) {
        this.isLoading = true;
        try {
            const params = this.buildQuery(label);
            const result = await getLifts(params);
            this.exercises = result ?
                Object.values(result).map(exercise => ({
                    ...exercise,
                    alreadyUsed: this.usedLifts.includes(exercise.Lift__c)
                }))
                : [];
        } catch (e) {
            this.showErrorToast(e);
        } finally {
            this.isLoading = false;
            //console.log('exercises ' + this.exercises.length);
        }
    }

    //TODO może wynieś ją gdzieś do utilsów, bo jest powtarzalna
    showErrorToast(error) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error loading data',
                message: error?.body?.message || JSON.stringify(error),
                variant: 'error'
            })
        );
    }
}