interface PlaceholderTextProps {
  content: string;
  style: React.CSSProperties;
}

export const PlaceholderText = ({ content, style }: PlaceholderTextProps) => {
  // Split content by placeholder pattern {{something}}
  const parts = content.split(/(\{\{[^}]+\}\})/g);

  return (
    <div style={style}>
      {parts.map((part, index) => {
        // Check if this part is a placeholder
        if (part.match(/^\{\{[^}]+\}\}$/)) {
          return (
            <span
              key={index}
              className="inline-block px-2 py-0.5 mx-0.5 bg-primary/20 text-primary rounded text-xs font-mono border border-primary/30"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};
