using Xunit;

namespace Compression.Tests;

public class Tests
{
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
}