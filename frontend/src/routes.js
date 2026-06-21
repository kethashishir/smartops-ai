export const sectionRoutes = {
  dashboard: {
    path: "/",
    eyebrow: "Operations Dashboard",
    title: "SmartOps AI",
    description:
      "Monitor inventory health, stock levels, and reorder recommendations.",
  },
  assistant: {
    path: "/assistant",
    eyebrow: "SmartOps Copilot",
    title: "Assistant",
    description:
      "Ask operational questions about products, inventory, orders, forecasts, and recommendations.",
  },
  products: {
    path: "/products",
    eyebrow: "Inventory Control",
    title: "Products",
    description:
      "Create products, update stock levels, and monitor inventory health.",
  },
  orders: {
    path: "/orders",
    eyebrow: "Order Activity",
    title: "Orders",
    description: "Create customer orders and track recent order history.",
  },
  forecasts: {
    path: "/forecasts",
    eyebrow: "Demand Planning",
    title: "Forecasts",
    description:
      "Generate demand forecasts from order history and refresh planning data.",
  },
  recommendations: {
    path: "/recommendations",
    eyebrow: "Reorder Planning",
    title: "Recommendations",
    description:
      "Review suggested reorder quantities based on demand forecasts and current stock.",
  },
};

export const pathToSection = Object.entries(sectionRoutes).reduce(
  (acc, [sectionName, route]) => ({
    ...acc,
    [route.path]: sectionName,
  }),
  {},
);
