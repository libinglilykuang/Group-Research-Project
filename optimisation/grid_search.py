from sklearn.model_selection import GridSearchCV
from sklearn.metrics import make_scorer

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


def run_compression(params):
    o_cf_dt = 'percentage'
    o_cf_dl = 2
    o_ef_dt = 'absolute'
    o_ef_dl = 2
    o_min = 0, 0, 5
    o_max = 0, 1, 1

    # acting as file size
    error = 0

    # compression filter deviation type
    if params[0] != o_cf_dt:
        error += 1

    # compression filter deviation limit
    error += (abs(params[1] - o_cf_dl))

    # exception filter deviation type
    if params[2] != o_ef_dt:
        error += 1

    # exception filter deviation limit
    error += (abs(params[4] - o_ef_dl))

    # maximum and minimum resample limits
    error += (abs(params[5][0] - o_min[0]) + abs(params[5][1] - o_min[1]) + abs(params[5][2] - o_min[2]))
    error += (abs(params[6][0] - o_max[0]) + abs(params[6][1] - o_max[1]) + abs(params[6][2] - o_max[2]))

    cr = 90

    return error, cr


# pass in parameter values to parameter grid
param_grid = {
    'cf_deviation_type': ['absolute', 'percentage'],
    'cf_deviation_limit': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'ef_deviation_type': ['absolute', 'percentage'],
    'ef_deviation_limit': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'min_resample_limit': [(0, 0, 0), (0, 0, 5), (0, 0, 10), (0, 0, 30), (0, 0, 60), (0, 1, 0), (0, 2, 30), (0, 5, 0)],
    'max_resample_limit': [(0, 0, 0), (0, 0, 5), (0, 0, 10), (0, 0, 30), (0, 0, 60), (0, 1, 0), (0, 2, 30), (0, 5, 0)]
}

# create scorers from file size and compression ratio
file_size, compression_ratio = run_compression(param_grid)

scoring = {'file_size': make_scorer(file_size, greater_is_better=False),
           'compression_ratio': make_scorer(compression_ratio, greater_is_better=False)}

# apply grid search
grid_search = GridSearchCV(param_grid, scoring)

# output the best found parameters
print(grid_search.best_params_)

"""
    TODO: take 4 best parameters and send to compression algorithm/UI to use as optimal
"""
