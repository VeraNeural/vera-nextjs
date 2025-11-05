export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-4">
      <div className="w-2 h-2 bg-orb-purple rounded-full animate-typingBounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-orb-purple rounded-full animate-typingBounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-orb-purple rounded-full animate-typingBounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}