export const lightTheme = {
  background: {
    primary: "from-neutral-100 to-neutral-200",
    card: "bg-neutral-200",
    hover: "hover:bg-neutral-300",
  },
  text: {
    primary: "text-neutral-900",
    secondary: "text-neutral-700",
    tertiary: "text-neutral-600",
    inverse: "text-white",
  },
  border: {
    primary: "border-neutral-300",
  },
  button: {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-neutral-300 hover:bg-neutral-400 text-neutral-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  },
  tabBar: {
    active: "text-blue-600 bg-blue-100",
    inactive: "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-300",
  },
  calendar: {
    background: "bg-neutral-200",
    text: "text-neutral-900",
    border: "border-neutral-300",
    today: "bg-blue-100",
    event: "bg-blue-500 text-white",
    hover: "hover:bg-neutral-300",
  },
};

export const darkTheme = {
  background: {
    primary: "from-gray-900 to-gray-800",
    card: "bg-gray-800",
    hover: "hover:bg-gray-700",
  },
  text: {
    primary: "text-white",
    secondary: "text-gray-300",
    tertiary: "text-gray-400",
    inverse: "text-gray-900",
  },
  border: {
    primary: "border-gray-700",
  },
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  },
  tabBar: {
    active: "text-blue-400 bg-gray-700",
    inactive: "text-gray-400 hover:text-gray-200 hover:bg-gray-700",
  },
  calendar: {
    background: "bg-gray-800",
    text: "text-gray-200",
    border: "border-gray-700",
    today: "bg-blue-900",
    event: "bg-blue-600 text-white",
    hover: "hover:bg-gray-700",
  },
};

export type Theme = typeof lightTheme;
