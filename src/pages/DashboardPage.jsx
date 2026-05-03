import React, { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { getStoredUser } from "../utils/auth.js";

const HIRE_REQUEST_API_URL = "http://localhost:5000/api/hire-requests";
const statuses = ["pending", "accepted", "rejected", "completed"];

function formatDeadline(deadline) {
  if (!deadline) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(deadline));
}

function getStatusTone(status) {
  if (status === "accepted") return "green";
  if (status === "rejected") return "white";
  if (status === "completed") return "blue";
  return "lavender";
}

export default function DashboardPage({ navigate }) {
  const [user, setUser] = useState(null);
  const [hireRequests, setHireRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isClientDashboard = user?.role === "client";

  const groupedRequests = useMemo(
    () =>
      statuses.reduce((groups, status) => {
        groups[status] = hireRequests.filter((request) => request.status === status);
        return groups;
      }, {}),
    [hireRequests]
  );

  const loadHireRequests = useCallback(async (currentUser) => {
    if (!currentUser?.id) {
      setIsLoading(false);
      setError("Log in to view hire requests.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const endpoint = currentUser.role === "client" ? "client" : "creator";
      const response = await fetch(`${HIRE_REQUEST_API_URL}/${endpoint}/${currentUser.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load hire requests.");
      }

      setHireRequests(data);
    } catch (requestError) {
      setError(requestError.message || "Unable to load hire requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    loadHireRequests(storedUser);
  }, [loadHireRequests]);

  async function updateRequestStatus(requestId, status) {
    const token = localStorage.getItem("reelioToken");

    if (!token) {
      setError("Please log in again to update hire requests.");
      return;
    }

    try {
      setUpdatingRequestId(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(`${HIRE_REQUEST_API_URL}/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update hire request.");
      }

      setSuccess(`Request marked ${status}.`);
      await loadHireRequests(user);
    } catch (requestError) {
      setError(requestError.message || "Unable to update hire request.");
    } finally {
      setUpdatingRequestId("");
    }
  }

  function openMessageForRequest(request) {
    const otherUserId = user?.role === "client" ? request.creatorId : request.clientId;

    localStorage.setItem(
      "reelioActiveConversation",
      JSON.stringify({
        otherUserId,
        latestMessage: request.projectTitle,
        latestMessageAt: new Date().toISOString(),
        read: true,
        unreadCount: 0,
      })
    );
    navigate("messages");
  }

  return (
    <div className="space-y-8 pb-12">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge tone="green">{isClientDashboard ? "Client dashboard" : "Creator dashboard"}</Badge>
          <h1 className="mt-3 text-4xl font-extrabold">{isClientDashboard ? "Sent hire requests" : "Incoming hire requests"}</h1>
          <p className="mt-2 text-reelio-muted">
            {isClientDashboard
              ? "Track every request you have sent, its status, and creator conversations."
              : "Review client briefs, respond quickly, and keep project status organized."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("discover")}>
            Explore
          </Button>
          <Button onClick={() => navigate("myProfile")}>Profile</Button>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statuses.map((status) => (
          <Card key={status}>
            <Badge tone={getStatusTone(status)}>{status}</Badge>
            <p className="mt-4 text-4xl font-extrabold">{groupedRequests[status]?.length || 0}</p>
            <p className="mt-1 text-sm font-semibold capitalize text-reelio-muted">{status} requests</p>
          </Card>
        ))}
      </section>

      {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">{success}</p>}
      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}

      {isLoading ? (
        <Card className="text-center">
          <p className="font-semibold text-reelio-muted">Loading real hire requests...</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {statuses.map((status) => (
            <RequestSection
              key={status}
              isClientDashboard={isClientDashboard}
              onMessage={openMessageForRequest}
              onStatusChange={updateRequestStatus}
              requests={groupedRequests[status] || []}
              status={status}
              updatingRequestId={updatingRequestId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestSection({ isClientDashboard, onMessage, onStatusChange, requests, status, updatingRequestId }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold capitalize">{status}</h2>
        <Badge tone={getStatusTone(status)}>{requests.length}</Badge>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center">
          <p className="font-semibold text-reelio-muted">No {status} requests.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              isClientDashboard={isClientDashboard}
              onMessage={onMessage}
              onStatusChange={onStatusChange}
              request={request}
              updatingRequestId={updatingRequestId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RequestCard({ isClientDashboard, onMessage, onStatusChange, request, updatingRequestId }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold">{request.projectTitle}</h3>
          <p className="mt-1 text-sm text-reelio-muted">
            {request.budget} | {formatDeadline(request.deadline)}
          </p>
        </div>
        <Badge tone={getStatusTone(request.status)}>{request.status}</Badge>
      </div>

      <p className="mt-4 text-sm leading-6 text-reelio-muted">{request.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {!isClientDashboard && request.status === "pending" && (
          <>
            <Button
              size="sm"
              onClick={() => onStatusChange(request._id, "accepted")}
              disabled={updatingRequestId === request._id}
            >
              {updatingRequestId === request._id ? "Updating..." : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(request._id, "rejected")}
              disabled={updatingRequestId === request._id}
            >
              Reject
            </Button>
          </>
        )}
        {!isClientDashboard && request.status === "accepted" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStatusChange(request._id, "completed")}
            disabled={updatingRequestId === request._id}
          >
            Complete
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onMessage(request)}>
          Message
        </Button>
        {request.referenceFile?.url && (
          <a
            className="inline-flex items-center rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-reelio-purple transition hover:bg-white"
            href={request.referenceFile.url}
            rel="noreferrer"
            target="_blank"
          >
            View File
          </a>
        )}
      </div>
    </Card>
  );
}
