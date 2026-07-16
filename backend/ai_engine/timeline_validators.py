from schemas import TimelineRequest, TimelineResponse

def validate_timeline_response(request: TimelineRequest, response: TimelineResponse) -> TimelineResponse:
    # Basic validation: ensure all candidates have a matching task
    candidate_ids = {c.id for c in request.candidates}
    
    # Optional: ensure we don't have hallucinated tasks
    valid_tasks = []
    for t in response.tasks:
        if t.id in candidate_ids:
            valid_tasks.append(t)
            
    response.tasks = valid_tasks
    return response
