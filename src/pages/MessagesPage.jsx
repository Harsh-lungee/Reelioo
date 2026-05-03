import React, { useEffect, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { getStoredUser } from "../utils/auth.js";

const MESSAGE_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/messages";
const USER_SEARCH_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/users/search";

function formatTime(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getContactName(conversation) {
  return conversation?.otherUser?.name || `User ${conversation?.otherUserId?.slice(-5) || ""}`;
}

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function loadInbox(userId) {
    if (!userId) {
      setIsLoadingInbox(false);
      setError("Log in to view your inbox.");
      return [];
    }

    try {
      setIsLoadingInbox(true);
      setError("");

      const token = localStorage.getItem("reelioToken");
      const response = await fetch(`${MESSAGE_API_URL}/inbox/${userId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load inbox.");
      }

      setInbox(data);
      return data;
    } catch (requestError) {
      setError(requestError.message || "Unable to load inbox.");
      return [];
    } finally {
      setIsLoadingInbox(false);
    }
  }

  async function loadConversation(conversation, currentUser = user) {
    if (!currentUser?.id || !conversation?.otherUserId) {
      return;
    }

    try {
      setSelectedConversation(conversation);
      setIsLoadingConversation(true);
      setError("");

      const token = localStorage.getItem("reelioToken");
      const response = await fetch(`${MESSAGE_API_URL}/conversation/${currentUser.id}/${conversation.otherUserId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load conversation.");
      }

      setMessages(data);
      await loadInbox(currentUser.id);
    } catch (requestError) {
      setError(requestError.message || "Unable to load conversation.");
    } finally {
      setIsLoadingConversation(false);
    }
  }

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    async function initializeMessages() {
      const inboxData = await loadInbox(storedUser?.id);
      const activeConversation = localStorage.getItem("reelioActiveConversation");

      if (activeConversation && storedUser?.id) {
        try {
          const parsedConversation = JSON.parse(activeConversation);
          const conversation =
            inboxData.find((item) => item.otherUserId === parsedConversation.otherUserId) || parsedConversation;

          await loadConversation(conversation, storedUser);
          localStorage.removeItem("reelioActiveConversation");
        } catch (error) {
          localStorage.removeItem("reelioActiveConversation");
        }
      }
    }

    initializeMessages();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearchingUsers(true);
        setError("");
        const response = await fetch(`${USER_SEARCH_API_URL}?q=${encodeURIComponent(searchText.trim())}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to search users.");
        }

        setSearchResults(data.filter((item) => String(item.id) !== String(user?.id)));
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to search users.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingUsers(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchText, user?.id]);

  async function handleSend(event) {
    event.preventDefault();

    if (!user?.id || !selectedConversation?.otherUserId || !messageText.trim()) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const response = await fetch(MESSAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("reelioToken") ? { Authorization: `Bearer ${localStorage.getItem("reelioToken")}` } : {}),
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConversation.otherUserId,
          text: messageText.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send message.");
      }

      setMessageText("");
      await loadConversation(selectedConversation);
    } catch (requestError) {
      setError(requestError.message || "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  }

  function openUserConversation(result) {
    const conversation = {
      otherUserId: result.id,
      latestMessage: "",
      latestMessageAt: new Date().toISOString(),
      read: true,
      unreadCount: 0,
      otherUser: result,
    };

    setSearchText("");
    setSearchResults([]);
    loadConversation(conversation);
  }

  return (
    <div className="grid gap-6 pb-12 lg:grid-cols-[0.35fr_0.65fr]">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold">Messages</h1>
          <Badge tone="white">{inbox.length} chats</Badge>
        </div>

        <div className="mt-5">
          <Input
            placeholder="Search clients or creators..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search clients or creators"
          />
          {searchText && (
            <div className="mt-3 space-y-2">
              {isSearchingUsers && <p className="rounded-2xl bg-white/68 p-3 text-sm font-semibold text-reelio-muted">Searching...</p>}
              {!isSearchingUsers && searchResults.length === 0 && (
                <p className="rounded-2xl bg-white/68 p-3 text-sm font-semibold text-reelio-muted">No users found.</p>
              )}
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center gap-3 rounded-2xl bg-white/68 p-3">
                  <img
                    className="h-11 w-11 rounded-full object-cover"
                    src={
                      result.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || "User")}&background=F2EAFE&color=8B5CF6`
                    }
                    alt={result.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{result.name}</p>
                    <p className="truncate text-xs text-reelio-muted">
                      {result.role} | {result.skillTitle || "Reelio member"} | {result.followersCount || 0} followers
                    </p>
                  </div>
                  <Button size="sm" onClick={() => openUserConversation(result)}>
                    Message
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingInbox && (
            <div className="rounded-2xl bg-white/68 p-4 text-sm font-semibold text-reelio-muted">Loading inbox...</div>
          )}
          {!isLoadingInbox && inbox.length === 0 && !error && (
            <div className="rounded-2xl bg-white/68 p-4 text-sm font-semibold text-reelio-muted">No messages yet.</div>
          )}
          {inbox.map((conversation) => {
            const isSelected = selectedConversation?.otherUserId === conversation.otherUserId;

            return (
              <button
                key={conversation.otherUserId}
                className={`w-full rounded-2xl p-4 text-left transition ${
                  isSelected ? "bg-reelio-lavender/80" : "bg-white/68 hover:bg-white"
                }`}
                onClick={() => loadConversation(conversation)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-reelio-lilac to-reelio-sky font-black text-reelio-purple">
                    {getContactName(conversation)[0]}
                    {!conversation.read && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-bold">{getContactName(conversation)}</p>
                      <span className="whitespace-nowrap text-xs font-semibold text-reelio-muted">
                        {formatTime(conversation.latestMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-reelio-muted">{conversation.latestMessage}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="flex min-h-[32rem] flex-col">
        <div className="flex items-center justify-between border-b border-white/70 pb-4">
          <div>
            <h2 className="text-xl font-extrabold">
              {selectedConversation ? getContactName(selectedConversation) : "Select a conversation"}
            </h2>
            <p className="text-sm text-reelio-muted">
              {selectedConversation ? selectedConversation.otherUser?.role || "Reelio member" : "Open a chat from your inbox"}
            </p>
          </div>
          {selectedConversation && <Badge tone="green">Active</Badge>}
        </div>

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}

        <div className="flex flex-1 flex-col justify-end gap-3 overflow-y-auto py-6">
          {isLoadingConversation && (
            <div className="rounded-2xl bg-white/68 p-4 text-sm font-semibold text-reelio-muted">Loading conversation...</div>
          )}
          {!selectedConversation && !isLoadingConversation && (
            <div className="rounded-2xl bg-white/68 p-4 text-sm font-semibold text-reelio-muted">
              Choose a message thread to start chatting.
            </div>
          )}
          {selectedConversation && !isLoadingConversation && messages.length === 0 && (
            <div className="rounded-2xl bg-white/68 p-4 text-sm font-semibold text-reelio-muted">
              No messages in this conversation yet.
            </div>
          )}
          {messages.map((message) => (
            <Bubble
              key={message._id}
              align={message.senderId === user?.id ? "right" : "left"}
              time={formatTime(message.createdAt)}
            >
              {message.text}
            </Bubble>
          ))}
        </div>

        <form className="flex gap-3" onSubmit={handleSend}>
          <Input
            className="h-12"
            placeholder="Write a message..."
            aria-label="Message"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            disabled={!selectedConversation || isSending}
          />
          <button
            className="rounded-2xl bg-gradient-to-r from-reelio-purple to-reelio-blue px-5 font-bold text-white shadow-button disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedConversation || isSending || !messageText.trim()}
            type="submit"
          >
            {isSending ? "Sending" : "Send"}
          </button>
        </form>
      </Card>
    </div>
  );
}

function Bubble({ children, align, time }) {
  return (
    <div
      className={`max-w-[82%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${
        align === "right"
          ? "self-end bg-gradient-to-r from-reelio-purple to-reelio-blue text-white"
          : "self-start bg-white/78 text-reelio-ink"
      }`}
    >
      <p>{children}</p>
      <p className={`mt-1 text-[11px] font-semibold ${align === "right" ? "text-white/75" : "text-reelio-muted"}`}>{time}</p>
    </div>
  );
}
