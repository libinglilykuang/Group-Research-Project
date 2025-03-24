// See https://aka.ms/new-console-template for more information
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;

// Need to:
// 1. Initialise the pipeline (already done for us)
// 2. Fetch data from the REST API (to do)
// 3. Send each sample into the pipeline using write async function (done(?))
// 4. Process data as it flows through the pipeline (already done for us)

var compressedValues = new List<DataCoreTagValue>();

// Configure Parameters
double deviationLimit = 15;
TimeSpan minResample = TimeSpan.FromMinutes(1);
TimeSpan maxResample = TimeSpan.FromMinutes(3);

var pipeline = new PipelineBuilder()
    .WithIdentifier("PipeLineId")
    .WithCompressionFilter(new CompressionFilterSettings() {
        DeviationLimit = deviationLimit,
        DeviationType = DeviationType.Percentage
    }) .WithExceptionFilter(new ExceptionFilterSettings() {
        DeviationLimit = 5,
        DeviationType = DeviationType.Percentage
    }) .WithValueChangeFilter(new ValueChangeFilterSettings() {
        MinimumResampleLimit = minResample, // Minimum resample limit of 2 seconds
        MaximumResampleLimit = maxResample // Maximum resample limit of 10 seconds (must be at least one sample within 10 seconds)
    // Currently hardcoded but need to be modifiable by the user
    }) .WithCallbackFilter(value => {
        compressedValues.Add(value);
        return true;
    }) .Build();

/*
To properly run program: 
1. dotnet clean
2. dotnet restore
3. dotnet build --configuration Release
4. dotnet run --configuration Release
*/

// Sample Data
List<double> testValues = new() {
    0.0, 1.0, 1.3, 1.2, 2.1, 2.1, 2.3, 1.9, 1.8, 1.8
};

var now = DateTime.Now;

// Process Data
foreach (var value in testValues.Select((val, i) => new DataCoreTagValue("tag1", now.AddMinutes(-2 * (testValues.Count - i)), val))) {
    await pipeline.WriteAsync(value);
}

// Output Results
Console.WriteLine($"\nNumber of Original Points: {testValues.Count}");
foreach (var (val, i) in testValues.Select((v, i) => (v, i))) {
    Console.WriteLine($" {i} : {val}");
}

Console.WriteLine($"Number of Compressed Points: {compressedValues.Count}");
foreach (var (val, i) in compressedValues.Select((v, i) => (v.NumericValue, i))) {
    Console.WriteLine($" {i} : {val}");
}

Console.WriteLine($"Compression Ratio: {((double)compressedValues.Count / testValues.Count):P2}");