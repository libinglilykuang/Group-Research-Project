using Xunit;
using FluentAssertions;

namespace Compression.Example.Tests;

public class Tests {
    private readonly Algorithm _algorithm = new();

    // Test 2.1.1: Functionality
    [Fact]
    public async Task ProcessDataAsync_ValidInput_CompressedData() {
        var input = new List<double> { 0.0, 1.0, 1.3, 1.2, 2.1 };
        var result = await _algorithm.ProcessDataAsync(input, 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        result.CompressedCount.Should().BeLessThan(input.Count);
    }

    // Test 2.1.2: Accuracy
    [Fact]
    public async Task ProcessDataAsync_PreservesCriticalPoints() {
        var input = new List<double> { 0.0, 10.0, 0.0 };
        var result = await _algorithm.ProcessDataAsync(input, 10, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        result.CompressedValues.Should().Contain(v => v.NumericValue == 10.0);
    }

    // Test 2.1.3: Error Handling
    [Fact]
    public async Task ProcessDataAsync_InvalidInput_ThrowsException() {
        await Assert.ThrowsAsync<ArgumentException>(() => _algorithm.ProcessDataAsync(new List<double>(), 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3)));
    }

    // Test 2.1.4: Configurability
    [Fact]
    public async Task ProcessDataAsync_RespectsDeviationLimit() {
        var input = Enumerable.Repeat(1.0, 100).ToList();
        var resultLowDeviation = await _algorithm.ProcessDataAsync(
            input, 0, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        var resultHighDeviation = await _algorithm.ProcessDataAsync(
            input, 100, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));

        resultLowDeviation.CompressedCount.Should().BeLessThanOrEqualTo(resultHighDeviation.CompressedCount);
    }

    // Test 2.1.5: Scalability
    [Fact]
    public async Task ProcessDataAsync_LargeDataset_HandlesWithoutCrash() {
        var input = Enumerable.Repeat(1.0, 1_000_000).ToList();
        var result = await _algorithm.ProcessDataAsync(input, 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        result.Should().NotBeNull();
        result.CompressedCount.Should().BeGreaterThan(0);
    }

    // Test 2.1.6: Performance
    [Fact]
    public async Task ProcessDataAsync_OneMillionPoints_UnderFiveSeconds() {
        var input = Enumerable.Range(0, 1_000_000).Select(i => (double)i).ToList();
        var result = await _algorithm.ProcessDataAsync(input, 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        result.ProcessingTimeMs.Should().BeLessThan(5000);
    }

    // Test 2.1.7: Integration
    [Fact]
    public async Task CompressedData_WorksWithDataCoreAPI() {
        var input = new List<double> { 0.0, 1.0, 1.3, 1.2, 2.1 };
        var result = await _algorithm.ProcessDataAsync(input, 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        
        // Mock API call
        var APIClient = new MockDataCoreAPIClient();
        var response = await APIClient.PostCompressedDataAsync(result.CompressedValues.Select(v => v.NumericValue));
        response.IsSuccess.Should().BeTrue();
    }

    // Test 2.1.8: Output Metrics
    [Fact]
    public async Task ProcessDataAsync_OutputMetrics_AreValid() {
        var input = Enumerable.Repeat(1.0, 1000).ToList();
        var result = await _algorithm.ProcessDataAsync(input, 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));

        // Validate CompressionRatio
        var expectedRatio = (double)result.CompressedCount / result.OriginalCount;
        result.CompressionRatio.Should().BeApproximately(expectedRatio, 0.001);

        // Validate derived StorageSavings (1 - CompressionRatio)
        var expectedSavings = 1 - expectedRatio;
        (1 - result.CompressionRatio).Should().BeApproximately(expectedSavings, 0.001);

        // Validate ProcessingTimeMs
        result.ProcessingTimeMs.Should().BeGreaterThanOrEqualTo(0);

        // Validate CompressedValues integrity
        result.CompressedValues.Should().NotBeNull().And.HaveCount(result.CompressedCount);
    }

    // Test 2.1.9: Edge Cases
    [Fact]
    public async Task ProcessDataAsync_SinglePoint_ReturnsOne() {
        var input = new List<double> { 5.0 };
        var result = await _algorithm.ProcessDataAsync(input, 15, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(3));
        result.CompressedCount.Should().Be(1);
    }
}