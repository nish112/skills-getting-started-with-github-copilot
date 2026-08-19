document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const profileIconButton = document.getElementById("profile-icon-button");
  const profileCard = document.getElementById("profile-card");

  // Function to fetch the staff profile shown in the header menu
  async function fetchEmployeeProfile() {
    try {
      const response = await fetch("/employee/profile");
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const profile = await response.json();

      document.getElementById("profile-name").textContent =
        `${profile.first_name} ${profile.last_name}`;
      document.getElementById("profile-email").textContent = profile.email;
      document.getElementById("profile-category").textContent = profile.category;
    } catch (error) {
      document.getElementById("profile-name").textContent = "Unable to load profile";
      document.getElementById("profile-email").textContent = "";
      document.getElementById("profile-category").textContent = "";
      console.error("Error fetching employee profile:", error);
    }
  }

  // Toggle the profile card on click (in addition to the CSS hover/focus
  // behavior) so it also works well on touch devices.
  profileIconButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isVisible = profileCard.classList.toggle("visible");
    profileIconButton.setAttribute("aria-expanded", isVisible);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#profile-menu")) {
      profileCard.classList.remove("visible");
      profileIconButton.setAttribute("aria-expanded", "false");
    }
  });

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participants = details.participants || [];
        const participantItems = participants
          .map(
            (participant) => `
              <li class="participant-item">
                <span>${participant}</span>
                <button class="participant-delete" data-activity="${name}" data-participant="${participant}" type="button" aria-label="Remove ${participant}">
                  ×
                </button>
              </li>
            `
          )
          .join("");

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants</h5>
            <ul class="participants-list">
              ${participantItems.length ? participantItems : '<li class="participant-empty">No participants yet</li>'}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  async function unregisterParticipant(activityName, participantEmail) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(participantEmail)}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to remove participant.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
    }
  }

  activitiesList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".participant-delete");
    if (!deleteButton) return;

    event.preventDefault();
    unregisterParticipant(deleteButton.dataset.activity, deleteButton.dataset.participant);
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  fetchEmployeeProfile();
});
