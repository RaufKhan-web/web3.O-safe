import React from "react";

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-teal-800 text-black">
            <div className="flex flex-col items-center">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                {/* Loading Text */}
                <p className="mt-4 pl-2 text-lg font-semibold animate-pulse">Loading...</p>
            </div>
        </div>
    );
};

export default Loading;