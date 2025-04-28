from sklearn.model_selection import ParameterGrid
import os
import requests
import csv
from io import StringIO
from azure.storage.blob import BlobServiceClient

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

COMPRESSION_API_URL = os.environ.get("COMPRESSION_API_URL")
COMPRESSION_API_KEY = os.environ.get("COMPRESSION_API_KEY")
BLOB_STORAGE_CONNECTION_STRING = os.environ.get("BLOB_STORAGE_CONNECTION_STRING")


def run_compression(test_params, data):
    """
    Call the compression API with given parameters and data.
    Returns file_size (number of compressed points), compression_ratio, and data_kept.
    """
    try:
        request_data = {
            "rawData": data,
            "parameters": {
                "deviationLimit": test_params["cf_deviation_limit"],
                "deviationType": test_params["cf_deviation_type"],
                "exceptionDeviationLimit": test_params["ef_deviation_limit"],
                "exceptionDeviationType": test_params["ef_deviation_type"],
                "minResampleLimit": test_params["min_resample_limit"],
                "maxResampleLimit": test_params["max_resample_limit"],
            },
        }

        response = requests.post(
            f"{COMPRESSION_API_URL}?code={COMPRESSION_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=request_data,
        )

        if response.status_code != 200:
            print(f"Compression API error: {response.text}")
            return float("inf"), 1.0, 0.0

        result = response.json()
        if not isinstance(result, list):
            print(f"Unexpected response format: {result}")
            return float("inf"), 1.0, 0.0

        raw_points = len(data)
        compressed_points = len(result)
        compression_ratio = compressed_points / raw_points if raw_points > 0 else 1.0
        data_kept = (1 - compression_ratio) * 100
        file_size = compressed_points

        return file_size, compression_ratio, data_kept

    except Exception as e:
        print(f"Error calling compression API: {e}")
        return float("inf"), 1.0, 0.0


# run parameter optimisation on compression algorithm with grid search
def run_optimisation(data=None, storage_url=None):
    """
    Run grid search optimisation over compression parameters.
    Data: List of {timestamp, value} or storage_url to fetch data from Blob Storage.
    """
    if storage_url and not data:
        try:
            blob_service_client = BlobServiceClient.from_connection_string(
                BLOB_STORAGE_CONNECTION_STRING
            )
            blob_name = storage_url.split("/")[-1]
            blob_client = blob_service_client.get_blob_client(
                container="ip-input-container", blob=blob_name
            )
            blob_data = blob_client.download_blob().readall()
            csv_data = StringIO(blob_data.decode("utf-8"))
            reader = csv.reader(csv_data)
            next(reader)  # Skip header
            data = [{"timestamp": row[0], "value": float(row[1])} for row in reader]
        except Exception as e:
            print(f"Error downloading blob: {e}")
            return []

    if not data:
        print("No data provided")
        return []

    # pass in parameter values to parameter grid
    param_grid = {
        "cf_deviation_type": ["absolute", "percentage"],
        "cf_deviation_limit": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "ef_deviation_type": ["absolute", "percentage"],
        "ef_deviation_limit": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "min_resample_limit": [
            (0, 0, 0),
            (0, 0, 5),
            (0, 0, 10),
            (0, 0, 30),
            (0, 0, 60),
            (0, 1, 0),
            (0, 2, 30),
            (0, 5, 0),
        ],
        "max_resample_limit": [
            (0, 0, 0),
            (0, 0, 5),
            (0, 0, 10),
            (0, 0, 30),
            (0, 0, 60),
            (0, 1, 0),
            (0, 2, 30),
            (0, 5, 0),
        ],
    }

    # generate parameter combinations
    param_combinations = list(ParameterGrid(param_grid))

    # store results
    results = []

    # test each parameter combination
    for params in param_combinations:
        file_size, compression_ratio = run_compression(params, data)
        data_kept = (1 - compression_ratio) * 100  # Convert to percentage
        file_size_reduction = round(
            100 - ((file_size / 5000) * 100), 2
        )  # File size reduction percentage
        results.append((params, file_size, file_size_reduction, round(data_kept, 2)))

    # sort results by smallest file size and highest data retention
    results.sort(key=lambda x: (x[1], -x[3]))

    return results


def get_top_5_results(results):
    # get the best 5 parameter sets
    best_results = results[:5]

    # print the best parameters and results
    print("Top 5 Parameter Combinations:")
    for i, (params, file_size, file_size_reduction, data_kept) in enumerate(
        best_results, 1
    ):
        print(
            f"{i}. Parameters: {params}, File Size: {file_size} bytes, File Size Reduction: {file_size_reduction}%, "
            f"Data Kept: {data_kept}%"
        )

    return best_results


# take the best parameters and send to compression algorithm/UI to use as optimal
def get_optimal_result(results):
    best_result = results[:1]
    return best_result[0][0]
