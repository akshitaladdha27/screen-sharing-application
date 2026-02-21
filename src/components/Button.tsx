interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button = ({ children, onClick, disabled, loading }: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold
                 hover:bg-indigo-700 transition
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;