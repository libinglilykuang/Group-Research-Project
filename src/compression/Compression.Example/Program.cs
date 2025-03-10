// See https://aka.ms/new-console-template for more information
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;

// Need to:
// 1. Initialise the pipeline (already done for us)
// 2. Fetch data from the REST API (to do)
// 3. Send each sample into the pipeline using write async function (done(?))
// 4. Process data as it flows through the pipeline (already done for us)


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
        MinimumResampleLimit = TimeSpan.Zero, // No resample limit
        MaximumResampleLimit = new TimeSpan(0, 0, 5) // Maximum resample limit of 5 seconds
    }).WithCallbackFilter(value =>
    {
        // do something with the value here.
        // any values which have got here must have passed all of the filters.
        // so we now want to write them to a data structure.
        return true;
    }).Build();

var tagValueToWrite = new DataCoreTagValue("Tag Name", DateTime.UtcNow, 100);

await pipeline.WriteAsync(tagValueToWrite);