"use client";

export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-[448px] mx-auto z-50 toast-enter">
      <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg text-center text-sm">
        {message}
      </div>
    </div>
  );
}
