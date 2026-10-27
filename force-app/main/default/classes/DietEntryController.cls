public with sharing class DietEntryController {
  //REFACTOR change so each user will have its own avarage
  private static final Integer AVG_DAYS = 6;
  //private static final Integer PROTIEN_TARGET = 170;

  @AuraEnabled(cacheable=true)
  public static List<Diet_entry__c> getDietEntries() {
    List<Diet_entry__c> dietEntries = Database.query(
      'SELECT Carbs__c,Fats__c,Greens__c,Protein__c,Id,Consumption_DataTime__c FROM Diet_entry__c WHERE Consumption_DataTime__c  = LAST_N_DAYS:' +
        AVG_DAYS +
        ' ORDER BY Consumption_DataTime__c  DESC'
    );
    return dietEntries;
  }

  @AuraEnabled(cacheable=true)
  public static List<Diet_entry__c> getLeatesDietEntryDebrief() {
    // List<Diet_entry__c> leatesDietEntryDebrief = Database.query(
    //   'SELECT Id FROM Diet_entry__c WHERE has_next_steps__c = TRUE ORDER BY CreatedDate DESC LIMIT ' +
    //   AVG_DAYS
    // );
    // return leatesDietEntryDebrief;

    return [
      SELECT Id
      FROM Diet_entry__c
      WHERE has_next_steps__c = TRUE
      ORDER BY Consumption_DataTime__c DESC
      LIMIT :AVG_DAYS
    ];
  }

  // @AuraEnabled(cacheable=true)
  // public static Decimal avarageProteinCoumption() {
  //   List<Diet_entry__c> dietEntries = getDietEntries();
  //   Decimal proteinSum = 0;
  //   Decimal proteinAverage = 0;
  //   for (Diet_entry__c dietEntry : dietEntries) {
  //     proteinSum += dietEntry.Protein__c;
  //   }
  //   proteinAverage = proteinSum / AVG_DAYS;
  //   return proteinAverage;
  // }

  @AuraEnabled(cacheable=true)
  public static Decimal totalPorteinConsumption() {
    List<Diet_entry__c> dietEntries = [
      SELECT Protein__c
      FROM Diet_entry__c
      WHERE Consumption_DataTime__c = TODAY
    ];
    Decimal proteinSum = 0;
    for (Diet_entry__c dietEntry : dietEntries) {
      proteinSum += (dietEntry.Protein__c == null ? 0 : dietEntry.Protein__c);
    }
    return proteinSum;
  }
}