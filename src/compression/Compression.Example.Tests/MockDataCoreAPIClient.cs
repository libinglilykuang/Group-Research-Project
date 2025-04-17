namespace Compression.Example.Tests;

public class MockDataCoreAPIClient {
    public Task<APIResponse> PostCompressedDataAsync(IEnumerable<double> compressedValues) {
        // Simulate a successful API response
        return Task.FromResult(new APIResponse { IsSuccess = true });
    }
}

public class APIResponse {
    public bool IsSuccess { get; set; }
}