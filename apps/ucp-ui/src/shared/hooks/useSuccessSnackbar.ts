import { useState } from "react";

const useSuccessSnackbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string>();

  const handleCloseSuccessSnackbar = () => setIsOpen(false);
  const handleOpenSuccessSnackbar = () => setIsOpen(true);
  const handleOpenSuccessSnackbarWithMessage = (newMessage: string) => {
    setMessage(newMessage);
    handleOpenSuccessSnackbar();
  };

  return {
    handleOpenSuccessSnackbarWithMessage,
    successSnackbarProps: {
      message,
      onClose: handleCloseSuccessSnackbar,
      open: isOpen,
    },
  };
};

export default useSuccessSnackbar;
