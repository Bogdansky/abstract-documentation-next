interface BurgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function BurgerButton({ isOpen, onClick }: BurgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-[150] p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200 shadow-lg"
      aria-label="Toggle menu"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`block w-5 h-0.5 bg-white transform transition-transform duration-300 ${
            isOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-white transition-opacity duration-300 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-white transform transition-transform duration-300 ${
            isOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
          }`}
        />
      </div>
    </button>
  );
}
