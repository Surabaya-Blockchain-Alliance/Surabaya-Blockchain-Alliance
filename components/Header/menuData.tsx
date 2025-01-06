import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Events",
    newTab: false,
    path: "/#events",
  },
  {
    id: 2.1,
    title: "Blog",
    newTab: false,
    path: "/blog",
  },

  {
    id: 4,
    title: "Trending Quests",
    newTab: true,
    path: "/support",
  },
];

export default menuData;
