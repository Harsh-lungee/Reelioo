import React, { useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";

const HIRE_REQUEST_API_URL = "http://https://reelioo.onrender.com/api/hire-requests";

function getLoggedInUser() {
  const storedUser = localStorage.getItem("reelioUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    return null;
  }
}

export default function HireRequestPage({ creator, navigate }) {
  const [formData, setFormData] = useState({
    projectTitle: "",
    budget: "",
    deadline: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [referenceFile, setReferenceFile] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setSuccess("");
    setError("");

    const user = getLoggedInUser();
    const token = localStorage.getItem("reelioToken");

    if (!user) {
      setIsLoading(false);
      setError("Please log in before sending a hire request.");
      return;
    }

    if (!creator?.id) {
      setIsLoading(false);
      setError("Please select a creator before sending a hire request.");
      return;
    }

    try {
      const requestBody = new FormData();
      requestBody.append("clientId", user.id);
      requestBody.append("creatorId", String(creator.id));
      requestBody.append("projectTitle", formData.projectTitle);
      requestBody.append("budget", formData.budget);
      requestBody.append("deadline", formData.deadline);
      requestBody.append("description", formData.description);

      if (referenceFile) {
        requestBody.append("referenceFile", referenceFile);
      }

      const response = await fetch(HIRE_REQUEST_API_URL, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: requestBody,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send hire request.");
      }

      setSuccess("Hire request sent successfully.");
      setFormData({
        projectTitle: "",
        budget: "",
        deadline: "",
        description: "",
      });
      setReferenceFile(null);

      setTimeout(() => {
        navigate(user.role === "creator" ? "dashboard" : "messages");
      }, 700);
    } catch (requestError) {
      setError(requestError.message || "Unable to send hire request.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl py-8">
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-bold text-reelio-purple">Hire request</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          Send a project brief{creator ? ` to ${creator.name}` : ""}
        </h1>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <Input
            label="Project title"
            placeholder="YouTube launch video edit"
            value={formData.projectTitle}
            onChange={(event) => updateField("projectTitle", event.target.value)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Budget"
              placeholder="$450"
              value={formData.budget}
              onChange={(event) => updateField("budget", event.target.value)}
            />
            <Input
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(event) => updateField("deadline", event.target.value)}
            />
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-reelio-ink">Description</span>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none focus:ring-4 focus:ring-reelio-lilac/25"
              placeholder="Share goals, format, examples, audience, deliverables, and style notes."
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>
          <label className="block rounded-2xl border border-dashed border-reelio-lilac bg-white/60 px-4 py-5 text-center font-bold text-reelio-purple transition hover:bg-white">
            <span>{referenceFile ? referenceFile.name : "Upload reference file"}</span>
            <input
              className="sr-only"
              type="file"
              onChange={(event) => setReferenceFile(event.target.files?.[0] || null)}
            />
          </label>
          {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">{success}</p>}
          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={() => navigate("discover")}>
              Back to Explore
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
