export const getServerStatusColor = (status: string): string => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "offline":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

export const getExecutionStatusColor = (status: string): string => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "failed":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};
