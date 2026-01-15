export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
                <p className="text-sm font-medium text-gray-500">Loading...</p>
            </div>
        </div>
    );
}
