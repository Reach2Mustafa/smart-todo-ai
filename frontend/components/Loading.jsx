import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <div className="flex animate-pulse items-center gap-4">
                <GalleryVerticalEnd className="h-8 w-8 text-primary" />
                <div className="text-lg font-semibold text-gray-700">SmartList</div>
            </div>
        </div>
    );
};

export default Loading;
