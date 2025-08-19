import './Button.scss';

const Button = ({ ...props }) => {
  const { type, label, action, onClick, className, disabled } = props;
  return (
    <button className={`btn btn-${action} ${className}`} type={type || 'button'} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
