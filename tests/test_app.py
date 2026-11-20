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


def test_homepage_includes_staff_profile_menu_and_dark_red_theme():
    page = client.get("/static/index.html").text
    styles = client.get("/static/styles.css").text

    assert 'aria-label="View staff profile"' in page
    assert "Jordan" in page
    assert "Lee" in page
    assert "jordan.lee@mergington.edu" in page
    assert "Employee category" in page
    assert "#7b1e2b" in styles
    assert "#1a237e" not in styles
