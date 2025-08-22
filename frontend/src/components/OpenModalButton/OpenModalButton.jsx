// src/components/OpenModalButton/OpenModalButton.jsx
import { useModal } from "../context/Modal";

function OpenModalButton({
  modalComponent, // component to render inside the modal
  buttonText,     // text of the button
  buttonClass,    // optional: CSS class for styling
  onButtonClick,  // optional: callback on button click
  onModalClose,   // optional: callback on modal close
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    setModalContent(modalComponent);
    if (typeof onButtonClick === "function") onButtonClick();
  };

  return (
    <button onClick={onClick} className={buttonClass || ""}>
      {buttonText}
    </button>
  );
}

export default OpenModalButton;
