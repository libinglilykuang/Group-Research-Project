// See https://aka.ms/new-console-template for more information
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;

// Need to:
// 1. Initialise the pipeline (already done for us)
// 2. Fetch data from the REST API (to do)
// 3. Send each sample into the pipeline using write async function (done(?))
// 4. Process data as it flows through the pipeline (already done for us)

var compressedValues = new List<DataCoreTagValue>();

var pipeline = new PipelineBuilder()
    .WithIdentifier("PipeLineId")


    .WithCompressionFilter(new CompressionFilterSettings()
    {
        DeviationLimit = 2,
        DeviationType = DeviationType.Percentage
    }).WithExceptionFilter(new ExceptionFilterSettings()
    {
        DeviationLimit = 2,
        DeviationType = DeviationType.Percentage
    }).WithValueChangeFilter(new ValueChangeFilterSettings()
    {
        MinimumResampleLimit = new TimeSpan(0, 0, 2), // Minimum resample limit of 2 seconds
        MaximumResampleLimit = new TimeSpan(0, 0, 5) // Maximum resample limit of 10 seconds (must be at least one sample within 10 seconds)
        // currently hardcoded but need to be modifiable by the user

    }).WithCallbackFilter(value =>
    {
        compressedValues.Add(value);

        return true;
    }).Build();

    
List<double> testValues = [];

    // DATA VALUES
    testValues.Add(0.0);
    testValues.Add(0.1);
    testValues.Add(0.2);
    testValues.Add(0.3);
    testValues.Add(0.4);
    testValues.Add(0.5);
    testValues.Add(0.6);
    testValues.Add(0.7);
    testValues.Add(0.8);
    testValues.Add(0.9);



var now = DateTime.Now;
var parsedValues = new List<DataCoreTagValue>();

//var tagValueToWrite = new DataCoreTagValue("Tag Name", DateTime.UtcNow, 100);


for (int i = 0; i < testValues.Count; i++) {
    var timeStamp = now.AddMinutes((testValues.Count-i) * -2);
    parsedValues.Add(new DataCoreTagValue("tag1", timeStamp, testValues[i]));
}

for (int i = 0; i < parsedValues.Count; i++) {
    await pipeline.WriteAsync(parsedValues[i]);

}

//await pipeline.WriteAsync(tagValueToWrite);