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


# get the resulting file size of a compression configuration
def get_file_size():
    pass


# get the resulting compression ratio of a compression configuration
def get_compression_ratio():
    pass


# pass in parameter values to parameter grid
param_grid = {
    'cf_deviation_type': [],
    'cf_deviation_limit': [],
    'ef_deviation_type': [],
    'ef_deviation_limit': [],
    'min_resample_limit': [],
    'max_resample_limit': []
}

# create scorers from file size and compression ratio
scoring = {'file_size': make_scorer(get_file_size, greater_is_better=False),
           'compression_ratio': make_scorer(get_compression_ratio, greater_is_better=False)}

# apply grid search
grid_search = GridSearchCV(param_grid, scoring)

# output the best found parameters
print(grid_search.best_params_)

"""
    take 4 best parameters and send to compression algorithm/UI to use as optimal
"""
