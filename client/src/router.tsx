import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MessagesManagement from "@/components/MessagesManagement";

// Add Pages
import AddCategory from "@/components/AddCategory";
import EditCategory from "@/components/EditCategory";
import ViewCategory from "@/components/ViewCategory";
import CategoriesManagement from "@/components/CategoriesManagement";

import AddAnnouncement from "@/components/AddAnnouncement";
import AnnouncementsManagement from "@/components/AnnouncementsManagement";

import AddAd from "@/components/AddAd";
import AdsManagement from "@/components/AdsManagement";

// Import other management components
import EncountersManagement from "@/components/EncountersManagement";
import ChallengesManagement from "@/components/ChallengesManagement";
import EntranceEffectsManagement from "@/components/EntranceEffectsManagement";
import PartyThemesManagement from "@/components/PartyThemesManagement";
import CommentsManagement from "@/components/CommentsManagement";
import CallsManagement from "@/components/CallsManagement";
import ClicksManagement from "@/components/ClicksManagement";
import PostsManagement from "@/components/PostsManagement";
import StreamingManagement from "@/components/StreamingManagement";
import VideosManagement from "@/components/VideosManagement";
import WithdrawalsManagement from "@/components/WithdrawalsManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin/messages",
    element: <MessagesManagement />,
  },
  // Categories Routes
  {
    path: "/admin/categories",
    element: <CategoriesManagement />,
  },
  {
    path: "/admin/categories/add",
    element: <AddCategory />,
  },
  {
    path: "/admin/categories/edit",
    element: <EditCategory />,
  },
  {
    path: "/admin/categories/view",
    element: <ViewCategory />,
  },
  // Announcements Routes
  {
    path: "/admin/announcements",
    element: <AnnouncementsManagement />,
  },
  {
    path: "/admin/announcements/add",
    element: <AddAnnouncement />,
  },
  // Ads Routes
  {
    path: "/admin/ads",
    element: <AdsManagement />,
  },
  {
    path: "/admin/ads/add",
    element: <AddAd />,
  },
  // Other Management Routes
  {
    path: "/admin/encounters",
    element: <EncountersManagement />,
  },
  {
    path: "/admin/challenges",
    element: <ChallengesManagement />,
  },
  {
    path: "/admin/entrance-effects",
    element: <EntranceEffectsManagement />,
  },
  {
    path: "/admin/party-themes",
    element: <PartyThemesManagement />,
  },
  {
    path: "/admin/comments",
    element: <CommentsManagement />,
  },
  {
    path: "/admin/calls",
    element: <CallsManagement />,
  },
  {
    path: "/admin/clicks",
    element: <ClicksManagement />,
  },
  {
    path: "/admin/posts",
    element: <PostsManagement />,
  },
  {
    path: "/admin/streaming",
    element: <StreamingManagement />,
  },
  {
    path: "/admin/videos",
    element: <VideosManagement />,
  },
  {
    path: "/admin/withdrawals",
    element: <WithdrawalsManagement />,
  },
]);