using IntelligentPlant.Compression;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

var compressedValues = new List<TagValue>();

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
    }).WithCallbackFilter(value =>
    {
        compressedValues.Add(value);

        return true;
    }).Build();

var testValues = new List<double>() {
    100,
    101,
    102,
    101,
    4,
    4,
    4,
    5,
    5,
    5,
    50,
    -20,
    100
};

var now = DateTime.Now;
var parsedValues = new List<TagValue>();

for (int i = 0; i < testValues.Count; i++)
{
    var timeStamp = now.AddMinutes((testValues.Count - i) * -2);

    parsedValues.Add(new TagValue("tag1", timeStamp, testValues[i]));
}

for (int i = 0;i < parsedValues.Count; i++)
{
    await pipeline.WriteAsync(parsedValues[i]);
}
