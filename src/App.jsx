import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BracketProvider } from "./context.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import HeroesPage from "./pages/HeroesPage.jsx";
import HeroDetailPage from "./pages/HeroDetailPage.jsx";
import PlayersPage from "./pages/PlayersPage.jsx";
import PlayerDetailPage from "./pages/PlayerDetailPage.jsx";
import TeamsPage from "./pages/TeamsPage.jsx";
import TeamDetailPage from "./pages/TeamDetailPage.jsx";
import MatchesPage from "./pages/MatchesPage.jsx";
import MatchDetailPage from "./pages/MatchDetailPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";

export default function App() {
  return (
    <BracketProvider>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/heroes" element={<HeroesPage />} />
          <Route path="/heroes/:slug" element={<HeroDetailPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </BracketProvider>
  );
}
