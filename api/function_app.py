import json
import azure.functions as func

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


@app.route(route="counter", methods=["GET"])
def counter_get(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({"count": 0}),
        mimetype="application/json",
        status_code=200,
    )


@app.route(route="counter/increment", methods=["POST"])
def counter_increment(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({"count": 1}),
        mimetype="application/json",
        status_code=200,
    )
