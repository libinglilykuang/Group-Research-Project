import azure.functions as func
import json
from .grid_search import run_optimisation, get_optimal_result


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        data = req_body.get("data")
        storage_url = req_body.get("storage_url")

        if not data and not storage_url:
            return func.HttpResponse("Missing data or storage_url", status_code=400)

        results = run_optimisation(data, storage_url)
        if not results:
            return func.HttpResponse("Optimisation failed: No results", status_code=500)

        optimal_params = get_optimal_result(results)
        return func.HttpResponse(
            json.dumps(optimal_params), mimetype="application/json", status_code=200
        )
    except Exception as e:
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
