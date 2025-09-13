export default function Logo() {
  return (
    <div className="flex items-center gap-2 relative leading-none">
      <span className="absolute inset-0 flex justify-center items-center -z-10 pointer-events-none">
        <span className="bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-400 dark:from-blue-400 dark:via-indigo-500 dark:to-purple-300 bg-clip-text text-transparent filter blur-3xl opacity-40 animate-pulse">
          JustFlow
        </span>
      </span>
      <span className="absolute inset-0 bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-400 dark:from-blue-400 dark:via-indigo-500 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-[0_8px_32px_rgba(99,102,241,0.35)]">
        JustFlow
      </span>
      <span className="relative text-foreground/10 dark:text-gray-700/10 ">
        JustFlow
      </span>
    </div>
  );
}
