import json
import azure.functions as func

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


@app.route(route="resume-counter")
def resume_counter(req: func.HttpRequest) -> func.HttpResponse:
    # Placeholder response until storage integration is added.
    body = {"count": 0}
    return func.HttpResponse(
        json.dumps(body),
        mimetype="application/json",
        status_code=200,
    )
