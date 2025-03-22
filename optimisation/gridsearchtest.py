from sklearn.model_selection import ParameterGrid

# Default values for testing (these can be replaced when parameters are passed)
default_file_size = 5000  # Original file size for reference
default_compression_ratio = 0.8  # Default compression ratio for unknown cases

def dummy_evaluate(params, test_data=None):
    """
    Dummy function to simulate evaluation based on parameter combinations.
    Ensures proper tuple formatting for dictionary lookup.
    """
    if test_data is None:
        test_data = {
            ('absolute', 1, 'absolute', 1, '1H', '24H'): (1000, 0.2),
            ('absolute', 5, 'percentage', 5, '30M', '12H'): (1500, 0.3),
            ('percentage', 10, 'absolute', 10, '15M', '6H'): (900, 0.15),
            ('absolute', 10, 'percentage', 1, '1H', '6H'): (1100, 0.25),
            ('percentage', 5, 'percentage', 5, '30M', '24H'): (1300, 0.35),
            ('absolute', 1, 'absolute', 10, '15M', '12H'): (950, 0.18)
        }

    # Extract values in the correct order to match dictionary keys
    key_tuple = (
        params['cf_deviation_type'],
        params['cf_deviation_limit'],
        params['ef_deviation_type'],
        params['ef_deviation_limit'],
        params['min_resample_limit'],
        params['max_resample_limit']
    )

    # Return the corresponding file size and compression ratio if it exists
    return test_data.get(key_tuple, (default_file_size, default_compression_ratio))

# Define the parameter grid
param_grid = {
    'cf_deviation_type': ['absolute', 'percentage'],
    'cf_deviation_limit': [1, 5, 10],
    'ef_deviation_type': ['absolute', 'percentage'],
    'ef_deviation_limit': [1, 5, 10],
    'min_resample_limit': ['1H', '30M', '15M'],
    'max_resample_limit': ['24H', '12H', '6H']
}

# Generate parameter combinations
param_combinations = list(ParameterGrid(param_grid))

# Store results
results = []

# Test each parameter combination
for params in param_combinations:
    file_size, compression_ratio = dummy_evaluate(params)
    data_kept = (1 - compression_ratio) * 100  # Convert to percentage
    file_size_reduction = round(100 - ((file_size / default_file_size) * 100), 2)  # File size reduction percentage
    results.append((params, file_size, file_size_reduction, round(data_kept, 2)))

# Sort results by smallest file size and highest data retention
results.sort(key=lambda x: (x[1], -x[3]))

# Get the best 6 parameter sets
best_results = results[:6]

# Print the best parameters and results
print("Best 6 Parameter Combinations:")
for i, (params, file_size, file_size_reduction, data_kept) in enumerate(best_results, 1):
    print(f"{i}. Parameters: {params}, File Size: {file_size} bytes, File Size Reduction: {file_size_reduction}%, Data Kept: {data_kept}%")
