// See https://aka.ms/new-console-template for more information
using System.Diagnostics;
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;

// Need to:
// 1. Initialise the pipeline (already done for us)
// 2. Fetch data from the REST API (to do)
// 3. Send each sample into the pipeline using write async function (done(?))
// 4. Process data as it flows through the pipeline (already done for us)

public class Algorithm {

    private readonly List<DataCoreTagValue> compressedValues = new();

    public async Task<CompressionResult> ProcessDataAsync(
        List<double> inputValues, double deviationLimit,
        TimeSpan minResample, TimeSpan maxResample) {

        // validate input
        if (inputValues == null || inputValues.Count == 0) {
            throw new ArgumentException("Input values cannot be null or empty.");
        }

        var stopwatch = Stopwatch.StartNew();
        compressedValues.Clear();

        var pipeline = new PipelineBuilder()
            .WithIdentifier("PipeLineId")
            .WithCompressionFilter(new CompressionFilterSettings() {
                DeviationLimit = deviationLimit,
                DeviationType = DeviationType.Percentage
            }) .WithExceptionFilter(new ExceptionFilterSettings() {
                DeviationLimit = 5,
                DeviationType = DeviationType.Percentage
            }) .WithValueChangeFilter(new ValueChangeFilterSettings() {
                MinimumResampleLimit = minResample,
                MaximumResampleLimit = maxResample
            }) .WithCallbackFilter(value => {
                compressedValues.Add(value);
                return true;
            }) .Build();

        var now = DateTime.Now;
        foreach (var value in inputValues.Select(
            (val, i) => new DataCoreTagValue("tag1", now.AddMinutes(-2 * (inputValues.Count - i)), val))) {
            await pipeline.WriteAsync(value);
        }

        stopwatch.Stop();
        return new CompressionResult {
            OriginalCount = inputValues.Count,
            CompressedCount = compressedValues.Count,
            CompressionRatio = (double)compressedValues.Count / inputValues.Count,
            ProcessingTimeMs = stopwatch.ElapsedMilliseconds,
            CompressedValues = new List<DataCoreTagValue>(compressedValues)
        };
    }
}

public class CompressionResult {
    public int OriginalCount { get; set; }
    public int CompressedCount { get; set; }
    public double CompressionRatio { get; set; }
    public long ProcessingTimeMs { get; set; }
    public List<DataCoreTagValue> CompressedValues { get; set; } = new();
}

/*
To run program: 
1. dotnet clean
2. dotnet restore
3. dotnet build --configuration Release
4. dotnet run --configuration Release
*/

class Program {
    static async Task Main(string[] args) {
        // Sample Data
        List<double> testValues = new() {
            0.0, 1.0, 1.3, 1.2, 2.1, 2.1, 2.3, 1.9, 1.8, 1.8
        };

        // Configure Parameters
        double deviationLimit = 15;
        TimeSpan minResample = TimeSpan.FromMinutes(1);
        TimeSpan maxResample = TimeSpan.FromMinutes(3);

        // Process Data
        var compression = new Algorithm();
        var result = await compression.ProcessDataAsync(testValues, deviationLimit, minResample, maxResample);

        // Output Results
        Console.WriteLine($"\nNumber of Original Points: {result.OriginalCount}");
        foreach (var (val, i) in testValues.Select((v, i) => (v, i))) {
            Console.WriteLine($" {i} : {val}");
        }

        Console.WriteLine($"Number of Compressed Points: {result.OriginalCount}");
        foreach (var (val, i) in result.CompressedValues.Select((v, i) => (v.NumericValue, i))) {
            Console.WriteLine($" {i} : {val}");
        }

        // Metrics (Test 2.1.8)
        Console.WriteLine("\nMetrics:");
        Console.WriteLine($"Compression Ratio: {result.CompressionRatio:P2}");
        Console.WriteLine($"Storage Savings: {1 - result.CompressedCount:P2}");
        Console.WriteLine($"Processing Time: {result.ProcessingTimeMs} ms");
        Console.WriteLine($"Data Fidelity Score: {CalculateFidelity(testValues, result.CompressedValues):P2}");
    }

    // Placeholder for fidelity calculation
    private static double CalculateFidelity(
        List<double> originalValues, List<DataCoreTagValue> compressedValues) {
        return 0.95; // Example value
    }
}