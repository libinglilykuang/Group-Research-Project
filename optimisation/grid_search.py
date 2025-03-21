from sklearn.model_selection import GridSearchCV
from sklearn.metrics import make_scorer

"""
parameters:
- deviation type: absolute or percentage
- deviation limit: integer
- minimum resample limit: hours, minutes, seconds
- maximum resample limit: hours, minutes, seconds
"""

"""
measures:
- smallest file size
- smallest compression ratio (minimum number of points lost)

objective: decrease file size, decrease compression ratio
return 4 best parameters
"""


def get_file_size():
    pass


def get_compression_ratio():
    pass


param_grid = {'kernel': ('linear', 'rbf'), 'C': [1, 10]}

scoring = {'file_size': make_scorer(get_file_size, greater_is_better=False),
           'compression_ratio': make_scorer(get_compression_ratio, greater_is_better=False)}

grid_search = GridSearchCV(param_grid, scoring)

print(grid_search.best_params_)
