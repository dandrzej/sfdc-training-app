//LEARN
// //https://trailhead.salesforce.com/content/learn/modules/custom_metadata_types_dec/cmt_create
// https://trailhead.salesforce.com/content/learn/modules/custom_metadata_types_adv
// https://trailhead.salesforce.com/content/learn/trails/configure-your-app-with-custom-metadata-types
// https://trailhead.salesforce.com/content/learn/modules/custom_metadata_types_adv

public with sharing class programController {
  @AuraEnabled(cacheable=true)
  public static Map<Id, Exercise__c> getLifts(
    String targetedMuscle,
    String pattern,
    Boolean isolationOnly
  ) {
    List<Lift__c> lifts;

    if (isolationOnly == true) {
      lifts = [
        SELECT Id
        FROM Lift__c
        WHERE
          Targeted_muscle__c INCLUDES (:targetedMuscle)
          AND Movement_patern__c = NULL
      ];
    } else if (pattern != null) {
      lifts = [
        SELECT Id
        FROM Lift__c
        WHERE Movement_patern__c = :pattern
      ];
    } else if (targetedMuscle != null) {
      lifts = [
        SELECT Id
        FROM Lift__c
        WHERE Targeted_muscle__c INCLUDES (:targetedMuscle)
      ];
    } else {
      lifts = new List<Lift__c>(); // or throw AuraHandledException
    }

    return getLeatestExerciseData(lifts);
  }

  @AuraEnabled(cacheable=true)
  public static Map<Id, Exercise__c> getLiftsByName(String liftName) {
    String queryVariable = '%' + liftName + '%';
    List<Lift__C> searchedLifts = [
      SELECT Id
      FROM Lift__C
      WHERE Name LIKE :queryVariable
    ];
    return getLeatestExerciseData(searchedLifts);
  }
  @AuraEnabled(cacheable=true)
  public static Map<Id, Exercise__c> getLeatestExerciseData(
    List<Lift__C> quriedLifts
  ) {
    if (quriedLifts == null || quriedLifts.isEmpty()) {
      return new Map<Id, Exercise__c>();
    }

    Set<Id> liftsIds = new Set<Id>();
    for (Lift__C lift : quriedLifts) {
      liftsIds.add(lift.Id);
    }
    //REFACTOR1 lift2 to lift

    List<Exercise__c> orderedExerciseData = [
      SELECT
        Lift__c,
        Lift__r.comment__c,
        Number_of_reps__c,
        Number_of_sets__c,
        Weight__c,
        Progress__c,
        training_date__c,
        comment__c
      FROM Exercise__c
      WHERE
        Lift__c IN :liftsIds
        //TODO2 refactor so null exercises are visible
        AND training_date__c != NULL
        AND Number_of_reps__c != NULL
      ORDER BY training_date__c DESC
    ];

    Map<Id, Exercise__c> LeatestExerciseData = new Map<Id, Exercise__c>();
    for (Exercise__c exercise : orderedExerciseData) {
      if (!LeatestExerciseData.containsKey(exercise.Lift__c)) {
        List<String> commentFragments = new List<String>();
        if (!String.isBlank(exercise.Lift__r.comment__c))
          commentFragments.add(
            'LIFT COMMENT: ' + exercise.Lift__r.comment__c.trim()
          );
        if (!String.isBlank(exercise.comment__c))
          commentFragments.add(
            'LAST EXECUTION COMMENT: ' + exercise.comment__c.trim()
          );

        if (!commentFragments.isEmpty()) {
          String summaryComment = String.join(commentFragments, '\n');
          // Optionally avoid rewrites if same value already present
          if (exercise.Comment__c != summaryComment) {
            exercise.Comment__c = summaryComment;
          }
        }

        //exercise.comment__c = exercise.Lift__r.comment__c + '<br>'+ exercise.comment__c;
        LeatestExerciseData.put(exercise.Lift__c, exercise);
      }
    }
    return LeatestExerciseData;
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getEquipmentTypes() {
    // Call helper from another class
    return MetadataService.getPicklistLabels(Lift__c.Type__c);
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getTargetedMuscles() {
    return MetadataService.getPicklistLabels(Lift__c.Targeted_muscle__c);
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getCompoundMovementPaterns() {
    return MetadataService.getPicklistLabels(Lift__c.Movement_patern__c);
  }

  public class InputWrapper {
    @InvocableVariable(label='Existing Lift Id')
    public String liftId;

    @InvocableVariable(label='Existing lift type')
    public String liftType;
  }
}