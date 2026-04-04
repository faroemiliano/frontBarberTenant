export default function Modal({
  children,
  onClose,
  className = "",
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className="modal-overlay">
      <div className={`modal-box ${className}`}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
