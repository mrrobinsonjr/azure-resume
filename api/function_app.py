import json
import azure.functions as func

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

LOCAL_ORIGIN = "http://localhost:8080"

def _cors_headers() -> dict:
    return {
        "Access-Control-Allow-Origin": LOCAL_ORIGIN,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
    }

@app.route(route="counter", methods=["GET", "OPTIONS"])
def counter_get(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=_cors_headers())

    return func.HttpResponse(
        json.dumps({"count": 0}),
        mimetype="application/json",
        status_code=200,
        headers=_cors_headers(),
    )

@app.route(route="counter/increment", methods=["POST", "OPTIONS"])
def counter_increment(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=_cors_headers())

    return func.HttpResponse(
        json.dumps({"count": 1}),
        mimetype="application/json",
        status_code=200,
        headers=_cors_headers(),
    )