import { LightningElement, wire } from 'lwc';
import getDietEntries from '@salesforce/apex/DietEntryController.getDietEntries';
import { refreshApex } from '@salesforce/apex';
import DIET_ENTRY_SAVED_CHANNEL from '@salesforce/messageChannel/DietEntrySaved__c';
import { subscribe, MessageContext } from 'lightning/messageService';

// ---------- Styling ----------
const STYLE_MAP = {
    None: 'slds-theme_success slds-text-title_bold force-text-success grade-chip',
    Low: 'slds-theme_success slds-text-title_bold force-text-success grade-chip',
    Mid: 'slds-theme_alt-inverse slds-text-title_bold force-text-default grade-chip',
    High: 'slds-theme_warning slds-text-title_bold force-text-default grade-chip',
    ULTRA: 'slds-theme_error slds-text-title_bold force-text-default grade-chip'
};

const STYLE_MAP_GREENS = {
    ULTRA: 'slds-theme_success slds-text-title_bold force-text-success grade-chip',
    High: 'slds-theme_success slds-text-title_bold force-text-success grade-chip',
    Mid: 'slds-theme_alt-inverse slds-text-title_bold force-text-default grade-chip',
    Low: 'slds-theme_warning slds-text-title_bold force-text-default grade-chip',
    None: 'slds-theme_error slds-text-title_bold force-text-default grade-chip'
};

// Grade thresholds (data-driven instead of big if-else blocks)
const THRESHOLDS = {
    Protein: [
        { max: 10, grade: 'None' },
        { max: 25, grade: 'Low' },
        { max: 50, grade: 'Mid' },
        { max: 75, grade: 'High' },
        { max: Infinity, grade: 'ULTRA' }
    ],
    Carbs: [
        { max: 10, grade: 'None' },
        { max: 35, grade: 'Low' },
        { max: 60, grade: 'Mid' },
        { max: 85, grade: 'High' },
        { max: Infinity, grade: 'ULTRA' }
    ],
    Fats: [
        { max: 5, grade: 'None' },
        { max: 13, grade: 'Low' },
        { max: 23, grade: 'Mid' },
        { max: 35, grade: 'High' },
        { max: Infinity, grade: 'ULTRA' }
    ]
};

const DEFAULT_GRADE_CLASS = 'slds-theme_error grade-chip';

export default class DietEntryTable extends LightningElement {
    // ---------- State ----------
    dietEntires = [];
    error;

    avarageProtein = 0; // keeping original name (bound in template?)
    todayProtein = 0;

    loading = true;

    proteinGoal = 170; // TODO: compute via LBM
    remainingProteinConsumption = 0;

    wiredDietEntriesResult;

    todayString = new Date().toJSON().slice(0, 10);

    kcal = { today: 0, avarage: 0 }; // keeping original shape/names

    // ---------- Datatable columns ----------
    columns = [
        {
            label: 'Protein',
            fieldName: 'recordUrl',
            type: 'url',
            cellAttributes: { class: { fieldName: 'ProteinGrade' } },
            typeAttributes: {
                label: { fieldName: 'Protein__c' },
                target: '_self'
            }
        },
        {
            label: 'Carbs',
            fieldName: 'Carbs__c',
            type: 'text',
            cellAttributes: { class: { fieldName: 'CarbsGrade' } }
        },
        {
            label: 'Fats',
            fieldName: 'Fats__c',
            type: 'text',
            cellAttributes: { class: { fieldName: 'FatsGrade' } }
        },
        {
            label: 'Greens',
            fieldName: 'Greens__c',
            type: 'text',
            cellAttributes: { class: { fieldName: 'GreensGrade' } }
        }
    ];

    // ---------- Wire ----------
    @wire(getDietEntries)
    wiredDietEntries(results) {
        this.wiredDietEntriesResult = results; // needed for refreshApex
        this.loading = false;

        const { data, error } = results;

        if (error) {
            this.handleWireError(error);
            return;
        }

        if (!data) {
            // No data yet (wire provisioning) - keep previous UI state or clear if you prefer.
            return;
        }

        this.error = undefined;

        // 1) Map rows -> view model
        this.dietEntires = this.mapDietEntries(data);

        // 2) Compute totals in one pass (locals only)
        const totals = this.computeTotals(data, this.todayString);

        // 3) Compute "average per day" once (your original logic divides by dateDiffer)
        const days = this.dateDiffer(this.dietEntires) || 1;

        const avgKcalPerDay = totals.sumKcal / days;
        const avgProteinPerDay = totals.sumProtein / days;

        // 4) Assign reactive state once (no nested mutation)
        this.kcal = {
            today: totals.todayKcal,
            avarage: Number(avgKcalPerDay.toFixed(2)) // keep numeric; remove Number() if you want string
        };

        this.todayProtein = totals.todayProtein;
        this.avarageProtein = Number(avgProteinPerDay.toFixed(2));

        this.remainingProteinConsumption = this.proteinGoal - this.todayProtein;
    }

