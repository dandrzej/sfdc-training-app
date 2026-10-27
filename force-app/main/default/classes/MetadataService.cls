public with sharing class MetadataService {
  public static List<String> getPicklistLabels(Schema.SObjectField fieldRef) {
    Schema.DescribeFieldResult d = fieldRef.getDescribe();

    // Safety: make sure it's a picklist (or multi-picklist) field
    Schema.DisplayType t = d.getType();
    if (
      t != Schema.DisplayType.Picklist &&
      t != Schema.DisplayType.MultiPicklist
    ) {
      // Returning empty list is "safe" for cacheable methods used by UI
      return new List<String>();
    }

    List<String> labels = new List<String>();
    for (Schema.PicklistEntry e : d.getPicklistValues()) {
      labels.add(e.getLabel());
    }
    return labels;
  }
}