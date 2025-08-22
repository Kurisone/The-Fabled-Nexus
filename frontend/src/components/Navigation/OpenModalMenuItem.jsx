// OpenModalMenuItem.jsx
import { useModal } from "../../context/Modal";

function OpenModalMenuItem({
  modalComponent,
  itemText,
  itemClass,
  onItemClick,
  onModalClose,
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    setModalContent(modalComponent);
    if (typeof onItemClick === "function") onItemClick();
  };

  return (
    <button onClick={onClick} className={itemClass || "menu-item"}>
      {itemText}
    </button>
  );
}

export default OpenModalMenuItem;
