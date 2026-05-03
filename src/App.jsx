import React, { useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import { creators } from "./data/mockData.js";
import { LoginPage, SignupPage } from "./pages/AuthPages.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DiscoverPage from "./pages/DiscoverPage.jsx";
import HireRequestPage from "./pages/HireRequestPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PublicProfilePage from "./pages/PublicProfilePage.jsx";
import ReelsPage from "./pages/ReelsPage.jsx";
import RoleSelectionPage from "./pages/RoleSelectionPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
  const [page, setPage] = useState("landing");
  const [role, setRole] = useState(() => localStorage.getItem("reelioRole"));
  const [selectedCreatorId, setSelectedCreatorId] = useState(1);
  const [selectedCreatorOverride, setSelectedCreatorOverride] = useState(null);

  const selectedCreator = useMemo(
    () => selectedCreatorOverride || creators.find((creator) => creator.id === selectedCreatorId),
    [selectedCreatorId, selectedCreatorOverride]
  );

  function navigate(nextPage, creator) {
    if (creator && typeof creator === "object") {
      setSelectedCreatorOverride(creator);
      setSelectedCreatorId(creator.id || creator._id);
    } else if (creator) {
      setSelectedCreatorOverride(null);
      setSelectedCreatorId(creator);
    }

    if (!role && ["home", "discover", "reels", "dashboard", "hire", "messages", "myProfile", "settings"].includes(nextPage)) {
      setPage("role");
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAuthSuccess(user) {
    const nextRole = user.role;

    setRole(nextRole);
    setPage(nextRole === "creator" ? "dashboard" : "discover");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const pageContent = {
    landing: <LandingPage navigate={navigate} setRole={setRole} />,
    role: <RoleSelectionPage navigate={navigate} setRole={setRole} />,
    login: <LoginPage navigate={navigate} onAuthSuccess={handleAuthSuccess} />,
    signup: <SignupPage navigate={navigate} onAuthSuccess={handleAuthSuccess} />,
    home: <HomePage navigate={navigate} />,
    discover: <DiscoverPage navigate={navigate} />,
    reels: <ReelsPage navigate={navigate} />,
    publicProfile: <PublicProfilePage creator={selectedCreator} navigate={navigate} />,
    myProfile: <ProfilePage navigate={navigate} setRole={setRole} />,
    hire: <HireRequestPage creator={selectedCreator} navigate={navigate} />,
    dashboard: <DashboardPage navigate={navigate} />,
    messages: <MessagesPage />,
    settings: <SettingsPage role={role} setRole={setRole} navigate={navigate} />,
  };

  return (
    <Layout navigate={navigate} role={role} setRole={setRole}>
      {pageContent[page] || pageContent.landing}
    </Layout>
  );
}
