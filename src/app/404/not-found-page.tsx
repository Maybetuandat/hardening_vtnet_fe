import React from "react";
import { useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Flag Icon */}
        <div className="flex justify-center mb-8">
          <Flag className="w-16 h-16 text-gray-800" fill="currentColor" />
        </div>

        {/* Error 404 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Error 404</h1>

        {/* Main message */}
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          It looks like something went wrong.
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          Don't worry, our team is already on it. Please try
          <br />
          refreshing the page or come back later.
        </p>

        {/* Back Home Button */}
        <button
          onClick={handleBackHome}
          className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          BACK HOME
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