    // ---------- Mapping / computation helpers ----------
    mapDietEntries(data) {
        return data.map(row => ({
            ...row,
            CarbsGrade: this.getGrade(row.Carbs__c, 'Carbs'),
            FatsGrade: this.getGrade(row.Fats__c, 'Fats'),
            GreensGrade: this.getGrade(row.Greens__c, 'Greens'),
            ProteinGrade: this.getGrade(row.Protein__c, 'Protein'),
            recordUrl: '/' + row.Id
        }));
    }

    computeTotals(data, todayString) {
        // reduce keeps it clearly "pure": no component state touched here
        return data.reduce(
            (acc, element) => {
                const kcal = this.kcalCalculator(element);
                const protein = Number(element?.Protein__c ?? 0);

                acc.sumKcal += kcal;
                acc.sumProtein += protein;

                const isToday = element.Consumption_DataTime__c?.slice(0, 10) === todayString;
                if (isToday) {
                    acc.todayKcal += kcal;
                    acc.todayProtein += protein;
                }
                return acc;
            },
            { todayKcal: 0, sumKcal: 0, todayProtein: 0, sumProtein: 0 }
        );
    }

    // ---------- Grade helpers ----------
    getGrade(value, macronutrient) {
        if (macronutrient === 'Greens') {
            return STYLE_MAP_GREENS[value] || DEFAULT_GRADE_CLASS;
        }

        const numericValue = Number(value ?? 0);
        const threshold = THRESHOLDS[macronutrient];
        if (threshold) {
            const grade = threshold.find(t => numericValue <= t.max)?.grade;

            // Protein uses GREENS styling map; everything else uses default STYLE_MAP
            const styleMap = (macronutrient === 'Protein') ? STYLE_MAP_GREENS : STYLE_MAP;

            return styleMap[grade] || DEFAULT_GRADE_CLASS;
        }


        // fallback (if someone passes 'Low'/'Mid'/etc directly)
        return STYLE_MAP[value] || STYLE_MAP.Low;

    }

    // ---------- Refresh ----------
    handleRefresh = async () => {
        await refreshApex(this.wiredDietEntriesResult);
    };

    // ---------- Date difference ----------
    dateDiffer(entries) {
        if (!Array.isArray(entries) || entries.length === 0) return 0;
        if (entries.length === 1) return 1;

        return Math.ceil(Math.abs(new Date(entries[0].Consumption_DataTime__c) - new Date(entries[entries.length - 1].Consumption_DataTime__c)) / 86400000);

    }

    // ---------- Kcal calculator ----------
    kcalCalculator(entry) {
        const kcalPerUnit = { Fat: 9, Carbs: 4, Protein: 4 };
        return (entry?.Carbs__c ?? 0) * kcalPerUnit.Carbs
            + (entry?.Fats__c ?? 0) * kcalPerUnit.Fat
            + (entry?.Protein__c ?? 0) * kcalPerUnit.Protein;
    }

    // ---------- UI helpers ----------
    get hasData() {
        return !this.loading && Array.isArray(this.dietEntires) && this.dietEntires.length > 0 && !this.error;
    }

    get isEmpty() {
        return !this.loading && Array.isArray(this.dietEntires) && this.dietEntires.length === 0 && !this.error;
    }

    get errorMessage() {
        return 'Failed to load Diet Entries.';
    }

    // ---------- Error handling ----------
    handleWireError(error) {
        this.dietEntires = [];
        this.error = error;
        console.error(JSON.stringify(error));
    }

    // ---------- LMS subscription ----------
    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (this.subscription) return;

        this.subscription = subscribe(
            this.messageContext,
            DIET_ENTRY_SAVED_CHANNEL,
            this.handleRefresh // message is ignored; refresh is enough
        );
    }
}