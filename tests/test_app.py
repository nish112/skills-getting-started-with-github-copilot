from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_unregister_participant_removes_from_activity():
    response = client.delete(
        "/activities/Chess%20Club/participants/michael%40mergington.edu"
    )

    assert response.status_code == 200
    assert "Removed" in response.json()["message"]

    activities = client.get("/activities").json()
    assert "michael@mergington.edu" not in activities["Chess Club"]["participants"]


def test_unregister_nonexistent_participant_returns_404():
    response = client.delete(
        "/activities/Chess%20Club/participants/not-a-real-student%40mergington.edu"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found"


def test_activities_include_staff_details():
    response = client.get("/activities")

    assert response.status_code == 200
    assert all(activity["staff"] for activity in response.json().values())


def test_static_site_uses_dark_red_theme_and_renders_staff():
    styles = client.get("/static/styles.css")
    app_script = client.get("/static/app.js")

    assert styles.status_code == 200
    assert "#7f1d1d" in styles.text
    assert "#1a237e" not in styles.text
    assert app_script.status_code == 200
    assert 'class="staff-detail"' in app_script.text
