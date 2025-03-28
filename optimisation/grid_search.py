from sklearn.model_selection import ParameterGrid

"""
parameters:
- compression filter deviation type: absolute or percentage
- compression filter deviation limit: integer
- exception filter deviation type: absolute or percentage
- exception filter deviation limit: integer
- minimum resample limit: hours, minutes, seconds
- maximum resample limit: hours, minutes, seconds
"""

"""
measures:
- smallest file size
- smallest compression ratio (minimum number of points lost)

objective: decrease file size, decrease compression ratio
return 6 best parameters
"""


# mock implementation of compression algorithm
def run_compression(test_params):
    o_cf_dl = 5
    o_cf_dt = 'percentage'
    o_ef_dl = 2
    o_ef_dt = 'absolute'
    o_max = 0, 2, 45
    o_min = 0, 0, 5

    # acting as file size
    error = 0

    # compression filter deviation type
    if test_params["cf_deviation_type"] != o_cf_dt:
        error += 1

    # compression filter deviation limit
    error += (abs(test_params["cf_deviation_limit"] - o_cf_dl))

    # exception filter deviation type
    if test_params["ef_deviation_type"] != o_ef_dt:
        error += 1

    # exception filter deviation limit
    error += (abs(test_params["ef_deviation_limit"] - o_ef_dl))

    # maximum and minimum resample limits
    error += (abs(test_params["min_resample_limit"][0] - o_min[0]) + abs(
        test_params["min_resample_limit"][1] - o_min[1]) + abs(test_params["min_resample_limit"][2] - o_min[2]))
    error += (abs(test_params["max_resample_limit"][0] - o_max[0]) + abs(
        test_params["max_resample_limit"][1] - o_max[1]) + abs(test_params["max_resample_limit"][2] - o_max[2]))

    cr = 0.95

    return error, cr


# run parameter optimisation on compression algorithm with grid search
def run_optimisation():
    # pass in parameter values to parameter grid
    param_grid = {
        'cf_deviation_type': ['absolute', 'percentage'],
        'cf_deviation_limit': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'ef_deviation_type': ['absolute', 'percentage'],
        'ef_deviation_limit': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'min_resample_limit': [(0, 0, 0), (0, 0, 5), (0, 0, 10), (0, 0, 30), (0, 0, 60), (0, 1, 0), (0, 2, 30),
                               (0, 5, 0)],
        'max_resample_limit': [(0, 0, 0), (0, 0, 5), (0, 0, 10), (0, 0, 30), (0, 0, 60), (0, 1, 0), (0, 2, 30),
                               (0, 5, 0)]
    }

    # generate parameter combinations
    param_combinations = list(ParameterGrid(param_grid))

    # store results
    results = []

    # test each parameter combination
    for params in param_combinations:
        file_size, compression_ratio = run_compression(params)
        data_kept = (1 - compression_ratio) * 100  # Convert to percentage
        file_size_reduction = round(100 - ((file_size / 5000) * 100), 2)  # File size reduction percentage
        results.append((params, file_size, file_size_reduction, round(data_kept, 2)))

    # sort results by smallest file size and highest data retention
    results.sort(key=lambda x: (x[1], -x[3]))

    # get the best 5 parameter sets
    best_results = results[:5]

    # print the best parameters and results
    print("Top 5 Parameter Combinations:")
    for i, (params, file_size, file_size_reduction, data_kept) in enumerate(best_results, 1):
        print(
            f"{i}. Parameters: {params}, File Size: {file_size} bytes, File Size Reduction: {file_size_reduction}%, Data Kept: {data_kept}%")

    return best_results


# take the best parameters and send to compression algorithm/UI to use as optimal
def get_optimal_result(results):
    best_result = results[:1]
    return best_result[0][0]


top_results = run_optimisation()
print(get_optimal_result(top_results))
