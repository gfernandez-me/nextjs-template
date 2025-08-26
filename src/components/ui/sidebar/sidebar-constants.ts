// Sidebar configuration constants
export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_WIDTH_ICON = "4rem"; // Increased for better spacing
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// Sidebar state types
export type SidebarState = "expanded" | "collapsed";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "offcanvas" | "icon" | "none";
export type SidebarSide = "left" | "right";
