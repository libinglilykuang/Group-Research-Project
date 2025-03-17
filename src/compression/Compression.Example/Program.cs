// See https://aka.ms/new-console-template for more information
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;

// Need to:
// 1. Initialise the pipeline (already done for us)
// 2. Fetch data from the REST API (to do)
// 3. Send each sample into the pipeline using write async function (done(?))
// 4. Process data as it flows through the pipeline (already done for us)

/* double[,] items = new double [2,10]

    DATA VALUES
    items[0,0] = 0.0
    items[0,1] = 0.1
    items[0,2] = 0.2
    items[0,3] = 0.3
    items[0,4] = 0.4
    items[0,5] = 0.5
    items[0,6] = 0.6 
    items[0,7] = 0.7
    items[0,8] = 0.8
    items[0,9] = 0.9

    TIME VALUES
    items[1,0] = 1.0
    items[1,1] = 1.1
    items[1,2] = 1.2
    items[1,3] = 1.3
    items[1,4] = 1.4
    items[1,5] = 1.5
    items[1,6] = 1.6
    items[1,7] = 1.7
    items[1,8] = 1.8
    items[1,9] = 1.9

    pass values in as array

*/




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
        // do something with the value here.
        // any values which have got here must have passed all of the filters.
        // so we now want to write them to a data structure.

        // for (int i = 0; i < items.Length; i++) {
        //  if (items[i] == null or items[i] == "") {
        //      items[i] = value;
        // }
        // }

        return true;
    }).Build();

var tagValueToWrite = new DataCoreTagValue("Tag Name", DateTime.UtcNow, 100);


// for (int i = 0; i < items.Length; i++) {
//  await pipeline.WriteAsync(tagValuetoWrite)
//}

await pipeline.WriteAsync(tagValueToWrite);