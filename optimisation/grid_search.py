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

global o_cf_dl
global o_cf_dt
global o_ef_dl
global o_ef_dt
global o_max
global o_min


def set_optimal_params(optimal_params):
    global o_cf_dl
    o_cf_dl = optimal_params["cf_deviation_limit"]
    global o_cf_dt
    o_cf_dt = optimal_params["cf_deviation_type"]
    global o_ef_dl
    o_ef_dl = optimal_params["ef_deviation_limit"]
    global o_ef_dt
    o_ef_dt = optimal_params["ef_deviation_type"]
    global o_max
    o_max = optimal_params["max_resample_limit"]
    global o_min
    o_min = optimal_params["min_resample_limit"]


def get_optimal_params():
    optimal_params = {
        "cf_deviation_limit": o_cf_dl,
        "cf_deviation_type": o_cf_dt,
        "ef_deviation_limit": o_ef_dl,
        "ef_deviation_type": o_ef_dt,
        "max_resample_limit": o_max,
        "min_resample_limit": o_min
    }

    return optimal_params


# mock implementation of compression algorithm
def run_mock_compression(test_params):
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
        file_size, compression_ratio = run_mock_compression(params)
        data_kept = (1 - compression_ratio) * 100  # Convert to percentage
        file_size_reduction = round(100 - ((file_size / 5000) * 100), 2)  # File size reduction percentage
        results.append((params, file_size, file_size_reduction, round(data_kept, 2)))

    # sort results by smallest file size and highest data retention
    results.sort(key=lambda x: (x[1], -x[3]))

    return results


def get_top_5_results(results):
    # get the best 5 parameter sets
    best_results = results[:5]

    # print the best parameters and results
    print("Top 5 Parameter Combinations:")
    for i, (params, file_size, file_size_reduction, data_kept) in enumerate(best_results, 1):
        print(
            f"{i}. Parameters: {params}, File Size: {file_size} bytes, File Size Reduction: {file_size_reduction}%, "
            f"Data Kept: {data_kept}%")

    return best_results


# take the best parameters and send to compression algorithm/UI to use as optimal
def get_optimal_result(results):
    best_result = results[:1]
    return best_result[0][0]


# configurable when running mock compression - TO BE REMOVED WHEN INTEGRATED
mock_optimal_params = {
    'cf_deviation_limit': 9,
    'cf_deviation_type': 'absolute',
    'ef_deviation_limit': 2,
    'ef_deviation_type': 'percentage',
    'max_resample_limit': (0, 2, 30),
    'min_resample_limit': (0, 2, 0)
}

set_optimal_params(mock_optimal_params)

top_results = run_optimisation()
get_top_5_results(top_results)
print(get_optimal_result(top_results))
