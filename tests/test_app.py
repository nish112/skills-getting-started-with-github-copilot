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


def test_get_employee_profile_returns_expected_fields():
    response = client.get("/employee/profile")

    assert response.status_code == 200

    profile = response.json()
    assert set(profile.keys()) == {"first_name", "last_name", "email", "category"}
    assert profile["first_name"]
    assert profile["last_name"]
    assert "@" in profile["email"]
    assert profile["category"]
