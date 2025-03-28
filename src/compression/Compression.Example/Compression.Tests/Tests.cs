using Xunit;
using System.Diagnostics;

namespace Compression.Tests;

public class Tests {
    [Fact]
    public async Task FunctionalityTest() {
        // Arrange
        var testValues = new List<double> { 0.0, 1.0, 1.3, 1.2, 2.1, 2.1, 2.3, 1.9, 1.8, 1.8 };
        double deviationLimit = 15;
        TimeSpan minResample = TimeSpan.FromMinutes(1);
        TimeSpan maxResample = TimeSpan.FromMinutes(3);

        var compression = new Algorithm();

        // Act
        var compressedValues = await compression.ProcessDataAsync(testValues, deviationLimit, minResample, maxResample);

        // Assert
        Assert.True(compressedValues.Count < testValues.Count);
    }

    [Fact]
    public async Task PerformanceTest() {
        // Arrange
        var sw = Stopwatch.StartNew();
        var largeDataset = GenerateLargeDataset(1_000_000);
        var pipeline = new MockPipeline();
        
        // Act
        foreach (var value in largeDataset) { await pipeline.WriteAsync(value); }
        sw.Stop();
        
        // Assert
        Assert.True(sw.Elapsed.TotalSeconds <= 5);
    }

    [Fact]
    public async Task EdgeCasesTest() {
        // Arrange
        var testValues = new List<double> { 5.0 };
        double deviationLimit = 15;
        TimeSpan minResample = TimeSpan.FromMinutes(1);
        TimeSpan maxResample = TimeSpan.FromMinutes(3);
        
        var compression = new Algorithm();

        // Act
        var compressedValues = await compression.ProcessDataAsync(testValues, deviationLimit, minResample, maxResample);
        
        // Assert
        Assert.Single(compressedValues);
    }
    
    private List<double> GenerateLargeDataset(int size) {
        var random = new Random();
        var dataset = new List<double>(size);
        for (int i = 0; i < size; i++) {
            dataset.Add(random.NextDouble() * 100);
        }
        
        return dataset;
    }

}
     
// mock pipeline
public class MockPipeline {
    public Task WriteAsync(double value) => Task.CompletedTask;
}