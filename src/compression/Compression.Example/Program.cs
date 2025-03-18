// See https://aka.ms/new-console-template for more information
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;
using System.Diagnostics;
using System.Threading;


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
        DeviationLimit = 15,
        DeviationType = DeviationType.Percentage
    }).WithExceptionFilter(new ExceptionFilterSettings()
    {
        DeviationLimit = 5,
        DeviationType = DeviationType.Percentage
    }).WithValueChangeFilter(new ValueChangeFilterSettings()
    {
        MinimumResampleLimit = TimeSpan.FromMinutes(1), // Minimum resample limit of 2 seconds
        MaximumResampleLimit = TimeSpan.FromMinutes(3) // Maximum resample limit of 10 seconds (must be at least one sample within 10 seconds)
        // currently hardcoded but need to be modifiable by the user
    }).WithCallbackFilter(value =>
    {
        compressedValues.Add(value);
        return true;
    }).Build();

    
List<double> testValues = [];

    // DATA VALUES
    testValues.Add(0.0);
    testValues.Add(1.0);
    testValues.Add(1.3);
    testValues.Add(1.2);
    testValues.Add(2.1);
    testValues.Add(2.1);
    testValues.Add(2.3);
    testValues.Add(1.9);
    testValues.Add(1.8);
    testValues.Add(1.8);


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

Console.WriteLine($"\nNumber of Original Points: {testValues.Count}");
for (int i = 0; i < testValues.Count; i++) {
    Console.WriteLine($" {i} : {testValues[i]}");
}

Console.WriteLine($"Number of Compressed Points: {compressedValues.Count}");
for (int i = 0; i < compressedValues.Count; i++) {
    Console.WriteLine($" {i} : {compressedValues[i].NumericValue}");
}

Console.WriteLine($"Compression Ratio: {((double)compressedValues.Count / testValues.Count):P2}");